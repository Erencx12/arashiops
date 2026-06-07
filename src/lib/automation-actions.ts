"use server";

import { revalidatePath } from "next/cache";
import {
  getIntegrationBySlug, getCredentialValue,
  getWebhooks, recordWebhookTrigger,
  createJob, updateJobStatus, updateIntegrationHealth,
  createSyncHistory, completeSyncHistory,
  addSystemLog, createNotification,
} from "./queries";

type TriggerResult = { success: boolean; error?: string; statusCode?: number };

async function triggerWebhook(
  webhookEndpoint: string,
  payload: Record<string, unknown>,
  secret?: string | null
): Promise<{ ok: boolean; status: number; body: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) headers["X-Webhook-Secret"] = secret;

  const res = await fetch(webhookEndpoint, {
    method:  "POST",
    headers,
    body:    JSON.stringify(payload),
  });
  const body = await res.text();
  return { ok: res.ok, status: res.status, body };
}

// ─── Make.com ─────────────────────────────────────────────────────────────────

export async function triggerMakeScenarioAction(
  webhookId: number,
  eventData?: Record<string, unknown>
): Promise<TriggerResult> {
  const integ = await getIntegrationBySlug("make");
  if (!integ) return { success: false, error: "Make.com integration not found" };

  const webhooks = await getWebhooks();
  const webhook = webhooks.find(w => w.id === webhookId);
  if (!webhook) return { success: false, error: "Webhook not found" };

  const { id: jobId } = await createJob({
    name: `Make.com Trigger: ${webhook.name}`, source: "make", queueType: "outgoing",
    payload: JSON.stringify({ webhookId, eventData }),
  });
  const { id: syncId } = await createSyncHistory({ integrationId: integ.id, operation: "trigger_scenario", jobId });

  try {
    await updateJobStatus(jobId, "Running");

    const payload = {
      source:    "arashi_ops",
      event:     "trigger",
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    const result = await triggerWebhook(webhook.endpoint, payload, webhook.secret);
    const success = result.ok;
    const payloadSize = JSON.stringify(payload).length;

    await recordWebhookTrigger(webhookId, success, payloadSize, result.status, success ? null : result.body.slice(0, 200));
    await updateJobStatus(jobId, success ? "Completed" : "Failed", success ? undefined : `HTTP ${result.status}: ${result.body.slice(0, 100)}`);
    await completeSyncHistory(syncId, {
      status:            success ? "Success" : "Failed",
      recordsProcessed:  1,
      recordsCreated:    0,
      recordsUpdated:    0,
      errorMessage:      success ? null : `HTTP ${result.status}`,
    });

    if (success) {
      await updateIntegrationHealth(integ.id, { status: "Connected", lastSync: new Date().toISOString(), healthScore: 100 });
      await addSystemLog({ eventType: "webhook", level: "info", message: `Make.com scenario triggered: ${webhook.name}`, module: "make", jobId, webhookId });
    } else {
      await updateIntegrationHealth(integ.id, { status: "Error", lastError: `HTTP ${result.status}`, healthScore: 0 });
      await addSystemLog({ eventType: "webhook", level: "error", message: `Make.com trigger failed: HTTP ${result.status}`, module: "make", jobId, webhookId });
    }

    revalidatePath("/admin/integrations");
    return { success, statusCode: result.status, error: success ? undefined : `HTTP ${result.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Trigger failed";
    await updateJobStatus(jobId, "Failed", msg);
    await completeSyncHistory(syncId, { status: "Failed", recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, errorMessage: msg });
    await updateIntegrationHealth(integ.id, { status: "Error", lastError: msg, healthScore: 0 });
    return { success: false, error: msg };
  }
}

// ─── n8n ──────────────────────────────────────────────────────────────────────

export async function triggerN8nWorkflowAction(
  webhookId: number,
  eventData?: Record<string, unknown>
): Promise<TriggerResult> {
  const integ = await getIntegrationBySlug("n8n");
  if (!integ) return { success: false, error: "n8n integration not found" };

  const webhooks = await getWebhooks();
  const webhook = webhooks.find(w => w.id === webhookId);
  if (!webhook) return { success: false, error: "Webhook not found" };

  const { id: jobId } = await createJob({
    name: `n8n Trigger: ${webhook.name}`, source: "n8n", queueType: "outgoing",
    payload: JSON.stringify({ webhookId, eventData }),
  });
  const { id: syncId } = await createSyncHistory({ integrationId: integ.id, operation: "trigger_workflow", jobId });

  try {
    await updateJobStatus(jobId, "Running");

    const payload = {
      source:    "arashi_ops",
      event:     "workflow_trigger",
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    const result = await triggerWebhook(webhook.endpoint, payload, webhook.secret);
    const success = result.ok;

    await recordWebhookTrigger(webhookId, success, JSON.stringify(payload).length, result.status, success ? null : result.body.slice(0, 200));
    await updateJobStatus(jobId, success ? "Completed" : "Failed", success ? undefined : `HTTP ${result.status}`);
    await completeSyncHistory(syncId, {
      status: success ? "Success" : "Failed",
      recordsProcessed: 1, recordsCreated: 0, recordsUpdated: 0,
      errorMessage: success ? null : `HTTP ${result.status}`,
    });

    if (success) {
      await updateIntegrationHealth(integ.id, { status: "Connected", lastSync: new Date().toISOString(), healthScore: 100 });
      await addSystemLog({ eventType: "webhook", level: "info", message: `n8n workflow triggered: ${webhook.name}`, module: "n8n", jobId, webhookId });
    } else {
      await updateIntegrationHealth(integ.id, { status: "Error", lastError: `HTTP ${result.status}`, healthScore: 0 });
      await addSystemLog({ eventType: "webhook", level: "error", message: `n8n trigger failed: HTTP ${result.status}`, module: "n8n", jobId, webhookId });
    }

    revalidatePath("/admin/integrations");
    return { success, statusCode: result.status, error: success ? undefined : `HTTP ${result.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Trigger failed";
    await updateJobStatus(jobId, "Failed", msg);
    await completeSyncHistory(syncId, { status: "Failed", recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, errorMessage: msg });
    return { success: false, error: msg };
  }
}
