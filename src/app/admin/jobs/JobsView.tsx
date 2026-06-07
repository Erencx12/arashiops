"use client";

import { useState, useTransition } from "react";
import { RefreshCw, XCircle, Clock, PlayCircle, CheckCircle2, AlertCircle, Ban, Layers } from "lucide-react";
import type { DbJob, JobStatus } from "@/lib/db-types";
import { cancelJobAction, retryJobAction } from "@/lib/job-actions";

const STATUS_TABS: (JobStatus | "All")[] = ["All", "Queued", "Running", "Completed", "Failed", "Retrying", "Cancelled"];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Queued:    <Clock size={11} className="text-amber-500" />,
  Running:   <PlayCircle size={11} className="text-blue-500" />,
  Completed: <CheckCircle2 size={11} className="text-emerald-500" />,
  Failed:    <AlertCircle size={11} className="text-red-500" />,
  Retrying:  <RefreshCw size={11} className="text-orange-500" />,
  Cancelled: <Ban size={11} className="text-[#9ca3af]" />,
};

const QUEUE_LABELS: Record<string, string> = {
  incoming:  "Incoming",
  outgoing:  "Outgoing",
  scheduled: "Scheduled",
  retry:     "Retry",
};

type Stats = {
  queued: number; running: number; failed: number; completed: number; total: number;
  incoming: number; outgoing: number; scheduled: number; retry: number;
};

type Props = { jobs: DbJob[]; stats: Stats };

export function JobsView({ jobs, stats }: Props) {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [isPending, startTransition] = useTransition();

  const filtered = activeTab === "All" ? jobs : jobs.filter(j => j.status === activeTab);

  function handleCancel(id: number) {
    startTransition(async () => { await cancelJobAction(id); });
  }

  function handleRetry(id: number) {
    startTransition(async () => { await retryJobAction(id); });
  }

  function formatDuration(ms: number | null): string {
    if (!ms) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Jobs</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{stats.total} total jobs · {stats.running} running</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Queued",    value: stats.queued,    cls: stats.queued    > 0 ? "border-amber-100 bg-amber-50 text-amber-700" : "border-[#e5e7eb] bg-white text-[#9ca3af]" },
          { label: "Running",   value: stats.running,   cls: stats.running   > 0 ? "border-blue-100 bg-blue-50 text-blue-700" : "border-[#e5e7eb] bg-white text-[#9ca3af]" },
          { label: "Failed",    value: stats.failed,    cls: stats.failed    > 0 ? "border-red-100 bg-red-50 text-red-700" : "border-[#e5e7eb] bg-white text-[#9ca3af]" },
          { label: "Completed", value: stats.completed, cls: "border-emerald-100 bg-emerald-50 text-emerald-700" },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl px-4 py-3.5 ${s.cls}`}>
            <p className="text-[24px] font-bold tracking-tight">{s.value}</p>
            <p className="text-[11.5px] font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Queue distribution */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white p-4 mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Queue Distribution</p>
        <div className="grid grid-cols-4 gap-4">
          {(["incoming", "outgoing", "scheduled", "retry"] as const).map(qt => (
            <div key={qt} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Layers size={11} className="text-[#9ca3af]" />
                <p className="text-[12px] font-semibold text-[#111111]">{stats[qt]}</p>
              </div>
              <p className="text-[11px] text-[#9ca3af]">{QUEUE_LABELS[qt]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 mb-5 border-b border-[#e5e7eb]">
        {STATUS_TABS.map(tab => {
          const count = tab === "All" ? jobs.length : jobs.filter(j => j.status === tab).length;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[12.5px] font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab ? "border-[#111111] text-[#111111]" : "border-transparent text-[#6b7280] hover:text-[#111111]"
              }`}>
              {tab}
              <span className="ml-1.5 text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Jobs table */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Job", "Source", "Queue", "Status", "Created", "Started", "Duration", "Retries", "Error", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filtered.map(job => (
              <tr key={job.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3.5">
                  <p className="text-[13px] font-medium text-[#111111]">{job.name}</p>
                  {job.client_name && <p className="text-[11px] text-[#9ca3af]">{job.client_name}</p>}
                </td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{job.source ?? "—"}</td>
                <td className="px-4 py-3.5 text-[12px] text-[#9ca3af]">{QUEUE_LABELS[job.queue_type] ?? job.queue_type}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    {STATUS_ICONS[job.status]}
                    <span className="text-[12.5px] text-[#374151]">{job.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[12px] text-[#9ca3af]">{job.created_at.slice(0, 16).replace("T", " ")}</td>
                <td className="px-4 py-3.5 text-[12px] text-[#9ca3af]">{job.started_at ? job.started_at.slice(0, 16).replace("T", " ") : "—"}</td>
                <td className="px-4 py-3.5 text-[12px] text-[#9ca3af]">{formatDuration(job.duration_ms)}</td>
                <td className="px-4 py-3.5 text-[12px] text-[#9ca3af]">{job.retry_count}/{job.max_retries}</td>
                <td className="px-4 py-3.5 text-[11.5px] text-red-500 max-w-[150px] truncate">{job.error_message ?? "—"}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    {(job.status === "Failed" || job.status === "Cancelled") && job.retry_count < job.max_retries && (
                      <button onClick={() => handleRetry(job.id)} disabled={isPending}
                        className="p-1.5 text-[#9ca3af] hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50" title="Retry">
                        <RefreshCw size={12} />
                      </button>
                    )}
                    {(job.status === "Queued" || job.status === "Running") && (
                      <button onClick={() => handleCancel(job.id)} disabled={isPending}
                        className="p-1.5 text-[#9ca3af] hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50" title="Cancel">
                        <XCircle size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-[13px] text-[#9ca3af]">
            No {activeTab === "All" ? "" : activeTab.toLowerCase() + " "}jobs.
          </div>
        )}
      </div>
    </div>
  );
}
