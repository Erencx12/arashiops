"use server";

import { revalidatePath } from "next/cache";
import {
  getIntegrationBySlug, getCredentialValue,
  createJob, updateJobStatus, updateIntegrationHealth,
  upsertInstantlyCampaign, getInstantlyStats,
  createSyncHistory, completeSyncHistory,
  addSystemLog, createNotification,
} from "./queries";

export type InstantlySyncResult = {
  success: boolean;
  synced: number;
  error?: string;
  stats?: { campaigns: number; totalSent: number; totalReplied: number; totalMeetings: number };
};

export async function syncInstantlyCampaignsAction(): Promise<InstantlySyncResult> {
  const integ = await getIntegrationBySlug("instantly");
  if (!integ) return { success: false, synced: 0, error: "Instantly integration not found" };

  const apiKey = await getCredentialValue(integ.id);
  if (!apiKey) return { success: false, synced: 0, error: "API key not configured. Add your Instantly API key in the API Vault." };

  const start = Date.now();
  const { id: jobId } = await createJob({
    name: "Instantly Campaign Sync", source: "instantly", queueType: "incoming",
  });
  const { id: syncId } = await createSyncHistory({ integrationId: integ.id, operation: "sync_campaigns", jobId });

  try {
    await updateJobStatus(jobId, "Running");

    // Fetch campaigns list
    const listRes = await fetch(
      `https://api.instantly.ai/api/v1/campaign/list?api_key=${encodeURIComponent(apiKey)}&limit=100&skip=0`,
      { headers: { "Content-Type": "application/json" } }
    );
    if (!listRes.ok) throw new Error(`Instantly API ${listRes.status}: ${await listRes.text().then(t => t.slice(0, 200))}`);
    const listData = await listRes.json();
    const campaigns: Record<string, unknown>[] = listData ?? [];

    let synced = 0;
    for (const campaign of campaigns) {
      const cid = String(campaign.id ?? "");
      if (!cid) continue;

      // Fetch analytics for this campaign
      let stats = { sent: 0, opened: 0, replied: 0, positiveReplies: 0, meetingsBooked: 0 };
      try {
        const statsRes = await fetch(
          `https://api.instantly.ai/api/v1/analytics/campaign/count?api_key=${encodeURIComponent(apiKey)}&campaign_id=${cid}`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (statsRes.ok) {
          const sd = await statsRes.json() as Record<string, unknown>;
          stats = {
            sent:           Number(sd.total_sent         ?? sd.sentCount        ?? 0),
            opened:         Number(sd.total_opened       ?? sd.openCount        ?? 0),
            replied:        Number(sd.total_replied      ?? sd.replyCount       ?? 0),
            positiveReplies: Number(sd.positive_replies  ?? sd.positiveCount    ?? 0),
            meetingsBooked: Number(sd.meetings_booked    ?? sd.meetingCount     ?? 0),
          };
        }
      } catch { /* skip stats on error */ }

      await upsertInstantlyCampaign({
        campaignId:      cid,
        name:            String(campaign.name ?? cid),
        status:          String(campaign.status ?? "Active"),
        sent:            stats.sent,
        opened:          stats.opened,
        replied:         stats.replied,
        positiveReplies: stats.positiveReplies,
        meetingsBooked:  stats.meetingsBooked,
      });
      synced++;
    }

    const duration = Date.now() - start;
    const aggStats = await getInstantlyStats();

    await updateJobStatus(jobId, "Completed");
    await completeSyncHistory(syncId, {
      status: "Success", recordsProcessed: campaigns.length,
      recordsCreated: synced, recordsUpdated: 0, durationMs: duration,
    });
    await updateIntegrationHealth(integ.id, {
      status: "Connected", lastSync: new Date().toISOString(), healthScore: 100,
    });
    await createNotification({
      type:    "client_created",
      title:   "Instantly Sync Complete",
      message: `${synced} campaigns synced. ${aggStats.totalSent.toLocaleString()} emails sent total.`,
    });
    await addSystemLog({
      eventType: "integration", level: "info",
      message:   `Instantly: synced ${synced} campaigns`,
      module:    "instantly", jobId,
    });
    revalidatePath("/admin/integrations");
    return { success: true, synced, stats: aggStats };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    await updateJobStatus(jobId, "Failed", msg);
    await completeSyncHistory(syncId, {
      status: "Failed", recordsProcessed: 0, recordsCreated: 0, recordsUpdated: 0, errorMessage: msg,
    });
    await updateIntegrationHealth(integ.id, { status: "Error", lastError: msg, healthScore: 0 });
    await addSystemLog({ eventType: "integration", level: "error", message: `Instantly sync failed: ${msg}`, module: "instantly", jobId });
    return { success: false, synced: 0, error: msg };
  }
}
