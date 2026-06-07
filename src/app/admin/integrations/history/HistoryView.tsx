"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, RefreshCw, ArrowLeft } from "lucide-react";
import type { DbSyncHistory, DbIntegration } from "@/lib/db-types";

type Props = {
  history:      DbSyncHistory[];
  stats:        { total: number; success: number; failed: number; today: number };
  integrations: DbIntegration[];
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDuration(ms: number | null) {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function HistoryView({ history, stats, integrations }: Props) {
  const [filterInteg, setFilterInteg] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = history.filter(h => {
    if (filterInteg !== "all" && String(h.integration_id) !== filterInteg) return false;
    if (filterStatus !== "all" && h.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/integrations" className="text-[12px] text-[#9ca3af] hover:text-[#111111] transition-colors flex items-center gap-1">
              <ArrowLeft size={11} /> Integrations
            </Link>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Sync History</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{stats.total} total syncs · {stats.success} succeeded · {stats.failed} failed</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Syncs",    value: stats.total,   color: "text-[#374151] bg-white border-[#e5e7eb]" },
          { label: "Succeeded",      value: stats.success, color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
          { label: "Failed",         value: stats.failed,  color: stats.failed > 0 ? "text-red-700 bg-red-50 border-red-100" : "text-[#9ca3af] bg-[#fafafa] border-[#e5e7eb]" },
          { label: "Today",          value: stats.today,   color: "text-blue-700 bg-blue-50 border-blue-100" },
        ].map(item => (
          <div key={item.label} className={`border rounded-xl px-4 py-3.5 ${item.color}`}>
            <p className="text-[24px] font-bold tracking-tight">{item.value}</p>
            <p className="text-[11.5px] font-medium mt-0.5 opacity-80">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={filterInteg}
          onChange={e => setFilterInteg(e.target.value)}
          className="border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none bg-white focus:border-[#111111] transition-colors"
        >
          <option value="all">All Integrations</option>
          {integrations.map(i => <option key={i.id} value={String(i.id)}>{i.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none bg-white focus:border-[#111111] transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
          <option value="Running">Running</option>
        </select>
        <span className="text-[12px] text-[#9ca3af]">{filtered.length} records</span>
      </div>

      {/* Table */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <RefreshCw size={24} className="text-[#d1d5db] mx-auto mb-3" />
            <p className="text-[13px] text-[#9ca3af]">No sync history yet.</p>
            <p className="text-[12px] text-[#9ca3af] mt-1">Run your first sync from the Integrations page.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
                {["Integration", "Operation", "Status", "Processed", "Created", "Updated", "Duration", "When", "Error"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-medium text-[#111111]">{row.integration_name ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280] capitalize">
                    {row.operation.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3.5">
                    <SyncStatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3.5 text-[12.5px] text-[#374151] tabular-nums">{row.records_processed}</td>
                  <td className="px-4 py-3.5 text-[12.5px] text-emerald-600 tabular-nums">{row.records_created > 0 ? `+${row.records_created}` : "—"}</td>
                  <td className="px-4 py-3.5 text-[12.5px] text-blue-600 tabular-nums">{row.records_updated > 0 ? `~${row.records_updated}` : "—"}</td>
                  <td className="px-4 py-3.5 text-[12.5px] text-[#9ca3af] tabular-nums">{formatDuration(row.duration_ms)}</td>
                  <td className="px-4 py-3.5 text-[12px] text-[#9ca3af] whitespace-nowrap">{relativeTime(row.started_at)}</td>
                  <td className="px-4 py-3.5 max-w-[200px]">
                    {row.error_message ? (
                      <span className="text-[11px] text-red-500 truncate block" title={row.error_message}>
                        {row.error_message.slice(0, 60)}
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SyncStatusBadge({ status }: { status: string }) {
  if (status === "Success") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle2 size={9} /> Success
      </span>
    );
  }
  if (status === "Failed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-100">
        <XCircle size={9} /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
      <Clock size={9} /> Running
    </span>
  );
}
