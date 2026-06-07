"use client";

import { useState, useTransition, useActionState } from "react";
import Link from "next/link";
import {
  Plus, Trash2, Power, PowerOff, Key, CheckCircle2, XCircle, AlertCircle, Clock,
  Shield, RefreshCw, Mail, Users, BarChart2, Zap, Search, Download, History,
  ChevronRight,
} from "lucide-react";
import type { DbIntegration, DbIntegrationCredential, DbEmailConfig, DbWebhook } from "@/lib/db-types";
import {
  toggleIntegrationAction, addCredentialAction, deleteCredentialAction,
  updateCredentialStatusAction, connectIntegrationAction, disconnectIntegrationAction,
} from "@/lib/integration-actions";
import { saveEmailConfigAction, sendTestEmailAction } from "@/lib/email-actions";
import { syncApolloAction, searchApolloAction, importApolloLeadsAction, type ApolloSearchResult } from "@/lib/apollo-actions";
import { syncInstantlyCampaignsAction } from "@/lib/instantly-actions";
import { syncHubSpotContactsAction, syncHubSpotDealsAction, syncPipedriveContactsAction, syncPipedriveDealsAction } from "@/lib/crm-actions";
import { triggerMakeScenarioAction, triggerN8nWorkflowAction } from "@/lib/automation-actions";

const SERVICE_COLORS: Record<string, string> = {
  apollo:    "bg-orange-100 text-orange-700",
  instantly: "bg-blue-100 text-blue-700",
  claude:    "bg-violet-100 text-violet-700",
  hubspot:   "bg-orange-100 text-orange-600",
  pipedrive: "bg-red-100 text-red-600",
  gmail:     "bg-red-100 text-red-700",
  outlook:   "bg-blue-100 text-blue-600",
  smtp:      "bg-gray-100 text-gray-700",
  make:      "bg-purple-100 text-purple-700",
  n8n:       "bg-rose-100 text-rose-700",
};

const inputCls = "w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors";
const labelCls = "block text-[12.5px] font-medium text-[#374151] mb-1.5";
const btnPrimary = "px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors";
const btnSecondary = "px-3.5 py-1.5 border border-[#e5e7eb] text-[12px] font-medium text-[#6b7280] rounded-md hover:bg-[#f3f4f6] hover:text-[#111111] disabled:opacity-50 transition-colors";

type ServiceStats = {
  emailStats:      { total: number; sent: number; failed: number; todaySent: number };
  apolloLeadCount: number;
  instantlyStats:  { campaigns: number; totalSent: number; totalReplied: number; totalMeetings: number };
  crmStats:        { hubspotContacts: number; hubspotDeals: number; pipedriveContacts: number; pipedriveDeals: number; totalContacts: number; totalDeals: number };
  syncStats:       { total: number; success: number; failed: number; today: number };
};

type Props = {
  integrations: DbIntegration[];
  credentials:  DbIntegrationCredential[];
  emailConfigs: DbEmailConfig[];
  webhooks:     DbWebhook[];
} & ServiceStats;

export function IntegrationsView({
  integrations, credentials, emailConfigs, emailStats,
  apolloLeadCount, instantlyStats, crmStats, syncStats, webhooks,
}: Props) {
  const [activeModal, setActiveModal]   = useState<string | null>(null);
  const [showVault, setShowVault]       = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [feedback, setFeedback]         = useState<Record<string, string>>({});
  const [isPending, startTransition]    = useTransition();
  const [keyState, keyAction, keyPending] = useActionState(addCredentialAction, null);

  const connected = integrations.filter(i => i.enabled).length;
  const activeEmailConfig = emailConfigs.find(c => c.is_active);

  function msg(slug: string, text: string) {
    setFeedback(f => ({ ...f, [slug]: text }));
    setTimeout(() => setFeedback(f => { const n = { ...f }; delete n[slug]; return n; }), 5000);
  }

  function handleToggle(id: number, enabled: boolean) {
    startTransition(async () => { await toggleIntegrationAction(id, enabled); });
  }

  function handleDeleteCred(id: number) {
    startTransition(async () => { await deleteCredentialAction(id); });
  }

  function handleCredStatus(id: number, status: string) {
    startTransition(async () => { await updateCredentialStatusAction(id, status); });
  }

  async function handleSyncApollo() {
    startTransition(async () => {
      const r = await syncApolloAction();
      msg("apollo", r.success ? `Synced ${r.imported} leads` : (r.error ?? "Sync failed"));
    });
  }

  async function handleSyncInstantly() {
    startTransition(async () => {
      const r = await syncInstantlyCampaignsAction();
      msg("instantly", r.success ? `${r.synced} campaigns synced` : (r.error ?? "Sync failed"));
    });
  }

  async function handleSyncCRM(action: () => Promise<{ success: boolean; synced: number; error?: string }>, slug: string) {
    startTransition(async () => {
      const r = await action();
      msg(slug, r.success ? `${r.synced} records synced` : (r.error ?? "Sync failed"));
    });
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Integrations</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">
            {connected} of {integrations.length} connected · {credentials.length} credentials · {syncStats.today} syncs today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/integrations/history"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#e5e7eb] text-[12.5px] font-medium text-[#6b7280] rounded-md hover:bg-[#f3f4f6] transition-colors"
          >
            <History size={12} /> Sync History
          </Link>
          <button
            onClick={() => setShowKeyModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
          >
            <Key size={13} /> Add API Key
          </button>
        </div>
      </div>

      {/* Health strip */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {[
          { label: "Connected",       value: connected,               color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
          { label: "Syncs Today",     value: syncStats.today,         color: "text-blue-700 bg-blue-50 border-blue-100" },
          { label: "Sync Failures",   value: syncStats.failed,        color: syncStats.failed > 0 ? "text-red-700 bg-red-50 border-red-100" : "text-[#9ca3af] bg-[#fafafa] border-[#e5e7eb]" },
          { label: "Apollo Leads",    value: apolloLeadCount,         color: "text-orange-700 bg-orange-50 border-orange-100" },
          { label: "CRM Records",     value: crmStats.totalContacts + crmStats.totalDeals, color: "text-[#374151] bg-white border-[#e5e7eb]" },
        ].map(item => (
          <div key={item.label} className={`border rounded-xl px-4 py-3.5 ${item.color}`}>
            <p className="text-[24px] font-bold tracking-tight">{item.value}</p>
            <p className="text-[11.5px] font-medium mt-0.5 opacity-80">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Integration cards by category */}
      {[
        { key: "email",        label: "Email",        slugs: ["gmail", "outlook", "smtp"] },
        { key: "prospecting",  label: "Prospecting",  slugs: ["apollo"] },
        { key: "outreach",     label: "Outreach",     slugs: ["instantly"] },
        { key: "crm",          label: "CRM",          slugs: ["hubspot", "pipedrive"] },
        { key: "automation",   label: "Automation",   slugs: ["make", "n8n"] },
        { key: "ai",           label: "AI",           slugs: ["claude"] },
      ].map(group => {
        const groupIntegrations = integrations.filter(i => group.slugs.includes(i.slug));
        if (groupIntegrations.length === 0) return null;
        return (
          <div key={group.key} className="mb-8">
            <p className="text-[11.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">{group.label}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupIntegrations.map(integ => (
                <IntegrationCard
                  key={integ.id}
                  integ={integ}
                  creds={credentials.filter(c => c.integration_id === integ.id)}
                  isPending={isPending}
                  feedback={feedback[integ.slug]}
                  emailStats={integ.slug === "gmail" || integ.slug === "outlook" || integ.slug === "smtp" ? emailStats : undefined}
                  apolloLeadCount={integ.slug === "apollo" ? apolloLeadCount : undefined}
                  instantlyStats={integ.slug === "instantly" ? instantlyStats : undefined}
                  crmStats={integ.slug === "hubspot" || integ.slug === "pipedrive" ? crmStats : undefined}
                  activeEmailConfig={integ.slug === "gmail" || integ.slug === "outlook" || integ.slug === "smtp" ? activeEmailConfig : undefined}
                  webhooks={webhooks}
                  onToggle={handleToggle}
                  onManage={() => setActiveModal(integ.slug)}
                  onSyncApollo={handleSyncApollo}
                  onSyncInstantly={handleSyncInstantly}
                  onSyncCRM={handleSyncCRM}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* API Key Vault */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <button
          onClick={() => setShowVault(!showVault)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#fafafa] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Shield size={14} className="text-[#6b7280]" />
            <p className="text-[13px] font-semibold text-[#111111]">API Key Vault</p>
            <span className="text-[11px] bg-[#f3f4f6] text-[#6b7280] px-2 py-0.5 rounded-full font-medium">
              {credentials.length} keys
            </span>
          </div>
          <span className="text-[11px] text-[#9ca3af]">{showVault ? "Hide" : "Show"}</span>
        </button>

        {showVault && (
          <div className="border-t border-[#e5e7eb]">
            {credentials.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-[#9ca3af]">No credentials stored.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
                    {["Service", "Label", "Key", "Integration", "Status", "Added", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {credentials.map(cred => (
                    <tr key={cred.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-4 py-3.5 text-[13px] font-medium text-[#111111]">{cred.service}</td>
                      <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{cred.key_label}</td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-[12px] text-[#9ca3af] bg-[#f3f4f6] px-2 py-0.5 rounded">{cred.key_masked}</span>
                      </td>
                      <td className="px-4 py-3.5 text-[12.5px] text-[#9ca3af]">{cred.integration_name ?? "—"}</td>
                      <td className="px-4 py-3.5">
                        <select
                          value={cred.status}
                          onChange={e => handleCredStatus(cred.id, e.target.value)}
                          disabled={isPending}
                          className="text-[12px] border border-[#e5e7eb] rounded-md px-2 py-1 bg-white outline-none cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                          <option value="expired">Expired</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-[#9ca3af]">{cred.created_at.slice(0, 10)}</td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleDeleteCred(cred.id)}
                          disabled={isPending}
                          className="p-1.5 text-[#9ca3af] hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Per-service modals */}
      {activeModal === "gmail" || activeModal === "outlook" || activeModal === "smtp" ? (
        <EmailConfigModal
          integ={integrations.find(i => i.slug === activeModal)!}
          activeConfig={activeEmailConfig}
          integrations={integrations.filter(i => ["gmail","outlook","smtp"].includes(i.slug))}
          onClose={() => setActiveModal(null)}
        />
      ) : activeModal === "apollo" ? (
        <ApolloModal
          integ={integrations.find(i => i.slug === "apollo")!}
          leadCount={apolloLeadCount}
          onClose={() => setActiveModal(null)}
        />
      ) : activeModal === "hubspot" ? (
        <CrmModal
          integ={integrations.find(i => i.slug === "hubspot")!}
          contacts={crmStats.hubspotContacts}
          deals={crmStats.hubspotDeals}
          onSyncContacts={() => handleSyncCRM(syncHubSpotContactsAction, "hubspot")}
          onSyncDeals={() => handleSyncCRM(syncHubSpotDealsAction, "hubspot")}
          onClose={() => setActiveModal(null)}
        />
      ) : activeModal === "pipedrive" ? (
        <CrmModal
          integ={integrations.find(i => i.slug === "pipedrive")!}
          contacts={crmStats.pipedriveContacts}
          deals={crmStats.pipedriveDeals}
          onSyncContacts={() => handleSyncCRM(syncPipedriveContactsAction, "pipedrive")}
          onSyncDeals={() => handleSyncCRM(syncPipedriveDealsAction, "pipedrive")}
          onClose={() => setActiveModal(null)}
        />
      ) : activeModal === "make" || activeModal === "n8n" ? (
        <AutomationModal
          integ={integrations.find(i => i.slug === activeModal)!}
          webhooks={webhooks.filter(w => w.source === activeModal)}
          onClose={() => setActiveModal(null)}
        />
      ) : activeModal === "instantly" ? (
        <InstantlyModal
          integ={integrations.find(i => i.slug === "instantly")!}
          stats={instantlyStats}
          onSync={handleSyncInstantly}
          onClose={() => setActiveModal(null)}
        />
      ) : null}

      {/* Add Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setShowKeyModal(false)}>
          <div className="bg-white rounded-2xl border border-[#e5e7eb] w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <form action={keyAction} className="p-6 space-y-4">
              <h2 className="text-[16px] font-bold text-[#111111]">Add API Key</h2>
              <p className="text-[12.5px] text-[#9ca3af]">Keys are stored securely. Only the last 4 characters are visible.</p>
              {keyState?.error && <p className="text-[12.5px] text-red-600">{keyState.error}</p>}
              {keyState?.success && (
                <p className="text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">
                  Key added. <button type="button" onClick={() => setShowKeyModal(false)} className="underline">Close</button>
                </p>
              )}
              <div>
                <label className={labelCls}>Link to Integration</label>
                <select name="integrationId" className={`${inputCls} bg-white`}>
                  <option value="">No integration</option>
                  {integrations.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Service *</label>
                  <input name="service" required placeholder="apollo" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Key Label *</label>
                  <input name="keyLabel" required placeholder="API Key" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>API Key *</label>
                <input name="keyValue" required type="password" placeholder="Paste key here" className={inputCls} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2.5 text-[13px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={keyPending}
                  className="flex-1 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                  {keyPending ? "Saving…" : "Save Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Integration Card ──────────────────────────────────────────────────────────

type CardProps = {
  integ: DbIntegration;
  creds: DbIntegrationCredential[];
  isPending: boolean;
  feedback?: string;
  emailStats?: { total: number; sent: number; failed: number; todaySent: number };
  apolloLeadCount?: number;
  instantlyStats?: { campaigns: number; totalSent: number; totalReplied: number; totalMeetings: number };
  crmStats?: { hubspotContacts: number; hubspotDeals: number; pipedriveContacts: number; pipedriveDeals: number; totalContacts: number; totalDeals: number };
  activeEmailConfig?: DbEmailConfig | undefined;
  webhooks: DbWebhook[];
  onToggle: (id: number, enabled: boolean) => void;
  onManage: () => void;
  onSyncApollo: () => void;
  onSyncInstantly: () => void;
  onSyncCRM: (action: () => Promise<{ success: boolean; synced: number; error?: string }>, slug: string) => void;
};

function IntegrationCard({
  integ, creds, isPending, feedback, emailStats, apolloLeadCount,
  instantlyStats, crmStats, activeEmailConfig, webhooks,
  onToggle, onManage, onSyncApollo, onSyncInstantly, onSyncCRM,
}: CardProps) {
  const colorCls = SERVICE_COLORS[integ.slug] ?? "bg-[#f3f4f6] text-[#374151]";
  const hasKey = creds.length > 0;

  // Service-specific stat line
  let statLine: string | null = null;
  if (integ.slug === "gmail" || integ.slug === "outlook" || integ.slug === "smtp") {
    statLine = emailStats && emailStats.sent > 0 ? `${emailStats.sent} emails sent · ${emailStats.failed} failed` : activeEmailConfig ? "Configured" : "Not configured";
  } else if (integ.slug === "apollo") {
    statLine = apolloLeadCount !== undefined ? `${apolloLeadCount.toLocaleString()} leads imported` : null;
  } else if (integ.slug === "instantly") {
    statLine = instantlyStats ? `${instantlyStats.campaigns} campaigns · ${instantlyStats.totalSent.toLocaleString()} sent` : null;
  } else if (integ.slug === "hubspot" && crmStats) {
    statLine = `${crmStats.hubspotContacts} contacts · ${crmStats.hubspotDeals} deals`;
  } else if (integ.slug === "pipedrive" && crmStats) {
    statLine = `${crmStats.pipedriveContacts} contacts · ${crmStats.pipedriveDeals} deals`;
  } else if (integ.slug === "make") {
    const n = webhooks.filter(w => w.source === "make").length;
    statLine = n > 0 ? `${n} webhook${n !== 1 ? "s" : ""} configured` : "No webhooks";
  } else if (integ.slug === "n8n") {
    const n = webhooks.filter(w => w.source === "n8n").length;
    statLine = n > 0 ? `${n} webhook${n !== 1 ? "s" : ""} configured` : "No webhooks";
  } else if (integ.slug === "claude") {
    statLine = "Phase 9 — AI automation coming next";
  }

  return (
    <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
      <div className={`h-[3px] w-full ${integ.enabled ? "bg-emerald-500" : "bg-[#e5e7eb]"}`} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold ${colorCls}`}>
              {integ.name[0]}
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-[#111111]">{integ.name}</p>
              <p className="text-[11px] text-[#9ca3af]">{creds.length} key{creds.length !== 1 ? "s" : ""} stored</p>
            </div>
          </div>
          <StatusIcon status={integ.status} />
        </div>

        <div className="space-y-1 mb-4 min-h-[32px]">
          {statLine && <p className="text-[11.5px] text-[#6b7280]">{statLine}</p>}
          {integ.last_sync && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#9ca3af]">
              <Clock size={9} /> Last sync {integ.last_sync.slice(0, 10)}
            </div>
          )}
          {integ.last_error && (
            <div className="flex items-start gap-1.5 text-[11px] text-red-500">
              <AlertCircle size={9} className="mt-0.5 shrink-0" />
              <span className="truncate">{integ.last_error}</span>
            </div>
          )}
          {feedback && (
            <p className="text-[11.5px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{feedback}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(integ.id, !integ.enabled)}
            disabled={isPending}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors disabled:opacity-50 ${
              integ.enabled
                ? "bg-[#f3f4f6] text-[#6b7280] hover:bg-red-50 hover:text-red-600"
                : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#111111] hover:text-white"
            }`}
          >
            {integ.enabled ? <><PowerOff size={10} /> Off</> : <><Power size={10} /> On</>}
          </button>
          {integ.slug !== "claude" && (
            <button
              onClick={onManage}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white rounded-md text-[12px] font-medium hover:bg-[#1a1a1a] transition-colors"
            >
              Manage <ChevronRight size={11} />
            </button>
          )}
          {integ.slug === "claude" && (
            <div className="flex-1 px-3 py-1.5 bg-[#f3f4f6] text-[#9ca3af] rounded-md text-[12px] font-medium text-center">
              Phase 9
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Email Config Modal ────────────────────────────────────────────────────────

function EmailConfigModal({
  integ, activeConfig, integrations, onClose,
}: {
  integ: DbIntegration;
  activeConfig?: DbEmailConfig;
  integrations: DbIntegration[];
  onClose: () => void;
}) {
  const [configState, configAction, configPending] = useActionState(saveEmailConfigAction, null);
  const [testState, testAction, testPending]       = useActionState(sendTestEmailAction, null);

  return (
    <ModalShell title={`${integ.name} — Email Configuration`} onClose={onClose} wide>
      <div className="space-y-5">
        {activeConfig && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 text-[12.5px] text-emerald-700">
            Active config: {activeConfig.provider} · from {activeConfig.from_email}
            {activeConfig.last_test_success !== null && (
              <span className="ml-2">{activeConfig.last_test_success ? "· Last test ✓" : "· Last test ✗"}</span>
            )}
          </div>
        )}

        <form action={configAction} className="space-y-4">
          {configState?.error && <p className="text-[12.5px] text-red-600">{configState.error}</p>}
          {configState?.success && <p className="text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">Configuration saved.</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Provider</label>
              <select name="provider" defaultValue={activeConfig?.provider ?? integ.slug} className={`${inputCls} bg-white`}>
                {integrations.map(i => <option key={i.slug} value={i.slug}>{i.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>SMTP Port</label>
              <input name="smtpPort" type="number" defaultValue={activeConfig?.smtp_port ?? 587} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>SMTP Host</label>
            <input name="smtpHost" placeholder="smtp.gmail.com" defaultValue={activeConfig?.smtp_host ?? ""} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>SMTP Username</label>
            <input name="smtpUser" placeholder="your@email.com" defaultValue={activeConfig?.smtp_user ?? ""} className={inputCls} />
          </div>
          <p className="text-[11.5px] text-[#9ca3af]">Store your SMTP password in the API Key Vault above (service = your provider slug, e.g. "gmail").</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>From Name</label>
              <input name="fromName" placeholder="Arashi OPS" defaultValue={activeConfig?.from_name ?? "Arashi OPS"} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>From Email</label>
              <input name="fromEmail" type="email" placeholder="noreply@arashi.io" defaultValue={activeConfig?.from_email ?? ""} className={inputCls} />
            </div>
          </div>
          <button type="submit" disabled={configPending} className={btnPrimary}>
            {configPending ? "Saving…" : "Save Configuration"}
          </button>
        </form>

        {activeConfig && (
          <div className="border-t border-[#e5e7eb] pt-5">
            <p className="text-[12.5px] font-semibold text-[#111111] mb-3">Send Test Email</p>
            {testState?.error   && <p className="text-[12.5px] text-red-600 mb-2">{testState.error}</p>}
            {testState?.success && <p className="text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md mb-2">{testState.message}</p>}
            <form action={testAction} className="flex gap-2">
              <input type="hidden" name="configId" value={activeConfig.id} />
              <input name="recipient" type="email" placeholder="test@example.com" required className={`${inputCls} flex-1`} />
              <button type="submit" disabled={testPending} className={btnPrimary}>
                {testPending ? "Sending…" : "Send Test"}
              </button>
            </form>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ─── Apollo Modal ─────────────────────────────────────────────────────────────

function ApolloModal({ integ, leadCount, onClose }: { integ: DbIntegration; leadCount: number; onClose: () => void }) {
  const [searchState, searchAction, searchPending] = useActionState(searchApolloAction, null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importing, startImport]        = useTransition();

  function handleImport() {
    if (!searchState?.results?.length) return;
    startImport(async () => {
      const r = await importApolloLeadsAction(searchState.results!);
      setImportStatus(r.success ? `Imported ${r.imported} leads` : (r.error ?? "Import failed"));
    });
  }

  return (
    <ModalShell title="Apollo — Prospect Search & Import" onClose={onClose} wide>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="bg-[#f3f4f6] rounded-lg px-4 py-3">
            <p className="text-[22px] font-bold text-[#111111]">{leadCount.toLocaleString()}</p>
            <p className="text-[11.5px] text-[#6b7280]">Total leads imported</p>
          </div>
          {importStatus && <p className="text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">{importStatus}</p>}
        </div>

        <form action={searchAction} className="space-y-3">
          <p className="text-[12.5px] font-semibold text-[#111111]">Search Prospects</p>
          {searchState?.error && <p className="text-[12.5px] text-red-600">{searchState.error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Keywords</label>
              <input name="query" placeholder="growth marketing" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Title</label>
              <input name="title" placeholder="VP of Sales" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Industry</label>
              <input name="industry" placeholder="SaaS" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input name="location" placeholder="United States" className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={searchPending} className={btnPrimary}>
              <Search size={11} className="inline mr-1.5" />
              {searchPending ? "Searching…" : "Search Apollo"}
            </button>
            {searchState?.results && searchState.results.length > 0 && (
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className={btnSecondary}
              >
                <Download size={11} className="inline mr-1.5" />
                {importing ? "Importing…" : `Import ${searchState.results.length} results`}
              </button>
            )}
          </div>
        </form>

        {searchState?.results && searchState.results.length > 0 && (
          <div>
            <p className="text-[11.5px] font-semibold text-[#6b7280] mb-2">
              {searchState.results.length} results {searchState.total ? `of ${searchState.total.toLocaleString()} total` : ""}
            </p>
            <div className="border border-[#e5e7eb] rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-[#fafafa] border-b border-[#e5e7eb]">
                  <tr>
                    {["Name", "Title", "Company", "Email"].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {searchState.results.map((p, i) => (
                    <tr key={i} className="hover:bg-[#fafafa]">
                      <td className="px-3 py-2.5 font-medium text-[#111111]">{p.name}</td>
                      <td className="px-3 py-2.5 text-[#6b7280]">{p.title ?? "—"}</td>
                      <td className="px-3 py-2.5 text-[#6b7280]">{p.company ?? "—"}</td>
                      <td className="px-3 py-2.5 text-[#9ca3af]">{p.email ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ─── Instantly Modal ──────────────────────────────────────────────────────────

function InstantlyModal({ integ, stats, onSync, onClose }: {
  integ: DbIntegration;
  stats: { campaigns: number; totalSent: number; totalReplied: number; totalMeetings: number };
  onSync: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title="Instantly — Campaign Management" onClose={onClose}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Campaigns",   value: stats.campaigns },
            { label: "Total Sent",  value: stats.totalSent.toLocaleString() },
            { label: "Replies",     value: stats.totalReplied.toLocaleString() },
            { label: "Meetings",    value: stats.totalMeetings },
          ].map(item => (
            <div key={item.label} className="bg-[#f3f4f6] rounded-lg px-4 py-3">
              <p className="text-[20px] font-bold text-[#111111]">{item.value}</p>
              <p className="text-[11.5px] text-[#6b7280]">{item.label}</p>
            </div>
          ))}
        </div>

        {integ.last_sync && (
          <p className="text-[11.5px] text-[#9ca3af] flex items-center gap-1.5">
            <Clock size={10} /> Last synced {integ.last_sync.slice(0, 10)}
          </p>
        )}
        {integ.last_error && (
          <p className="text-[11.5px] text-red-500 flex items-center gap-1.5">
            <AlertCircle size={10} /> {integ.last_error}
          </p>
        )}

        <div className="border-t border-[#e5e7eb] pt-4">
          <p className="text-[12px] text-[#9ca3af] mb-3">Syncs all campaigns and fetches analytics from Instantly API.</p>
          <button onClick={() => { onSync(); onClose(); }} className={btnPrimary}>
            <RefreshCw size={11} className="inline mr-1.5" />
            Sync Campaigns
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── CRM Modal ────────────────────────────────────────────────────────────────

function CrmModal({ integ, contacts, deals, onSyncContacts, onSyncDeals, onClose }: {
  integ: DbIntegration;
  contacts: number;
  deals: number;
  onSyncContacts: () => void;
  onSyncDeals: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`${integ.name} — CRM Sync`} onClose={onClose}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Contacts synced", value: contacts },
            { label: "Deals synced",    value: deals },
          ].map(item => (
            <div key={item.label} className="bg-[#f3f4f6] rounded-lg px-4 py-3">
              <p className="text-[24px] font-bold text-[#111111]">{item.value}</p>
              <p className="text-[11.5px] text-[#6b7280]">{item.label}</p>
            </div>
          ))}
        </div>

        {integ.last_sync && (
          <p className="text-[11.5px] text-[#9ca3af] flex items-center gap-1.5">
            <Clock size={10} /> Last synced {integ.last_sync.slice(0, 10)}
          </p>
        )}
        {integ.last_error && (
          <p className="text-[11.5px] text-red-500 flex items-center gap-1.5">
            <AlertCircle size={10} /> {integ.last_error}
          </p>
        )}

        <p className="text-[12px] text-[#9ca3af]">Arashi OPS is source of truth for agency ops. {integ.name} is source of truth for sales data. Sync pulls records into Arashi for visibility.</p>

        <div className="border-t border-[#e5e7eb] pt-4 flex gap-3">
          <button
            onClick={() => { onSyncContacts(); onClose(); }}
            className={btnPrimary}
          >
            <Users size={11} className="inline mr-1.5" />
            Sync Contacts
          </button>
          <button
            onClick={() => { onSyncDeals(); onClose(); }}
            className={btnSecondary}
          >
            <BarChart2 size={11} className="inline mr-1.5" />
            Sync Deals
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Automation Modal ─────────────────────────────────────────────────────────

function AutomationModal({ integ, webhooks, onClose }: {
  integ: DbIntegration;
  webhooks: DbWebhook[];
  onClose: () => void;
}) {
  const [result, setResult]     = useState<string | null>(null);
  const [pending, startTrigger] = useTransition();

  function handleTrigger(webhookId: number) {
    startTrigger(async () => {
      const fn = integ.slug === "make" ? triggerMakeScenarioAction : triggerN8nWorkflowAction;
      const r = await fn(webhookId, { triggered_by: "arashi_ops_manual" });
      setResult(r.success ? `Triggered successfully (HTTP ${r.statusCode})` : (r.error ?? "Trigger failed"));
    });
  }

  return (
    <ModalShell title={`${integ.name} — Webhook Triggers`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[12.5px] text-[#6b7280]">
          Trigger {integ.name} scenarios by sending a POST to registered webhook URLs.
          Configure webhooks at <Link href="/admin/webhooks" className="underline text-[#111111]" onClick={onClose}>Webhooks</Link>.
        </p>

        {result && <p className="text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">{result}</p>}

        {webhooks.length === 0 ? (
          <div className="border border-[#e5e7eb] rounded-lg px-4 py-6 text-center">
            <p className="text-[13px] text-[#9ca3af]">No {integ.name} webhooks configured.</p>
            <p className="text-[12px] text-[#9ca3af] mt-1">Add a webhook with source = &quot;{integ.slug}&quot; to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {webhooks.map(w => (
              <div key={w.id} className="flex items-center justify-between border border-[#e5e7eb] rounded-lg px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-[#111111]">{w.name}</p>
                  <p className="text-[11px] text-[#9ca3af] truncate max-w-[200px]">{w.endpoint}</p>
                </div>
                <button
                  onClick={() => handleTrigger(w.id)}
                  disabled={pending || w.status !== "Active"}
                  className={btnPrimary}
                >
                  <Zap size={11} className="inline mr-1.5" />
                  {pending ? "…" : "Trigger"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────

function ModalShell({ title, children, onClose, wide }: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl border border-[#e5e7eb] w-full shadow-xl max-h-[90vh] overflow-y-auto ${wide ? "max-w-2xl" : "max-w-md"}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7eb]">
          <h2 className="text-[15px] font-bold text-[#111111]">{title}</h2>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#111111] text-[18px] leading-none transition-colors">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "Connected") return <CheckCircle2 size={14} className="text-emerald-500" />;
  if (status === "Error")     return <XCircle size={14} className="text-red-500" />;
  if (status === "Pending")   return <Clock size={14} className="text-amber-500" />;
  return <XCircle size={14} className="text-[#d1d5db]" />;
}
