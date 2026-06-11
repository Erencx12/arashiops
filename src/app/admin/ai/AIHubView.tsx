"use client";

import Link from "next/link";
import { Brain, Sparkles, Search, Lightbulb, BookOpen, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import type { DbAiJob, DbAiInsight, DbResearchReport } from "@/lib/db-types";

type UsageTotals = {
  totalRequests: number; totalTokensIn: number; totalTokensOut: number;
  totalCostUsd: number; avgResponseMs: number; todayRequests: number;
};
type LeadStats = {
  total: number; hot: number; warm: number; cold: number; disqualified: number; unscored: number;
};

type Props = {
  jobs: DbAiJob[];
  usageTotals: UsageTotals;
  leadStats: LeadStats;
  recentInsights: DbAiInsight[];
  recentReports: DbResearchReport[];
  apiConfigured: boolean;
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

const QUICK_LINKS = [
  { label: "Lead Scoring", desc: "Score Apollo leads with AI", href: "/admin/ai/leads", icon: Sparkles, color: "text-red-600" },
  { label: "Research",     desc: "Prospect & account reports",  href: "/admin/ai/research", icon: Search, color: "text-blue-600" },
  { label: "Insights",     desc: "ICP, campaigns, clients",     href: "/admin/ai/insights", icon: Lightbulb, color: "text-amber-600" },
  { label: "Prompts",      desc: "Manage prompt library",       href: "/admin/ai/prompts", icon: BookOpen, color: "text-violet-600" },
];

export function AIHubView({ jobs, usageTotals, leadStats, recentInsights, recentReports, apiConfigured }: Props) {
  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain size={18} className="text-[#111111]" />
            <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">AI Hub</h1>
          </div>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">Claude Intelligence Layer — analyze, score, and summarize. Humans approve all actions.</p>
        </div>
        {/* API Status */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-medium ${
          apiConfigured
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-amber-50 text-amber-700 border-amber-100"
        }`}>
          {apiConfigured ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
          {apiConfigured ? "Claude API Connected" : "Set ANTHROPIC_API_KEY"}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: "AI Requests",   value: usageTotals.totalRequests.toLocaleString() },
          { label: "Tokens Used",   value: (usageTotals.totalTokensIn + usageTotals.totalTokensOut).toLocaleString() },
          { label: "Est. Cost",     value: `$${usageTotals.totalCostUsd.toFixed(4)}` },
          { label: "Today",         value: usageTotals.todayRequests.toLocaleString() },
        ].map(item => (
          <div key={item.label} className="border border-[#e5e7eb] rounded-xl px-4 py-3.5 bg-white">
            <p className="text-[22px] font-bold tracking-tight text-[#111111]">{item.value}</p>
            <p className="text-[11.5px] text-[#9ca3af] font-medium mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Quick Links */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Tools</p>
          <div className="space-y-2">
            {QUICK_LINKS.map(link => (
              <Link key={link.href} href={link.href}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[#f3f4f6] transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                  <link.icon size={14} className={link.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#111111]">{link.label}</p>
                  <p className="text-[11.5px] text-[#9ca3af]">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Lead Score Distribution */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Lead Scores</p>
          <p className="text-[28px] font-bold tracking-tight text-[#111111] mb-1">{leadStats.total}</p>
          <p className="text-[12px] text-[#9ca3af] mb-4">Total leads in system</p>
          <div className="space-y-2">
            {[
              { label: "Hot",          value: leadStats.hot,          cls: "bg-red-500" },
              { label: "Warm",         value: leadStats.warm,         cls: "bg-amber-500" },
              { label: "Cold",         value: leadStats.cold,         cls: "bg-blue-400" },
              { label: "Disqualified", value: leadStats.disqualified, cls: "bg-[#d1d5db]" },
              { label: "Unscored",     value: leadStats.unscored,     cls: "bg-[#e5e7eb]" },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full shrink-0 ${row.cls}`} />
                <span className="text-[12px] text-[#6b7280] flex-1">{row.label}</span>
                <span className="text-[12px] font-semibold text-[#374151]">{row.value}</span>
              </div>
            ))}
          </div>
          <Link href="/admin/ai/leads" className="mt-4 block text-center text-[12px] text-[#6b7280] hover:text-[#111111] border border-[#e5e7eb] rounded-lg py-2 transition-colors">
            Score Leads →
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Recent AI Jobs</p>
          {jobs.length === 0 ? (
            <p className="text-[12.5px] text-[#9ca3af] text-center py-6">No AI jobs yet.</p>
          ) : (
            <div className="space-y-2">
              {jobs.slice(0, 8).map(job => (
                <div key={job.id} className="flex items-start gap-2.5 py-1.5">
                  <div className="mt-0.5 shrink-0">
                    {job.status === "Completed" ? <CheckCircle2 size={13} className="text-emerald-500" /> :
                     job.status === "Failed"    ? <XCircle size={13} className="text-red-500" /> :
                                                  <Clock size={13} className="text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#374151] truncate capitalize">
                      {job.task_type.replace(/_/g, " ")}
                    </p>
                    {job.subject_name && (
                      <p className="text-[11px] text-[#9ca3af] truncate">{job.subject_name}</p>
                    )}
                  </div>
                  <span className="text-[10.5px] text-[#9ca3af] whitespace-nowrap shrink-0">
                    {relativeTime(job.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Insights & Reports */}
      {(recentInsights.length > 0 || recentReports.length > 0) && (
        <div className="grid grid-cols-2 gap-6">
          {recentInsights.length > 0 && (
            <div className="border border-[#e5e7eb] rounded-xl bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Recent Insights</p>
              <div className="space-y-2">
                {recentInsights.map(ins => (
                  <div key={ins.id} className="flex items-center gap-2 py-1">
                    <Lightbulb size={12} className="text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] text-[#374151] truncate">{ins.title}</p>
                      <p className="text-[11px] text-[#9ca3af] capitalize">{ins.insight_type.replace(/_/g, " ")}</p>
                    </div>
                    <span className="text-[10.5px] text-[#9ca3af] whitespace-nowrap">{relativeTime(ins.created_at)}</span>
                  </div>
                ))}
              </div>
              <Link href="/admin/ai/insights" className="mt-3 block text-[12px] text-[#6b7280] hover:text-[#111111] transition-colors">
                View all insights →
              </Link>
            </div>
          )}
          {recentReports.length > 0 && (
            <div className="border border-[#e5e7eb] rounded-xl bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Recent Research</p>
              <div className="space-y-2">
                {recentReports.map(rep => (
                  <div key={rep.id} className="flex items-center gap-2 py-1">
                    <Search size={12} className="text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] text-[#374151] truncate">{rep.subject_name}</p>
                      <p className="text-[11px] text-[#9ca3af] capitalize">{rep.report_type} research</p>
                    </div>
                    <span className="text-[10.5px] text-[#9ca3af] whitespace-nowrap">{relativeTime(rep.created_at)}</span>
                  </div>
                ))}
              </div>
              <Link href="/admin/ai/research" className="mt-3 block text-[12px] text-[#6b7280] hover:text-[#111111] transition-colors">
                View all research →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
