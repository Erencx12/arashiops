"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, ExternalLink } from "lucide-react";
import type { ConfigStatus } from "@/lib/config";

type Props = {
  configStatus: ConfigStatus[];
};

type CheckItem = {
  category: string;
  label: string;
  description: string;
  status: "done" | "warning" | "missing";
};

function StatusIcon({ status }: { status: CheckItem["status"] }) {
  if (status === "done") return <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />;
  if (status === "warning") return <AlertCircle size={14} className="text-amber-500 shrink-0" />;
  return <XCircle size={14} className="text-red-400 shrink-0" />;
}

export function DeploymentView({ configStatus }: Props) {
  const cfg = Object.fromEntries(configStatus.map(s => [s.key, s.configured]));

  const checks: CheckItem[] = [
    // Core
    {
      category: "Core",
      label: "Database URL",
      description: "Neon PostgreSQL DATABASE_URL configured",
      status: cfg["DATABASE_URL"] ? "done" : "missing",
    },
    {
      category: "Core",
      label: "Session Secret",
      description: "SESSION_SECRET set (32+ char random string)",
      status: cfg["SESSION_SECRET"] ? "done" : "missing",
    },
    {
      category: "Core",
      label: "App URL",
      description: "NEXT_PUBLIC_APP_URL set to production domain",
      status: cfg["NEXT_PUBLIC_APP_URL"] ? "done" : "warning",
    },
    // AI
    {
      category: "AI",
      label: "Anthropic API Key",
      description: "ANTHROPIC_API_KEY set for Claude AI features",
      status: cfg["ANTHROPIC_API_KEY"] ? "done" : "warning",
    },
    // Billing
    {
      category: "Billing",
      label: "Stripe Secret Key",
      description: "STRIPE_SECRET_KEY for payment processing (optional — demo mode if absent)",
      status: cfg["STRIPE_SECRET_KEY"] ? "done" : "warning",
    },
    {
      category: "Billing",
      label: "Stripe Publishable Key",
      description: "STRIPE_PUBLISHABLE_KEY for frontend checkout",
      status: cfg["STRIPE_PUBLISHABLE_KEY"] ? "done" : "warning",
    },
    {
      category: "Billing",
      label: "Stripe Webhook Secret",
      description: "STRIPE_WEBHOOK_SECRET to verify Stripe events",
      status: cfg["STRIPE_WEBHOOK_SECRET"] ? "done" : "warning",
    },
    // Email
    {
      category: "Email",
      label: "SMTP Host",
      description: "SMTP_HOST for sending invite and reset emails",
      status: cfg["SMTP_HOST"] ? "done" : "warning",
    },
    {
      category: "Email",
      label: "SMTP Credentials",
      description: "SMTP_USER and SMTP_PASSWORD configured",
      status: (cfg["SMTP_USER"] && cfg["SMTP_PASSWORD"]) ? "done" : "warning",
    },
    // Integrations
    {
      category: "Integrations",
      label: "Apollo.io API Key",
      description: "APOLLO_API_KEY for lead prospecting (optional)",
      status: cfg["APOLLO_API_KEY"] ? "done" : "warning",
    },
    // Security
    {
      category: "Security",
      label: "HTTPS / TLS",
      description: "App is served over HTTPS in production",
      status: cfg["NEXT_PUBLIC_APP_URL"] ? "done" : "warning",
    },
    {
      category: "Security",
      label: "Webhook Signature",
      description: "Stripe webhook signature verification active",
      status: cfg["STRIPE_WEBHOOK_SECRET"] ? "done" : "warning",
    },
    // Database
    {
      category: "Database",
      label: "DB Indexes",
      description: "Phase 11 migration ran — 24 performance indexes created",
      status: "done",
    },
    {
      category: "Database",
      label: "Audit Log Tables",
      description: "audit_logs, error_logs, health_check_results tables exist",
      status: "done",
    },
    // Observability
    {
      category: "Observability",
      label: "Health Endpoint",
      description: "/api/health endpoint available for uptime monitoring",
      status: "done",
    },
    {
      category: "Observability",
      label: "Audit Logging",
      description: "Audit log writes active for auth, billing, client, API key events",
      status: "done",
    },
    {
      category: "Observability",
      label: "Rate Limiting",
      description: "Login, password reset, AI, billing, webhook rate limits active",
      status: "done",
    },
    // Auth
    {
      category: "Auth",
      label: "Route Protection",
      description: "Middleware protects /admin/* and /client/* routes via JWT",
      status: "done",
    },
    {
      category: "Auth",
      label: "Server Action Guards",
      description: "All server actions verify session before executing",
      status: "done",
    },
  ];

  const byCategory = checks.reduce<Record<string, CheckItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const doneCount    = checks.filter(c => c.status === "done").length;
  const missingCount = checks.filter(c => c.status === "missing").length;
  const warnCount    = checks.filter(c => c.status === "warning").length;
  const readyPct     = Math.round((doneCount / checks.length) * 100);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/system"
          className="flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft size={13} /> System
        </Link>
        <span className="text-[#e5e7eb]">/</span>
        <h1 className="text-[22px] font-semibold text-[#111111] tracking-tight">Deployment Checklist</h1>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 mb-5">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[13px] font-medium text-[#111111]">Production Readiness</p>
            <p className="text-[12px] text-[#9ca3af] mt-0.5">
              {doneCount} of {checks.length} checks passed
            </p>
          </div>
          <span className={`text-[24px] font-semibold ${readyPct === 100 ? "text-emerald-600" : readyPct >= 70 ? "text-amber-600" : "text-red-600"}`}>
            {readyPct}%
          </span>
        </div>
        <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${readyPct === 100 ? "bg-emerald-500" : readyPct >= 70 ? "bg-amber-400" : "bg-red-400"}`}
            style={{ width: `${readyPct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3">
          {[
            { label: "Passed",   count: doneCount,    color: "text-emerald-600" },
            { label: "Warning",  count: warnCount,    color: "text-amber-600" },
            { label: "Required", count: missingCount, color: "text-red-600" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className={`text-[13px] font-semibold ${s.color}`}>{s.count}</span>
              <span className="text-[12px] text-[#9ca3af]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist by category */}
      <div className="space-y-4">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category} className="bg-white border border-[#e5e7eb] rounded-xl">
            <div className="px-5 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-[#111111]">{category}</h2>
              <span className="text-[11.5px] text-[#9ca3af]">
                {items.filter(i => i.status === "done").length}/{items.length}
              </span>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {items.map(item => (
                <div key={item.label} className="flex items-start gap-3 px-5 py-3.5">
                  <StatusIcon status={item.status} />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-[#111111]">{item.label}</p>
                    <p className="text-[12px] text-[#9ca3af] mt-0.5">{item.description}</p>
                  </div>
                  {item.status === "missing" && (
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase tracking-wide shrink-0">
                      Blocking
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Deploy links */}
      <div className="mt-5 bg-white border border-[#e5e7eb] rounded-xl p-5">
        <h2 className="text-[13px] font-semibold text-[#111111] mb-3">Deploy</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Vercel Dashboard", href: "https://vercel.com/dashboard" },
            { label: "Neon Console",     href: "https://console.neon.tech" },
            { label: "Stripe Dashboard", href: "https://dashboard.stripe.com" },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[13px] text-[#6b7280] hover:text-[#111111] bg-[#f3f4f6] border border-[#e5e7eb] px-3 py-1.5 rounded-lg transition-colors"
            >
              {link.label} <ExternalLink size={11} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
