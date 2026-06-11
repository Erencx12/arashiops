"use server";

import { revalidatePath } from "next/cache";
import { claudeComplete, AI_MODEL } from "./claude";
import {
  getAiPromptByCategory, createAiJob, completeAiJob, failAiJob,
  createAiUsage, createLeadScore, createResearchReport, createAiInsight,
  createReplyClassification, createJob, updateJobStatus, addSystemLog,
  createNotification, createAiPrompt, updateAiPrompt, deleteAiPrompt,
  getApolloLeads, getLeadScoreByLeadId, getInstantlyStats,
  getUnscoredLeadCount, getLeadScores, getCrmStats, getClients,
} from "./queries";
import { verifyOwnerSession } from "./dal";

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function getSystemPrompt(category: string): Promise<string> {
  const p = await getAiPromptByCategory(category);
  if (!p) throw new Error(`No active prompt found for category: ${category}`);
  return p.prompt;
}

async function trackUsage(taskType: string, tokens: { input: number; output: number; costUsd: number; durationMs: number }, clientId?: number | null) {
  await createAiUsage({
    taskType,
    model: AI_MODEL,
    tokensInput: tokens.input,
    tokensOutput: tokens.output,
    costUsd: tokens.costUsd,
    responseTimeMs: tokens.durationMs,
    clientId: clientId ?? null,
  });
}

function parseJsonSafe<T>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as T;
  } catch { return null; }
}

// ─── Lead Scoring ─────────────────────────────────────────────────────────────

export async function scoreLeadAction(leadId: number): Promise<{ error?: string; score?: string; reason?: string }> {
  await verifyOwnerSession();
  const leads = await getApolloLeads(undefined, 500);
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return { error: "Lead not found" };

  const existing = await getLeadScoreByLeadId(leadId);
  if (existing) return { error: "Lead is already scored" };

  const job = await createJob({ name: `Score Lead: ${lead.name}`, source: "ai", queueType: "outgoing" });
  await updateJobStatus(job.id, "Running");

  const aiJob = await createAiJob({ jobId: job.id, taskType: "lead_scoring", subjectId: leadId, subjectType: "apollo_lead", subjectName: lead.name });

  try {
    const systemPrompt = await getSystemPrompt("lead_scoring");
    const userPrompt = `Lead:
Name: ${lead.name}
Title: ${lead.title ?? "Unknown"}
Company: ${lead.company ?? "Unknown"}
Industry: ${lead.industry ?? "Unknown"}
Company Size: ${lead.company_size ?? "Unknown"}
Location: ${lead.location ?? "Unknown"}
Email: ${lead.email ? "Available" : "Not available"}
LinkedIn: ${lead.linkedin_url ? "Available" : "Not available"}`;

    const result = await claudeComplete(systemPrompt, userPrompt, 256);
    const parsed = parseJsonSafe<{ score: string; confidence: number; reason: string }>(result.content);

    if (!parsed?.score) {
      await failAiJob(aiJob.id, "Invalid JSON response from Claude");
      await updateJobStatus(job.id, "Failed", "Invalid JSON response");
      return { error: "Claude returned an unexpected response" };
    }

    const scoreRecord = await createLeadScore({
      apolloLeadId: leadId, score: parsed.score, confidence: parsed.confidence,
      reason: parsed.reason, model: AI_MODEL,
      tokensInput: result.inputTokens, tokensOutput: result.outputTokens,
    });

    await completeAiJob(aiJob.id, scoreRecord.id, "lead_score");
    await updateJobStatus(job.id, "Completed");
    await trackUsage("lead_scoring", { input: result.inputTokens, output: result.outputTokens, costUsd: result.costUsd, durationMs: result.durationMs });
    await addSystemLog({ eventType: "automation", level: "info", message: `Lead scored: ${lead.name} → ${parsed.score}`, module: "ai" });

    revalidatePath("/admin/ai/leads");
    return { score: parsed.score, reason: parsed.reason };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await failAiJob(aiJob.id, msg);
    await updateJobStatus(job.id, "Failed", msg);
    return { error: msg };
  }
}

export async function scoreAllUnscoredAction(): Promise<{ error?: string; scored?: number; failed?: number }> {
  await verifyOwnerSession();
  const unscoredCount = await getUnscoredLeadCount();
  if (unscoredCount === 0) return { error: "No unscored leads to process" };

  const leads = await getApolloLeads(undefined, 500);
  const scores = await getLeadScores(500);
  const scoredIds = new Set(scores.map(s => s.apollo_lead_id));
  const unscored = leads.filter(l => !scoredIds.has(l.id)).slice(0, 50);

  if (unscored.length === 0) return { error: "No unscored leads found" };

  const job = await createJob({ name: `Score All Leads (${unscored.length})`, source: "ai", queueType: "outgoing" });
  await updateJobStatus(job.id, "Running");

  let scored = 0;
  let failed = 0;

  try {
    const systemPrompt = await getSystemPrompt("lead_scoring");

    for (const lead of unscored) {
      try {
        const userPrompt = `Lead:
Name: ${lead.name}
Title: ${lead.title ?? "Unknown"}
Company: ${lead.company ?? "Unknown"}
Industry: ${lead.industry ?? "Unknown"}
Company Size: ${lead.company_size ?? "Unknown"}
Location: ${lead.location ?? "Unknown"}
Email: ${lead.email ? "Available" : "Not available"}
LinkedIn: ${lead.linkedin_url ? "Available" : "Not available"}`;

        const result = await claudeComplete(systemPrompt, userPrompt, 256);
        const parsed = parseJsonSafe<{ score: string; confidence: number; reason: string }>(result.content);

        if (parsed?.score) {
          await createLeadScore({
            apolloLeadId: lead.id, score: parsed.score, confidence: parsed.confidence,
            reason: parsed.reason, model: AI_MODEL,
            tokensInput: result.inputTokens, tokensOutput: result.outputTokens,
          });
          await trackUsage("lead_scoring", { input: result.inputTokens, output: result.outputTokens, costUsd: result.costUsd, durationMs: result.durationMs });
          scored++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    await updateJobStatus(job.id, "Completed");
    await addSystemLog({ eventType: "automation", level: "info", message: `Batch lead scoring: ${scored} scored, ${failed} failed`, module: "ai", jobId: job.id });
    await createNotification({ type: "approval_completed" as any, title: "Lead Scoring Complete", message: `${scored} leads scored by Claude AI.` });

    revalidatePath("/admin/ai/leads");
    revalidatePath("/admin/ai");
    return { scored, failed };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await updateJobStatus(job.id, "Failed", msg);
    return { error: msg };
  }
}

// ─── Prospect Research ────────────────────────────────────────────────────────

export async function researchProspectAction(
  _prev: { error?: string; reportId?: number } | null,
  formData: FormData
): Promise<{ error?: string; reportId?: number }> {
  await verifyOwnerSession();
  const name    = (formData.get("name")    as string)?.trim();
  const title   = (formData.get("title")   as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const industry = (formData.get("industry") as string)?.trim();
  const notes   = (formData.get("notes")   as string)?.trim();

  if (!name) return { error: "Name is required" };

  const job = await createJob({ name: `Prospect Research: ${name}`, source: "ai", queueType: "outgoing" });
  await updateJobStatus(job.id, "Running");

  try {
    const systemPrompt = await getSystemPrompt("research");
    const userPrompt = `Prospect:
Name: ${name}
Title: ${title || "Unknown"}
Company: ${company || "Unknown"}
Industry: ${industry || "Unknown"}
Additional notes: ${notes || "None"}`;

    const result = await claudeComplete(systemPrompt, userPrompt, 1024);
    const report = await createResearchReport({
      reportType: "prospect", subjectName: name, subjectCompany: company || null,
      inputData: userPrompt, reportMarkdown: result.content,
      model: AI_MODEL, tokensInput: result.inputTokens, tokensOutput: result.outputTokens,
    });

    await updateJobStatus(job.id, "Completed");
    await trackUsage("prospect_research", { input: result.inputTokens, output: result.outputTokens, costUsd: result.costUsd, durationMs: result.durationMs });
    await addSystemLog({ eventType: "automation", level: "info", message: `Prospect research generated for: ${name}`, module: "ai", jobId: job.id });

    revalidatePath("/admin/ai/research");
    return { reportId: report.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await updateJobStatus(job.id, "Failed", msg);
    return { error: msg };
  }
}

export async function researchAccountAction(
  _prev: { error?: string; reportId?: number } | null,
  formData: FormData
): Promise<{ error?: string; reportId?: number }> {
  await verifyOwnerSession();
  const company  = (formData.get("company")  as string)?.trim();
  const industry = (formData.get("industry") as string)?.trim();
  const website  = (formData.get("website")  as string)?.trim();
  const size     = (formData.get("size")     as string)?.trim();
  const notes    = (formData.get("notes")    as string)?.trim();

  if (!company) return { error: "Company name is required" };

  const job = await createJob({ name: `Account Research: ${company}`, source: "ai", queueType: "outgoing" });
  await updateJobStatus(job.id, "Running");

  try {
    const systemPrompt = await getSystemPrompt("research");
    const userPrompt = `Company:
Name: ${company}
Industry: ${industry || "Unknown"}
Website: ${website || "Unknown"}
Size: ${size || "Unknown"}
Additional notes: ${notes || "None"}`;

    const result = await claudeComplete(systemPrompt, userPrompt, 1024);
    const report = await createResearchReport({
      reportType: "account", subjectName: company, subjectCompany: company,
      inputData: userPrompt, reportMarkdown: result.content,
      model: AI_MODEL, tokensInput: result.inputTokens, tokensOutput: result.outputTokens,
    });

    await updateJobStatus(job.id, "Completed");
    await trackUsage("account_research", { input: result.inputTokens, output: result.outputTokens, costUsd: result.costUsd, durationMs: result.durationMs });
    await addSystemLog({ eventType: "automation", level: "info", message: `Account research generated for: ${company}`, module: "ai", jobId: job.id });

    revalidatePath("/admin/ai/research");
    return { reportId: report.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await updateJobStatus(job.id, "Failed", msg);
    return { error: msg };
  }
}

export async function summarizeDiscoveryAction(
  _prev: { error?: string; reportId?: number } | null,
  formData: FormData
): Promise<{ error?: string; reportId?: number }> {
  await verifyOwnerSession();
  const company = (formData.get("company") as string)?.trim();
  const contact = (formData.get("contact") as string)?.trim();
  const notes   = (formData.get("notes")   as string)?.trim();

  if (!notes) return { error: "Call notes are required" };

  const job = await createJob({ name: `Discovery Summary: ${company || contact || "Unknown"}`, source: "ai", queueType: "outgoing" });
  await updateJobStatus(job.id, "Running");

  try {
    const systemPrompt = await getSystemPrompt("research");
    const userPrompt = `Discovery call with ${contact || "Unknown"} from ${company || "Unknown"}:

${notes}`;

    const result = await claudeComplete(systemPrompt, userPrompt, 1024);
    const report = await createResearchReport({
      reportType: "discovery", subjectName: contact || company || "Discovery Call",
      subjectCompany: company || null,
      inputData: userPrompt, reportMarkdown: result.content,
      model: AI_MODEL, tokensInput: result.inputTokens, tokensOutput: result.outputTokens,
    });

    await updateJobStatus(job.id, "Completed");
    await trackUsage("discovery_summary", { input: result.inputTokens, output: result.outputTokens, costUsd: result.costUsd, durationMs: result.durationMs });
    await addSystemLog({ eventType: "automation", level: "info", message: `Discovery summary generated for: ${company || contact}`, module: "ai", jobId: job.id });

    revalidatePath("/admin/ai/research");
    return { reportId: report.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await updateJobStatus(job.id, "Failed", msg);
    return { error: msg };
  }
}

// ─── Campaign Analysis ────────────────────────────────────────────────────────

export async function analyzeCampaignAction(campaignId: string, campaignName: string): Promise<{ error?: string; insightId?: number }> {
  await verifyOwnerSession();
  const stats = await getInstantlyStats();

  const job = await createJob({ name: `Campaign Analysis: ${campaignName}`, source: "ai", queueType: "outgoing" });
  await updateJobStatus(job.id, "Running");

  try {
    const systemPrompt = await getSystemPrompt("analysis");
    const userPrompt = `Campaign: ${campaignName}
Campaign ID: ${campaignId}
Total Sent: ${stats.totalSent}
Total Replied: ${stats.totalReplied}
Total Meetings: ${stats.totalMeetings}
Total Campaigns: ${stats.campaigns}

Note: Aggregated stats shown (per-campaign breakdown not available). Analyze what you can infer.`;

    const result = await claudeComplete(systemPrompt, userPrompt, 1024);
    const insight = await createAiInsight({
      insightType: "campaign_analysis", title: `Campaign Analysis: ${campaignName}`,
      subjectName: campaignName, inputData: userPrompt, insightMarkdown: result.content,
      model: AI_MODEL, tokensInput: result.inputTokens, tokensOutput: result.outputTokens,
    });

    await updateJobStatus(job.id, "Completed");
    await trackUsage("campaign_analysis", { input: result.inputTokens, output: result.outputTokens, costUsd: result.costUsd, durationMs: result.durationMs });
    await addSystemLog({ eventType: "automation", level: "info", message: `Campaign analysis generated for: ${campaignName}`, module: "ai", jobId: job.id });

    revalidatePath("/admin/ai/insights");
    return { insightId: insight.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await updateJobStatus(job.id, "Failed", msg);
    return { error: msg };
  }
}

// ─── ICP Analysis ─────────────────────────────────────────────────────────────

export async function analyzeIcpAction(): Promise<{ error?: string; insightId?: number }> {
  await verifyOwnerSession();
  const scores = await getLeadScores(500);
  const hotWarm = scores.filter(s => s.score === "Hot" || s.score === "Warm");
  if (hotWarm.length === 0) return { error: "Need at least some Hot/Warm leads to generate an ICP analysis" };

  const job = await createJob({ name: "ICP Analysis", source: "ai", queueType: "outgoing" });
  await updateJobStatus(job.id, "Running");

  try {
    const systemPrompt = await getSystemPrompt("analysis");
    const leadSummary = hotWarm.slice(0, 30).map(s =>
      `- ${s.lead_name} at ${s.lead_company ?? "Unknown"} (${s.score}, ${s.confidence ?? "?"}% confidence): ${s.reason ?? "no reason"}`
    ).join("\n");

    const userPrompt = `Hot + Warm leads (${hotWarm.length} total, showing up to 30):
${leadSummary}

Generate an ICP profile from these qualified leads.`;

    const result = await claudeComplete(systemPrompt, userPrompt, 1500);
    const insight = await createAiInsight({
      insightType: "icp_analysis", title: `ICP Analysis — ${new Date().toLocaleDateString()}`,
      inputData: userPrompt, insightMarkdown: result.content,
      model: AI_MODEL, tokensInput: result.inputTokens, tokensOutput: result.outputTokens,
    });

    await updateJobStatus(job.id, "Completed");
    await trackUsage("icp_analysis", { input: result.inputTokens, output: result.outputTokens, costUsd: result.costUsd, durationMs: result.durationMs });
    await addSystemLog({ eventType: "automation", level: "info", message: `ICP analysis generated from ${hotWarm.length} qualified leads`, module: "ai", jobId: job.id });
    await createNotification({ type: "approval_completed" as any, title: "ICP Analysis Ready", message: `ICP profile generated from ${hotWarm.length} qualified leads.` });

    revalidatePath("/admin/ai/insights");
    revalidatePath("/admin/ai");
    return { insightId: insight.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await updateJobStatus(job.id, "Failed", msg);
    return { error: msg };
  }
}

// ─── Client Summary ───────────────────────────────────────────────────────────

export async function generateClientSummaryAction(clientId: number): Promise<{ error?: string; insightId?: number }> {
  await verifyOwnerSession();
  const clients = await getClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) return { error: "Client not found" };

  const crmStats = await getCrmStats();
  const job = await createJob({ name: `Client Summary: ${client.company_name}`, source: "ai", queueType: "outgoing", clientId });
  await updateJobStatus(job.id, "Running");

  try {
    const systemPrompt = await getSystemPrompt("analysis");
    const userPrompt = `Client: ${client.company_name}
Tier: ${client.tier}
Status: ${client.status}
Monthly Value: $${client.monthly_value}
Industry: ${client.industry}
Health Score: ${client.health_score}/100
Owner: ${client.owner}
Contract Status: ${client.contract_status ?? "Unknown"}
Internal Notes: ${client.internal_notes ?? "None"}
CRM Contacts in System: ${crmStats.totalContacts}
CRM Deals in System: ${crmStats.totalDeals}

Generate a monthly client performance summary.`;

    const result = await claudeComplete(systemPrompt, userPrompt, 1024);
    const insight = await createAiInsight({
      insightType: "client_summary",
      title: `${client.company_name} — Monthly Summary`,
      subjectId: clientId, subjectName: client.company_name,
      inputData: userPrompt, insightMarkdown: result.content,
      model: AI_MODEL, tokensInput: result.inputTokens, tokensOutput: result.outputTokens,
      clientId,
    });

    await updateJobStatus(job.id, "Completed");
    await trackUsage("client_summary", { input: result.inputTokens, output: result.outputTokens, costUsd: result.costUsd, durationMs: result.durationMs }, clientId);
    await addSystemLog({ eventType: "automation", level: "info", message: `Client summary generated for: ${client.company_name}`, module: "ai", jobId: job.id, clientId });

    revalidatePath("/admin/ai/insights");
    return { insightId: insight.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await updateJobStatus(job.id, "Failed", msg);
    return { error: msg };
  }
}

// ─── Reply Classification ─────────────────────────────────────────────────────

export async function classifyReplyAction(
  _prev: { error?: string; classification?: string } | null,
  formData: FormData
): Promise<{ error?: string; classification?: string; reason?: string }> {
  await verifyOwnerSession();
  const campaignId   = (formData.get("campaignId")   as string)?.trim();
  const contactName  = (formData.get("contactName")  as string)?.trim();
  const contactEmail = (formData.get("contactEmail") as string)?.trim();
  const replyText    = (formData.get("replyText")    as string)?.trim();

  if (!replyText) return { error: "Reply text is required" };

  try {
    const systemPrompt = await getSystemPrompt("classification");
    const userPrompt = `From: ${contactName || "Unknown"} <${contactEmail || "unknown"}>
Campaign: ${campaignId || "Unknown"}

Reply:
${replyText}`;

    const result = await claudeComplete(systemPrompt, userPrompt, 256);
    const parsed = parseJsonSafe<{ classification: string; confidence: number; reason: string }>(result.content);
    if (!parsed?.classification) return { error: "Claude returned an unexpected response" };

    await createReplyClassification({
      campaignId: campaignId || null, contactName: contactName || null,
      contactEmail: contactEmail || null, replyText,
      classification: parsed.classification, confidence: parsed.confidence,
      reason: parsed.reason, model: AI_MODEL,
      tokensInput: result.inputTokens, tokensOutput: result.outputTokens,
    });
    await trackUsage("reply_classification", { input: result.inputTokens, output: result.outputTokens, costUsd: result.costUsd, durationMs: result.durationMs });

    revalidatePath("/admin/ai/insights");
    return { classification: parsed.classification, reason: parsed.reason };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ─── Prompt Library CRUD ──────────────────────────────────────────────────────

export async function createAiPromptAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const name        = (formData.get("name")        as string)?.trim();
  const category    = (formData.get("category")    as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const prompt      = (formData.get("prompt")      as string)?.trim();

  if (!name || !category || !prompt) return { error: "Name, category, and prompt are required" };
  await verifyOwnerSession();
  try {
    await createAiPrompt({ name, category, description: description || null, prompt });
    revalidatePath("/admin/ai/prompts");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create prompt" };
  }
}

export async function updateAiPromptAction(id: number, data: {
  name?: string; description?: string | null; prompt?: string; isActive?: boolean;
}): Promise<void> {
  await verifyOwnerSession();
  await updateAiPrompt(id, data);
  revalidatePath("/admin/ai/prompts");
}

export async function deleteAiPromptAction(id: number): Promise<{ error?: string }> {
  await verifyOwnerSession();
  try {
    await deleteAiPrompt(id);
    revalidatePath("/admin/ai/prompts");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to delete prompt" };
  }
}
