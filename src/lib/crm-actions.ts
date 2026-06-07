"use server";

import { revalidatePath } from "next/cache";
import {
  getIntegrationBySlug, getCredentialValue,
  createJob, updateJobStatus, updateIntegrationHealth,
  upsertCrmContact, upsertCrmDeal, getCrmStats,
  createSyncHistory, completeSyncHistory,
  addSystemLog, createNotification,
} from "./queries";

type SyncResult = { success: boolean; synced: number; error?: string };

// ─── HubSpot ──────────────────────────────────────────────────────────────────

async function hubspotFetch(path: string, apiKey: string): Promise<Record<string, unknown>> {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401) throw new Error("HubSpot authentication failed — check your API token");
    if (res.status === 429) throw new Error("HubSpot rate limit exceeded — try again later");
    throw new Error(`HubSpot API error ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function syncHubSpotContactsAction(): Promise<SyncResult> {
  const integ = await getIntegrationBySlug("hubspot");
  if (!integ) return { success: false, synced: 0, error: "HubSpot integration not found" };

  const apiKey = await getCredentialValue(integ.id);
  if (!apiKey) return { success: false, synced: 0, error: "HubSpot API token not configured" };

  const start = Date.now();
  const { id: jobId } = await createJob({ name: "HubSpot Contacts Sync", source: "hubspot", queueType: "incoming" });
  const { id: syncId } = await createSyncHistory({ integrationId: integ.id, operation: "sync_contacts", jobId });

  try {
    await updateJobStatus(jobId, "Running");

    let synced = 0;
    let after: string | undefined;

    do {
      const url = `/crm/v3/objects/contacts?limit=100&properties=firstname,lastname,email,company,jobtitle,phone${after ? `&after=${after}` : ""}`;
      const data = await hubspotFetch(url, apiKey);
      const results = (data.results ?? []) as Record<string, unknown>[];

      for (const contact of results) {
        const props = (contact.properties ?? {}) as Record<string, string>;
        const name = [props.firstname, props.lastname].filter(Boolean).join(" ") || "Unknown";
        await upsertCrmContact({
          source:     "hubspot",
          externalId: String(contact.id),
          name,
          email:    props.email    ?? null,
          company:  props.company  ?? null,
          title:    props.jobtitle ?? null,
          phone:    props.phone    ?? null,
          metadata: JSON.stringify(props),
        });
        synced++;
      }

      const paging = data.paging as Record<string, Record<string, string>> | undefined;
      after = paging?.next?.after;
    } while (after);

    const duration = Date.now() - start;
    await updateJobStatus(jobId, "Completed");
    await completeSyncHistory(syncId, { status: "Success", recordsProcessed: synced, recordsCreated: synced, recordsUpdated: 0, durationMs: duration });
    await updateIntegrationHealth(integ.id, { status: "Connected", lastSync: new Date().toISOString(), healthScore: 100 });
    await createNotification({ type: "client_created", title: "HubSpot Sync", message: `${synced} contacts synced from HubSpot.` });
    await addSystemLog({ eventType: "integration", level: "info", message: `HubSpot: synced ${synced} contacts`, module: "hubspot", jobId });
    revalidatePath("/admin/integrations");
    return { success: true, synced };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "HubSpot sync failed";
    await updateJobStatus(jobId, "Failed", msg);
    await completeSyncHistory(syncId, { status: "Failed", recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, errorMessage: msg });
    await updateIntegrationHealth(integ.id, { status: "Error", lastError: msg, healthScore: 0 });
    return { success: false, synced: 0, error: msg };
  }
}

export async function syncHubSpotDealsAction(): Promise<SyncResult> {
  const integ = await getIntegrationBySlug("hubspot");
  if (!integ) return { success: false, synced: 0, error: "HubSpot integration not found" };

  const apiKey = await getCredentialValue(integ.id);
  if (!apiKey) return { success: false, synced: 0, error: "HubSpot API token not configured" };

  const start = Date.now();
  const { id: jobId } = await createJob({ name: "HubSpot Deals Sync", source: "hubspot", queueType: "incoming" });
  const { id: syncId } = await createSyncHistory({ integrationId: integ.id, operation: "sync_deals", jobId });

  try {
    await updateJobStatus(jobId, "Running");

    let synced = 0;
    let after: string | undefined;

    do {
      const url = `/crm/v3/objects/deals?limit=100&properties=dealname,amount,dealstage,pipeline,closedate,hs_deal_stage_probability${after ? `&after=${after}` : ""}`;
      const data = await hubspotFetch(url, apiKey);
      const results = (data.results ?? []) as Record<string, unknown>[];

      for (const deal of results) {
        const props = (deal.properties ?? {}) as Record<string, string>;
        await upsertCrmDeal({
          source:     "hubspot",
          externalId: String(deal.id),
          title:      props.dealname    ?? null,
          value:      props.amount ? Number(props.amount) : null,
          stage:      props.dealstage   ?? null,
          status:     props.dealstage   ?? null,
          metadata:   JSON.stringify(props),
        });
        synced++;
      }

      const paging = data.paging as Record<string, Record<string, string>> | undefined;
      after = paging?.next?.after;
    } while (after);

    const duration = Date.now() - start;
    await updateJobStatus(jobId, "Completed");
    await completeSyncHistory(syncId, { status: "Success", recordsProcessed: synced, recordsCreated: synced, recordsUpdated: 0, durationMs: duration });
    await updateIntegrationHealth(integ.id, { status: "Connected", lastSync: new Date().toISOString(), healthScore: 100 });
    await addSystemLog({ eventType: "integration", level: "info", message: `HubSpot: synced ${synced} deals`, module: "hubspot", jobId });
    revalidatePath("/admin/integrations");
    return { success: true, synced };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "HubSpot deals sync failed";
    await updateJobStatus(jobId, "Failed", msg);
    await completeSyncHistory(syncId, { status: "Failed", recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, errorMessage: msg });
    await updateIntegrationHealth(integ.id, { status: "Error", lastError: msg, healthScore: 0 });
    return { success: false, synced: 0, error: msg };
  }
}

// ─── Pipedrive ────────────────────────────────────────────────────────────────

async function pipedriveFetch(path: string, apiToken: string): Promise<Record<string, unknown>> {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`https://api.pipedrive.com/v1${path}${sep}api_token=${encodeURIComponent(apiToken)}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Pipedrive authentication failed — check your API token");
    if (res.status === 429) throw new Error("Pipedrive rate limit exceeded");
    throw new Error(`Pipedrive API error ${res.status}`);
  }
  return res.json();
}

export async function syncPipedriveContactsAction(): Promise<SyncResult> {
  const integ = await getIntegrationBySlug("pipedrive");
  if (!integ) return { success: false, synced: 0, error: "Pipedrive integration not found" };

  const apiKey = await getCredentialValue(integ.id);
  if (!apiKey) return { success: false, synced: 0, error: "Pipedrive API token not configured" };

  const start = Date.now();
  const { id: jobId } = await createJob({ name: "Pipedrive Contacts Sync", source: "pipedrive", queueType: "incoming" });
  const { id: syncId } = await createSyncHistory({ integrationId: integ.id, operation: "sync_contacts", jobId });

  try {
    await updateJobStatus(jobId, "Running");

    let synced = 0;
    let start_cursor = 0;
    let hasMore = true;

    while (hasMore) {
      const data = await pipedriveFetch(`/persons?limit=100&start=${start_cursor}`, apiKey);
      const persons = (data.data ?? []) as Record<string, unknown>[];
      const pagination = data.additional_data as Record<string, Record<string, unknown>> | undefined;

      for (const person of persons) {
        const emails = (person.email as Record<string, string>[] | undefined) ?? [];
        const phones = (person.phone as Record<string, string>[] | undefined) ?? [];
        const org = person.org_id as Record<string, unknown> | null;
        await upsertCrmContact({
          source:     "pipedrive",
          externalId: String(person.id),
          name:       String(person.name ?? "Unknown"),
          email:      emails[0]?.value ?? null,
          company:    org ? String(org.name ?? "") : null,
          title:      person.job_title ? String(person.job_title) : null,
          phone:      phones[0]?.value ?? null,
          metadata:   JSON.stringify({ org_id: org?.id }),
        });
        synced++;
      }

      hasMore = !!(pagination?.pagination as Record<string, unknown>)?.more_items_in_collection;
      start_cursor += 100;
      if (start_cursor > 1000) break; // safety cap
    }

    const duration = Date.now() - start;
    await updateJobStatus(jobId, "Completed");
    await completeSyncHistory(syncId, { status: "Success", recordsProcessed: synced, recordsCreated: synced, recordsUpdated: 0, durationMs: duration });
    await updateIntegrationHealth(integ.id, { status: "Connected", lastSync: new Date().toISOString(), healthScore: 100 });
    await createNotification({ type: "client_created", title: "Pipedrive Sync", message: `${synced} contacts synced from Pipedrive.` });
    await addSystemLog({ eventType: "integration", level: "info", message: `Pipedrive: synced ${synced} contacts`, module: "pipedrive", jobId });
    revalidatePath("/admin/integrations");
    return { success: true, synced };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Pipedrive sync failed";
    await updateJobStatus(jobId, "Failed", msg);
    await completeSyncHistory(syncId, { status: "Failed", recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, errorMessage: msg });
    await updateIntegrationHealth(integ.id, { status: "Error", lastError: msg, healthScore: 0 });
    return { success: false, synced: 0, error: msg };
  }
}

export async function syncPipedriveDealsAction(): Promise<SyncResult> {
  const integ = await getIntegrationBySlug("pipedrive");
  if (!integ) return { success: false, synced: 0, error: "Pipedrive integration not found" };

  const apiKey = await getCredentialValue(integ.id);
  if (!apiKey) return { success: false, synced: 0, error: "Pipedrive API token not configured" };

  const start = Date.now();
  const { id: jobId } = await createJob({ name: "Pipedrive Deals Sync", source: "pipedrive", queueType: "incoming" });
  const { id: syncId } = await createSyncHistory({ integrationId: integ.id, operation: "sync_deals", jobId });

  try {
    await updateJobStatus(jobId, "Running");

    let synced = 0;
    const data = await pipedriveFetch("/deals?limit=100&status=open", apiKey);
    const deals = (data.data ?? []) as Record<string, unknown>[];

    for (const deal of deals) {
      const person = deal.person_id as Record<string, unknown> | null;
      const org = deal.org_id as Record<string, unknown> | null;
      await upsertCrmDeal({
        source:      "pipedrive",
        externalId:  String(deal.id),
        title:       deal.title ? String(deal.title) : null,
        value:       deal.value ? Number(deal.value) : null,
        stage:       deal.stage_id ? String(deal.stage_id) : null,
        status:      String(deal.status ?? "open"),
        contactName: person ? String(person.name ?? "") : null,
        company:     org ? String(org.name ?? "") : null,
        metadata:    JSON.stringify({ pipeline_id: deal.pipeline_id, stage_id: deal.stage_id }),
      });
      synced++;
    }

    const duration = Date.now() - start;
    await updateJobStatus(jobId, "Completed");
    await completeSyncHistory(syncId, { status: "Success", recordsProcessed: synced, recordsCreated: synced, recordsUpdated: 0, durationMs: duration });
    await updateIntegrationHealth(integ.id, { status: "Connected", lastSync: new Date().toISOString(), healthScore: 100 });
    await addSystemLog({ eventType: "integration", level: "info", message: `Pipedrive: synced ${synced} deals`, module: "pipedrive", jobId });
    revalidatePath("/admin/integrations");
    return { success: true, synced };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Pipedrive deals sync failed";
    await updateJobStatus(jobId, "Failed", msg);
    await completeSyncHistory(syncId, { status: "Failed", recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, errorMessage: msg });
    await updateIntegrationHealth(integ.id, { status: "Error", lastError: msg, healthScore: 0 });
    return { success: false, synced: 0, error: msg };
  }
}
