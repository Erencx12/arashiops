"use client";

import { useState } from "react";
import type { DbSystemLog, LogEventType, LogLevel } from "@/lib/db-types";

const EVENT_TABS: (LogEventType | "all")[] = ["all", "system", "user", "integration", "webhook", "automation", "security"];
const LEVEL_FILTERS: (LogLevel | "all")[] = ["all", "info", "warn", "error", "debug"];

const LEVEL_STYLES: Record<string, string> = {
  info:  "bg-blue-50 text-blue-700 border-blue-100",
  warn:  "bg-amber-50 text-amber-700 border-amber-100",
  error: "bg-red-50 text-red-700 border-red-100",
  debug: "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
};

const EVENT_COLORS: Record<string, string> = {
  system:      "text-[#374151]",
  user:        "text-blue-700",
  integration: "text-violet-700",
  webhook:     "text-amber-700",
  automation:  "text-orange-700",
  security:    "text-red-700",
};

type Stats = { total: number; errors: number; warnings: number; today: number };
type Props = { logs: DbSystemLog[]; stats: Stats };

export function LogsView({ logs, stats }: Props) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeLevel, setActiveLevel] = useState<string>("all");

  const filtered = logs.filter(l => {
    const tabMatch   = activeTab   === "all" || l.event_type === activeTab;
    const levelMatch = activeLevel === "all" || l.level      === activeLevel;
    return tabMatch && levelMatch;
  });

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">System Logs</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">{stats.total} total · {stats.today} today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",    value: stats.total,    cls: "border-[#e5e7eb] bg-white text-[#111111]" },
          { label: "Today",    value: stats.today,    cls: "border-blue-100 bg-blue-50 text-blue-700" },
          { label: "Errors",   value: stats.errors,   cls: stats.errors   > 0 ? "border-red-100 bg-red-50 text-red-700" : "border-[#e5e7eb] bg-[#fafafa] text-[#9ca3af]" },
          { label: "Warnings", value: stats.warnings, cls: stats.warnings > 0 ? "border-amber-100 bg-amber-50 text-amber-700" : "border-[#e5e7eb] bg-[#fafafa] text-[#9ca3af]" },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl px-4 py-3.5 ${s.cls}`}>
            <p className="text-[24px] font-bold tracking-tight">{s.value}</p>
            <p className="text-[11.5px] font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Event type tabs */}
      <div className="flex items-center gap-0.5 border-b border-[#e5e7eb] mb-4">
        {EVENT_TABS.map(tab => {
          const count = tab === "all" ? logs.length : logs.filter(l => l.event_type === tab).length;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[12.5px] font-medium border-b-2 -mb-px capitalize transition-colors ${
                activeTab === tab ? "border-[#111111] text-[#111111]" : "border-transparent text-[#6b7280] hover:text-[#111111]"
              }`}>
              {tab}
              <span className="ml-1.5 text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Level filter chips */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[11.5px] text-[#9ca3af]">Level:</span>
        {LEVEL_FILTERS.map(lvl => (
          <button key={lvl} onClick={() => setActiveLevel(lvl)}
            className={`px-2.5 py-1 rounded-full text-[11.5px] font-medium border transition-colors ${
              activeLevel === lvl
                ? lvl === "all" ? "border-[#111111] bg-[#111111] text-white" : `${LEVEL_STYLES[lvl]}`
                : "border-[#e5e7eb] text-[#6b7280] hover:border-[#9ca3af]"
            }`}>
            {lvl}
          </button>
        ))}
      </div>

      {/* Logs table */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Timestamp", "Level", "Type", "Module", "Message", "Client"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filtered.slice(0, 200).map(log => (
              <tr key={log.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3 text-[11.5px] text-[#9ca3af] font-mono whitespace-nowrap">
                  {log.created_at.slice(0, 19).replace("T", " ")}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium border ${LEVEL_STYLES[log.level] ?? LEVEL_STYLES.debug}`}>
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[12px] font-medium capitalize ${EVENT_COLORS[log.event_type] ?? ""}`}>
                    {log.event_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#9ca3af]">{log.module ?? "—"}</td>
                <td className="px-4 py-3 text-[12.5px] text-[#374151] max-w-[360px]">{log.message}</td>
                <td className="px-4 py-3 text-[12px] text-[#9ca3af]">{log.client_name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-[13px] text-[#9ca3af]">No logs match the current filter.</div>
        )}
      </div>
    </div>
  );
}
