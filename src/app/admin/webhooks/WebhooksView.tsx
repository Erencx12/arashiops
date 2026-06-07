"use client";

import { useState, useTransition, useActionState } from "react";
import { Plus, Trash2, Zap, Power, PowerOff, CheckCircle2, XCircle, ChevronDown, ChevronRight } from "lucide-react";
import type { DbWebhook, DbWebhookLog } from "@/lib/db-types";
import { createWebhookAction, toggleWebhookAction, deleteWebhookAction, testWebhookAction } from "@/lib/webhook-actions";

const inputCls = "w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors";
const labelCls = "block text-[12.5px] font-medium text-[#374151] mb-1.5";

type Props = { webhooks: DbWebhook[]; logs: DbWebhookLog[] };

export function WebhooksView({ webhooks, logs }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [testResult, setTestResult] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();
  const [formState, formAction, formPending] = useActionState(createWebhookAction, null);

  const active   = webhooks.filter(w => w.status === "Active").length;
  const todayLogs = logs.filter(l => l.timestamp.slice(0, 10) === new Date().toISOString().slice(0, 10));
  const failures  = logs.filter(l => !l.success).length;

  function handleToggle(w: DbWebhook) {
    const next = w.status === "Active" ? "Inactive" : "Active";
    startTransition(async () => { await toggleWebhookAction(w.id, next); });
  }

  function handleDelete(id: number) {
    startTransition(async () => { await deleteWebhookAction(id); });
  }

  function handleTest(id: number) {
    startTransition(async () => {
      const result = await testWebhookAction(id);
      setTestResult(prev => ({ ...prev, [id]: result.message }));
      setTimeout(() => setTestResult(prev => { const n = { ...prev }; delete n[id]; return n; }), 4000);
    });
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Webhooks</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">
            {active} active · {logs.length} total triggers · {failures} failures
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          <Plus size={13} /> New Webhook
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",        value: webhooks.length,  cls: "border-[#e5e7eb] bg-white text-[#111111]" },
          { label: "Active",       value: active,            cls: "border-emerald-100 bg-emerald-50 text-emerald-700" },
          { label: "Triggered Today", value: todayLogs.length, cls: "border-blue-100 bg-blue-50 text-blue-700" },
          { label: "Failures",     value: failures,          cls: failures > 0 ? "border-red-100 bg-red-50 text-red-700" : "border-[#e5e7eb] bg-[#fafafa] text-[#9ca3af]" },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl px-4 py-3.5 ${s.cls}`}>
            <p className="text-[24px] font-bold tracking-tight">{s.value}</p>
            <p className="text-[11.5px] font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <form action={formAction} className="border border-[#e5e7eb] rounded-xl bg-white p-6 mb-6 space-y-4">
          <h2 className="text-[14px] font-semibold text-[#111111]">New Webhook</h2>
          {formState?.error && <p className="text-[12.5px] text-red-600">{formState.error}</p>}
          {formState?.success && (
            <p className="text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">
              Webhook created. <button type="button" onClick={() => setShowForm(false)} className="underline">Close</button>
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input name="name" required placeholder="e.g. Deal Created" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Source *</label>
              <input name="source" required placeholder="e.g. Make.com, n8n, Zapier" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Endpoint URL *</label>
            <input name="endpoint" required type="url" placeholder="https://hooks.make.com/..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Signing Secret</label>
            <input name="secret" type="password" placeholder="Optional HMAC secret" className={inputCls} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-[13px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={formPending}
              className="flex-1 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md disabled:opacity-50 transition-colors">
              {formPending ? "Creating…" : "Create Webhook"}
            </button>
          </div>
        </form>
      )}

      {/* Webhook list */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-[#e5e7eb] bg-[#fafafa]">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#9ca3af]">Registered Webhooks</p>
        </div>
        {webhooks.length === 0 ? (
          <div className="px-5 py-12 text-center text-[13px] text-[#9ca3af]">
            No webhooks yet. Create one to start receiving events.
          </div>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {webhooks.map(w => {
              const wLogs = logs.filter(l => l.webhook_id === w.id);
              return (
                <div key={w.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${w.status === "Active" ? "bg-emerald-500" : "bg-[#d1d5db]"}`} />
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-[#111111]">{w.name}</p>
                        <p className="text-[12px] text-[#9ca3af]">{w.source}</p>
                        <p className="text-[11.5px] font-mono text-[#6b7280] mt-1 truncate max-w-[320px]">{w.endpoint}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[11px] text-[#9ca3af]">
                            {w.trigger_count} trigger{w.trigger_count !== 1 ? "s" : ""}
                          </span>
                          {w.last_trigger && (
                            <span className="text-[11px] text-[#9ca3af]">
                              Last: {w.last_trigger.slice(0, 10)}
                            </span>
                          )}
                          {w.secret && <span className="text-[11px] text-emerald-600">Signed</span>}
                        </div>
                        {testResult[w.id] && (
                          <p className="text-[11.5px] text-blue-600 mt-1">{testResult[w.id]}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleTest(w.id)} disabled={isPending}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-medium text-[#374151] border border-[#e5e7eb] rounded-md hover:bg-[#f3f4f6] disabled:opacity-50 transition-colors">
                        <Zap size={11} /> Test
                      </button>
                      <button onClick={() => handleToggle(w)} disabled={isPending}
                        className={`flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-medium rounded-md border disabled:opacity-50 transition-colors ${
                          w.status === "Active"
                            ? "border-[#e5e7eb] text-[#6b7280] hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                            : "border-[#e5e7eb] text-[#374151] hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100"
                        }`}>
                        {w.status === "Active" ? <><PowerOff size={11} /> Disable</> : <><Power size={11} /> Enable</>}
                      </button>
                      <button onClick={() => handleDelete(w.id)} disabled={isPending}
                        className="p-1.5 text-[#9ca3af] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {/* Mini log summary */}
                  {wLogs.length > 0 && (
                    <div className="mt-2 ml-5 flex items-center gap-3">
                      <span className="text-[10.5px] text-emerald-600">{wLogs.filter(l => l.success).length} success</span>
                      {wLogs.filter(l => !l.success).length > 0 && (
                        <span className="text-[10.5px] text-red-500">{wLogs.filter(l => !l.success).length} failed</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Webhook Logs */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#fafafa] transition-colors"
        >
          <div className="flex items-center gap-2">
            {showLogs ? <ChevronDown size={14} className="text-[#9ca3af]" /> : <ChevronRight size={14} className="text-[#9ca3af]" />}
            <p className="text-[13px] font-semibold text-[#111111]">Webhook Logs</p>
            <span className="text-[11px] bg-[#f3f4f6] text-[#6b7280] px-2 py-0.5 rounded-full font-medium">{logs.length}</span>
          </div>
        </button>
        {showLogs && (
          <div className="border-t border-[#e5e7eb]">
            {logs.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-[#9ca3af]">No webhook logs yet.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
                    {["Webhook", "Timestamp", "Size", "Status", "Retries", "Result", "Error"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {logs.slice(0, 50).map(log => (
                    <tr key={log.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-4 py-3 text-[12.5px] font-medium text-[#111111]">{log.webhook_name ?? "—"}</td>
                      <td className="px-4 py-3 text-[12px] text-[#9ca3af]">{log.timestamp.slice(0, 16).replace("T", " ")}</td>
                      <td className="px-4 py-3 text-[12px] text-[#9ca3af]">{log.payload_size}B</td>
                      <td className="px-4 py-3 text-[12px] text-[#9ca3af]">{log.response_status ?? "—"}</td>
                      <td className="px-4 py-3 text-[12px] text-[#9ca3af]">{log.retry_count}</td>
                      <td className="px-4 py-3">
                        {log.success
                          ? <CheckCircle2 size={13} className="text-emerald-500" />
                          : <XCircle size={13} className="text-red-500" />}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-red-500 max-w-[180px] truncate">{log.error_message ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
