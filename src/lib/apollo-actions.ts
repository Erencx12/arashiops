"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import {
  getIntegrationBySlug, getCredentialValue, getCredentialValueByService,
  createJob, updateJobStatus, updateIntegrationHealth,
  createApolloLeadsBatch, getApolloLeadCount,
  createSyncHistory, completeSyncHistory,
  addSystemLog, createNotification,
} from "./queries";

const SearchSchema = z.object({
  query:       z.string().optional(),
  title:       z.string().optional(),
  industry:    z.string().optional(),
  companySize: z.string().optional(),
  location:    z.string().optional(),
  limit:       z.string().optional(),
});

export type ApolloSearchResult = {
  id?: string;
  name: string;
  title?: string;
  company?: string;
  email?: string;
  linkedin_url?: string;
  industry?: string;
  company_size?: string;
  location?: string;
};

export type ApolloSearchState = {
  error?: string;
  results?: ApolloSearchResult[];
  total?: number;
} | null;

export async function searchApolloAction(
  _prev: ApolloSearchState,
  formData: FormData
): Promise<ApolloSearchState> {
  const integ = await getIntegrationBySlug("apollo");
  if (!integ) return { error: "Apollo integration not found" };

  const apiKey = await getCredentialValue(integ.id);
  if (!apiKey) return { error: "Apollo API key not configured. Add your key in the API Vault." };

  const parsed = SearchSchema.safeParse({
    query:       formData.get("query") || undefined,
    title:       formData.get("title") || undefined,
    industry:    formData.get("industry") || undefined,
    companySize: formData.get("companySize") || undefined,
    location:    formData.get("location") || undefined,
    limit:       formData.get("limit") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { query, title, industry, location, limit } = parsed.data;

  try {
    const payload: Record<string, unknown> = {
      api_key: apiKey,
      page:    1,
      per_page: Math.min(Number(limit ?? 25), 100),
    };
    if (query)    payload.q_keywords = query;
    if (title)    payload.person_titles = [title];
    if (industry) payload.organization_industry_tag_ids = [industry];
    if (location) payload.person_locations = [location];

    const res = await fetch("https://api.apollo.io/v1/mixed_people/search", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Apollo API error ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    const people: ApolloSearchResult[] = (data.people ?? []).map((p: Record<string, unknown>) => ({
      id:           String(p.id ?? ""),
      name:         String(p.name ?? "Unknown"),
      title:        String(p.title ?? ""),
      company:      String((p.organization as Record<string, unknown>)?.name ?? p.organization_name ?? ""),
      email:        p.email ? String(p.email) : undefined,
      linkedin_url: p.linkedin_url ? String(p.linkedin_url) : undefined,
      industry:     String((p.organization as Record<string, unknown>)?.industry ?? ""),
      company_size: String((p.organization as Record<string, unknown>)?.estimated_num_employees ?? ""),
      location:     String(p.city ?? p.state ?? ""),
    }));

    await addSystemLog({
      eventType: "integration",
      level:     "info",
      message:   `Apollo search returned ${people.length} results`,
      module:    "apollo",
    });

    return { results: people, total: data.pagination?.total_entries ?? people.length };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Apollo search failed";
    await addSystemLog({ eventType: "integration", level: "error", message: msg, module: "apollo" });
    return { error: msg };
  }
}

export async function importApolloLeadsAction(
  leads: ApolloSearchResult[],
  clientId?: number
): Promise<{ success: boolean; imported: number; error?: string }> {
  const integ = await getIntegrationBySlug("apollo");
  if (!integ) return { success: false, imported: 0, error: "Apollo integration not found" };

  const start = Date.now();
  const { id: jobId } = await createJob({
    name:      `Apollo Lead Import (${leads.length} prospects)`,
    source:    "apollo",
    queueType: "incoming",
    payload:   JSON.stringify({ count: leads.length, clientId }),
  });
  const { id: syncId } = await createSyncHistory({ integrationId: integ.id, operation: "import_leads", jobId });

  try {
    await updateJobStatus(jobId, "Running");

    const created = await createApolloLeadsBatch(
      leads.map(l => ({
        name:         l.name,
        company:      l.company ?? null,
        title:        l.title ?? null,
        email:        l.email ?? null,
        linkedinUrl:  l.linkedin_url ?? null,
        industry:     l.industry ?? null,
        companySize:  l.company_size ?? null,
        location:     l.location ?? null,
        apolloId:     l.id ?? null,
        clientId:     clientId ?? null,
        jobId,
      }))
    );

    const duration = Date.now() - start;
    await updateJobStatus(jobId, "Completed");
    await completeSyncHistory(syncId, {
      status: "Success", recordsProcessed: leads.length,
      recordsCreated: created, recordsUpdated: 0, durationMs: duration,
    });
    await updateIntegrationHealth(integ.id, {
      status: "Connected", lastSync: new Date().toISOString(), healthScore: 100,
    });
    await createNotification({
      type:    "client_created",
      title:   "Apollo Import Complete",
      message: `${created} prospects imported from Apollo.`,
    });
    await addSystemLog({
      eventType: "integration", level: "info",
      message:   `Apollo: imported ${created}/${leads.length} leads`,
      module:    "apollo", jobId,
    });
    revalidatePath("/admin/integrations");
    return { success: true, imported: created };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Import failed";
    await updateJobStatus(jobId, "Failed", msg);
    await completeSyncHistory(syncId, {
      status: "Failed", recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, errorMessage: msg,
    });
    await updateIntegrationHealth(integ.id, { status: "Error", lastError: msg, healthScore: 0 });
    return { success: false, imported: 0, error: msg };
  }
}

export async function syncApolloAction(): Promise<{ success: boolean; imported: number; error?: string }> {
  const integ = await getIntegrationBySlug("apollo");
  if (!integ) return { success: false, imported: 0, error: "Apollo integration not found" };

  const apiKey = await getCredentialValue(integ.id);
  if (!apiKey) return { success: false, imported: 0, error: "API key not configured" };

  const start = Date.now();
  const { id: jobId } = await createJob({
    name: "Apollo Auto-Sync", source: "apollo", queueType: "scheduled",
  });
  const { id: syncId } = await createSyncHistory({ integrationId: integ.id, operation: "auto_sync", jobId });

  try {
    await updateJobStatus(jobId, "Running");

    const res = await fetch("https://api.apollo.io/v1/mixed_people/search", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ api_key: apiKey, page: 1, per_page: 50 }),
    });

    if (!res.ok) throw new Error(`Apollo API ${res.status}`);
    const data = await res.json();
    const people = (data.people ?? []) as Record<string, unknown>[];

    const created = await createApolloLeadsBatch(
      people.map(p => ({
        name:        String(p.name ?? "Unknown"),
        company:     String((p.organization as Record<string, unknown>)?.name ?? ""),
        title:       String(p.title ?? ""),
        email:       p.email ? String(p.email) : null,
        linkedinUrl: p.linkedin_url ? String(p.linkedin_url) : null,
        industry:    String((p.organization as Record<string, unknown>)?.industry ?? ""),
        apolloId:    String(p.id ?? ""),
        jobId,
      }))
    );

    const duration = Date.now() - start;
    await updateJobStatus(jobId, "Completed");
    await completeSyncHistory(syncId, {
      status: "Success", recordsProcessed: people.length,
      recordsCreated: created, recordsUpdated: 0, durationMs: duration,
    });
    await updateIntegrationHealth(integ.id, {
      status: "Connected", lastSync: new Date().toISOString(), healthScore: 100,
    });
    revalidatePath("/admin/integrations");
    return { success: true, imported: created };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    await updateJobStatus(jobId, "Failed", msg);
    await completeSyncHistory(syncId, {
      status: "Failed", recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, errorMessage: msg,
    });
    await updateIntegrationHealth(integ.id, { status: "Error", lastError: msg, healthScore: 0 });
    return { success: false, imported: 0, error: msg };
  }
}
