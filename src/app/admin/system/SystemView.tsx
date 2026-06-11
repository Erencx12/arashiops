"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2, XCircle, AlertCircle, Clock, ChevronRight,
  Server, Shield, Activity, Eye, FileWarning,
} from "lucide-react";
import type { ConfigStatus } from "@/lib/config";
import type { DbAuditLog, DbErrorLog, DbHealthCheckResult } from "@/lib/db-types";

type Props = {
  configStatus: ConfigStatus[];
  criticalMissing: number;
  auditLogs: DbAuditLog[];
  errorLogs: DbErrorLog[];
  healthChecks: DbHealthCheckResult[];
};

function StatusDot({ status }: { status: string }) {
  if (status === "healthy")
    return <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />;
  if (status === "degraded" || status === "warning")
    return <AlertCircle size={13} className="text-amber-500 shrink-0" />;
  return <XCircle size={13} className="text-red-500 shrink-0" />;
}

function ConfigBadge({ configured }: { configured: boolean }) {
  if (configured) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
        <CheckCircle2 size={10} /> Set
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#9ca3af] bg-[#f3f4f6] border border-[#e5e7eb] px-2 py-0.5 rounded-full">
      <XCircle size={10} /> Missing
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TABS = ["Overview", "Config", "Health", "Audit Log", "Errors"] as const;
type Tab = typeof TABS[number];

export function SystemView({ configStatus, criticalMissing, auditLogs, errorLogs, healthChecks }: Props) {
  const [tab, setTab] = useState<Tab>("Overview");

  const configByCategory = configStatus.reduce<Record<string, ConfigStatus[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const configuredCount = configStatus.filter(s => s.configured).length;
  const unresolvedErrors = errorLogs.filter(e => !e.resolved).length;

  const overallHealth = () => {
    if (criticalMissing > 0) return "critical";
    if (healthChecks.some(h => h.status === "unhealthy")) return "unhealthy";
    if (healthChecks.some(h => h.status === "degraded")) return "degraded";
    return "healthy";
  };

  const health = overallHealth();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111111] tracking-tight">System</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Environment status, health checks, audit log, and deployment</p>
        </div>
        <Link
          href="/admin/system/deployment"
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#111111] bg-[#f3f4f6] border border-[#e5e7eb] px-3 py-1.5 rounded-lg hover:bg-[#e5e7eb] transition-colors"
        >
          Deployment Checklist <ChevronRight size={13} />
        </Link>
      </div>

      {/* Alert banner */}
      {criticalMissing > 0 && (
        <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium text-red-700">
              {criticalMissing} critical environment variable{criticalMissing > 1 ? "s" : ""} missing
            </p>
            <p className="text-[12px] text-red-600 mt-0.5">The app may not function correctly. Check the Config tab.</p>
          </div>
        </div>
      )}
      {unresolvedErrors > 0 && (
        <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-amber-700">
            <span className="font-medium">{unresolvedErrors} unresolved error{unresolvedErrors > 1 ? "s" : ""}</span> in the error log
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          {
            label: "Overall Health",
            value: health === "healthy" ? "Healthy" : health === "degraded" ? "Degraded" : "Critical",
            icon: <Activity size={14} />,
            color: health === "healthy" ? "text-emerald-600" : health === "degraded" ? "text-amber-600" : "text-red-600",
          },
          {
            label: "Config Coverage",
            value: `${configuredCount}/${configStatus.length}`,
            icon: <Server size={14} />,
            color: criticalMissing > 0 ? "text-red-600" : "text-[#111111]",
          },
          {
            label: "Audit Events",
            value: auditLogs.length,
            icon: <Shield size={14} />,
            color: "text-[#111111]",
          },
          {
            label: "Unresolved Errors",
            value: unresolvedErrors,
            icon: <FileWarning size={14} />,
            color: unresolvedErrors > 0 ? "text-red-600" : "text-[#111111]",
          },
        ].map(card => (
          <div key={card.label} className="bg-white border border-[#e5e7eb] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[#6b7280] mb-2">
              {card.icon}
              <span className="text-[11.5px] font-medium">{card.label}</span>
            </div>
            <p className={`text-[22px] font-semibold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#e5e7eb] mb-5">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-[#111111] text-[#111111]"
                : "border-transparent text-[#6b7280] hover:text-[#111111]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "Overview" && (
        <div className="grid grid-cols-2 gap-5">
          {/* Health Services */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl">
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <h2 className="text-[13px] font-semibold text-[#111111]">Service Health</h2>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {healthChecks.length === 0 ? (
                <p className="text-[13px] text-[#9ca3af] px-5 py-4">No health checks yet. Hit /api/health to populate.</p>
              ) : (
                healthChecks.map(h => (
                  <div key={h.id} className="flex items-center gap-3 px-5 py-3">
                    <StatusDot status={h.status} />
                    <span className="text-[13px] font-medium text-[#111111] flex-1 capitalize">{h.service}</span>
                    <span className="text-[12px] text-[#9ca3af]">{h.message}</span>
                    {h.response_time_ms != null && (
                      <span className="text-[11px] text-[#9ca3af]">{h.response_time_ms}ms</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Audit Events */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl">
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <h2 className="text-[13px] font-semibold text-[#111111]">Recent Audit Events</h2>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {auditLogs.slice(0, 8).map(log => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                  <Eye size={12} className="text-[#9ca3af] mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-[#111111] truncate">{log.action}</p>
                    {log.actor_email && (
                      <p className="text-[11.5px] text-[#9ca3af] truncate">{log.actor_email}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-[#9ca3af] shrink-0">{timeAgo(log.created_at)}</span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-[13px] text-[#9ca3af] px-5 py-4">No audit events yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Config tab */}
      {tab === "Config" && (
        <div className="space-y-4">
          {Object.entries(configByCategory).map(([category, items]) => (
            <div key={category} className="bg-white border border-[#e5e7eb] rounded-xl">
              <div className="px-5 py-3 border-b border-[#e5e7eb]">
                <h2 className="text-[13px] font-semibold text-[#111111]">{category}</h2>
              </div>
              <div className="divide-y divide-[#f3f4f6]">
                {items.map(item => (
                  <div key={item.key} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[#111111]">{item.label}</p>
                      <p className="text-[11.5px] text-[#9ca3af] font-mono">{item.key}</p>
                    </div>
                    {item.required && !item.configured && (
                      <span className="text-[10px] font-medium text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">Required</span>
                    )}
                    <ConfigBadge configured={item.configured} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Health tab */}
      {tab === "Health" && (
        <div className="bg-white border border-[#e5e7eb] rounded-xl">
          <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-[#111111]">Health Check Results</h2>
            <a
              href="/api/health"
              target="_blank"
              className="text-[12px] text-[#6b7280] hover:text-[#111111] underline underline-offset-2"
            >
              Run health check ↗
            </a>
          </div>
          {healthChecks.length === 0 ? (
            <p className="text-[13px] text-[#9ca3af] px-5 py-6 text-center">
              No results yet. Visit <code className="font-mono">/api/health</code> to run a check.
            </p>
          ) : (
            <div className="divide-y divide-[#f3f4f6]">
              {healthChecks.map(h => (
                <div key={h.id} className="flex items-center gap-4 px-5 py-3.5">
                  <StatusDot status={h.status} />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-[#111111] capitalize">{h.service}</p>
                    <p className="text-[12px] text-[#9ca3af]">{h.message}</p>
                  </div>
                  {h.response_time_ms != null && (
                    <span className="text-[12px] text-[#6b7280]">{h.response_time_ms}ms</span>
                  )}
                  <div className="flex items-center gap-1 text-[11.5px] text-[#9ca3af]">
                    <Clock size={11} />
                    {timeAgo(h.checked_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Log tab */}
      {tab === "Audit Log" && (
        <div className="bg-white border border-[#e5e7eb] rounded-xl">
          <div className="px-5 py-4 border-b border-[#e5e7eb]">
            <h2 className="text-[13px] font-semibold text-[#111111]">Audit Log</h2>
            <p className="text-[12px] text-[#9ca3af] mt-0.5">Last 50 events</p>
          </div>
          <div className="divide-y divide-[#f3f4f6]">
            {auditLogs.length === 0 ? (
              <p className="text-[13px] text-[#9ca3af] px-5 py-6 text-center">No audit events yet.</p>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 px-5 py-3">
                  <Shield size={12} className="text-[#9ca3af] mt-0.5 shrink-0" />
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[12.5px] font-medium text-[#111111]">{log.action}</p>
                      {log.actor_email && (
                        <p className="text-[11.5px] text-[#9ca3af]">{log.actor_email}</p>
                      )}
                    </div>
                    <div>
                      {log.target_type && (
                        <p className="text-[12px] text-[#6b7280]">
                          {log.target_type} {log.target_id ? `#${log.target_id}` : ""}
                        </p>
                      )}
                      {log.actor_role && (
                        <p className="text-[11.5px] text-[#9ca3af] capitalize">{log.actor_role}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[11.5px] text-[#9ca3af]">{timeAgo(log.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Errors tab */}
      {tab === "Errors" && (
        <div className="bg-white border border-[#e5e7eb] rounded-xl">
          <div className="px-5 py-4 border-b border-[#e5e7eb]">
            <h2 className="text-[13px] font-semibold text-[#111111]">Error Log</h2>
            <p className="text-[12px] text-[#9ca3af] mt-0.5">Last 20 errors</p>
          </div>
          <div className="divide-y divide-[#f3f4f6]">
            {errorLogs.length === 0 ? (
              <p className="text-[13px] text-[#9ca3af] px-5 py-6 text-center">No errors logged.</p>
            ) : (
              errorLogs.map(err => (
                <div key={err.id} className="px-5 py-3.5">
                  <div className="flex items-start gap-3">
                    {err.resolved
                      ? <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                      : <XCircle size={13} className="text-red-500 mt-0.5 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-[#9ca3af] bg-[#f3f4f6] border border-[#e5e7eb] px-1.5 py-0.5 rounded font-mono">
                          {err.error_type}
                        </span>
                        {err.resolved && (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            Resolved
                          </span>
                        )}
                        <span className="ml-auto text-[11.5px] text-[#9ca3af]">{timeAgo(err.created_at)}</span>
                      </div>
                      <p className="text-[13px] text-[#111111] mt-1 font-medium truncate">{err.message}</p>
                      {err.stack && (
                        <pre className="text-[10.5px] text-[#9ca3af] mt-1 truncate">{err.stack.split("\n")[0]}</pre>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
