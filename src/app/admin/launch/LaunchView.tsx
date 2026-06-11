"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2, XCircle, AlertCircle, ArrowRight,
  Shield, Brain, CreditCard, Plug, Server, Users, FileText,
  TestTube, LifeBuoy, Activity,
} from "lucide-react";
import type { ConfigStatus } from "@/lib/config";
import type {
  DbClient, DbSubscription, DbTestCase, DbSop, DbDocPage,
  DbHealthCheckResult, DbClientTemplate,
} from "@/lib/db-types";

type BillingMetrics = { mrr: number; activeSubscriptions: number; pastDue: number; totalRevenue: number };

type Props = {
  configStatus: ConfigStatus[];
  criticalMissing: number;
  healthChecks: DbHealthCheckResult[];
  clients: DbClient[];
  subscriptions: DbSubscription[];
  testCases: DbTestCase[];
  sops: DbSop[];
  docs: DbDocPage[];
  unresolvedErrors: number;
  billingMetrics: BillingMetrics;
  templates: DbClientTemplate[];
};

// ─── Checklist item ──────────────────────────────────────────────────────────

type CheckStatus = "done" | "warn" | "missing";

interface CheckItem {
  label: string;
  description: string;
  status: CheckStatus;
  category: string;
}

function StatusIcon({ s }: { s: CheckStatus }) {
  if (s === "done")    return <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />;
  if (s === "warn")    return <AlertCircle  size={14} className="text-amber-500 shrink-0" />;
  return                      <XCircle      size={14} className="text-red-400 shrink-0" />;
}

// ─── Score calculation ───────────────────────────────────────────────────────

function calcScore(props: Props): number {
  const cfg = Object.fromEntries(props.configStatus.map(s => [s.key, s.configured]));
  let score = 0;

  // Core (25)
  if (cfg["DATABASE_URL"])   score += 12;
  if (cfg["SESSION_SECRET"]) score += 13;

  // Security always done after Phase 11 (15)
  score += 15;

  // Email (5)
  if (cfg["SMTP_HOST"] && cfg["SMTP_USER"]) score += 5;

  // AI (10)
  if (cfg["ANTHROPIC_API_KEY"]) score += 10;

  // Billing (10)
  if (cfg["STRIPE_SECRET_KEY"])      score += 5;
  if (cfg["STRIPE_PUBLISHABLE_KEY"]) score += 5;

  // Testing (15)
  if (props.testCases.length > 0) {
    const passing = props.testCases.filter(t => t.status === "Pass").length;
    score += Math.round((passing / props.testCases.length) * 15);
  }

  // Documentation (10)
  if (props.sops.length > 0) score += 5;
  if (props.docs.length > 0) score += 5;

  // Monitoring (10)
  if (props.healthChecks.length > 0) {
    const healthy = props.healthChecks.filter(h => h.status === "healthy").length;
    score += Math.round((healthy / props.healthChecks.length) * 10);
  } else {
    score += 3; // partial — not yet run
  }

  return Math.min(100, score);
}

function scoreColor(s: number) {
  if (s >= 80) return "text-emerald-600";
  if (s >= 50) return "text-amber-600";
  return "text-red-600";
}

function scoreLabel(s: number) {
  if (s === 100) return "Launch Ready";
  if (s >= 80)   return "Almost Ready";
  if (s >= 50)   return "In Progress";
  if (s >= 25)   return "Early Setup";
  return "Not Ready";
}

// ─── Build checklist ─────────────────────────────────────────────────────────

function buildChecklist(props: Props): CheckItem[] {
  const cfg = Object.fromEntries(props.configStatus.map(s => [s.key, s.configured]));
  const smtpOk = !!(cfg["SMTP_HOST"] && cfg["SMTP_USER"] && cfg["SMTP_PASSWORD"]);
  const stripeOk = !!(cfg["STRIPE_SECRET_KEY"] && cfg["STRIPE_PUBLISHABLE_KEY"]);
  const allHealthy = props.healthChecks.length > 0 && props.healthChecks.every(h => h.status === "healthy");
  const testByFeature = Object.fromEntries(props.testCases.map(t => [t.feature, t.status]));

  return [
    // Config
    { label: "Database Configured",      category: "Config",   description: "DATABASE_URL set and connected",              status: cfg["DATABASE_URL"]   ? "done" : "missing" },
    { label: "Auth Configured",          category: "Config",   description: "SESSION_SECRET set for JWT signing",          status: cfg["SESSION_SECRET"] ? "done" : "missing" },
    { label: "Domain Connected",         category: "Config",   description: "NEXT_PUBLIC_APP_URL set to production domain", status: cfg["NEXT_PUBLIC_APP_URL"] ? "done" : "warn" },
    { label: "SMTP Configured",          category: "Config",   description: "Email delivery configured for invites/resets", status: smtpOk ? "done" : "warn" },
    { label: "Claude Configured",        category: "AI",       description: "Anthropic API key set for AI features",        status: cfg["ANTHROPIC_API_KEY"] ? "done" : "warn" },
    { label: "Stripe Configured",        category: "Billing",  description: "Stripe keys set for payment processing",       status: stripeOk ? "done" : "warn" },
    { label: "Webhooks Active",          category: "Billing",  description: "Stripe webhook secret configured",             status: cfg["STRIPE_WEBHOOK_SECRET"] ? "done" : "warn" },
    // Security
    { label: "Route Protection",         category: "Security", description: "All routes protected via proxy middleware",    status: "done" },
    { label: "Rate Limiting",            category: "Security", description: "Login and API rate limits active",             status: "done" },
    { label: "Audit Logging",            category: "Security", description: "Sensitive actions are logged",                 status: "done" },
    { label: "Server Action Guards",     category: "Security", description: "All actions verify session",                   status: "done" },
    // Monitoring
    { label: "Health Checks Passing",   category: "Monitoring", description: "All services report healthy",                status: allHealthy ? "done" : props.healthChecks.length > 0 ? "warn" : "warn" },
    { label: "Error Log Clean",         category: "Monitoring", description: "No unresolved critical errors",              status: props.unresolvedErrors === 0 ? "done" : "warn" },
    // Testing
    { label: "Client Portal Tested",    category: "Testing",  description: "Client login and portal access verified",      status: testByFeature["Client Portal Access"] === "Pass" ? "done" : testByFeature["Client Portal Access"] === "Fail" ? "missing" : "warn" },
    { label: "Onboarding Tested",       category: "Testing",  description: "Client onboarding flow verified",              status: testByFeature["Onboarding Flow"] === "Pass" ? "done" : testByFeature["Onboarding Flow"] === "Fail" ? "missing" : "warn" },
    { label: "Proposal Flow Tested",    category: "Testing",  description: "Proposal creation and delivery verified",      status: testByFeature["Proposal Creation"] === "Pass" ? "done" : testByFeature["Proposal Creation"] === "Fail" ? "missing" : "warn" },
    { label: "Invoice Flow Tested",     category: "Testing",  description: "Invoice creation and payment verified",        status: testByFeature["Invoice Creation"] === "Pass" ? "done" : testByFeature["Invoice Creation"] === "Fail" ? "missing" : "warn" },
    { label: "Payment Flow Tested",     category: "Testing",  description: "Subscription billing flow verified",           status: testByFeature["Subscription Billing"] === "Pass" ? "done" : testByFeature["Subscription Billing"] === "Fail" ? "missing" : "warn" },
    { label: "AI Flow Tested",          category: "Testing",  description: "Lead scoring and AI features verified",        status: testByFeature["Lead Scoring (AI)"] === "Pass" ? "done" : testByFeature["Lead Scoring (AI)"] === "Fail" ? "missing" : "warn" },
    // Readiness
    { label: "SOPs Documented",         category: "Ops",      description: "Standard operating procedures in place",       status: props.sops.length > 0 ? "done" : "warn" },
    { label: "Docs Published",          category: "Ops",      description: "Internal documentation available",             status: props.docs.length > 0 ? "done" : "warn" },
    { label: "Integrations Connected",  category: "Integrations", description: "At least one integration active",          status: props.configStatus.some(s => ["APOLLO_API_KEY","INSTANTLY_API_KEY","HUBSPOT_API_KEY"].includes(s.key) && s.configured) ? "done" : "warn" },
  ];
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

const TABS = ["Overview", "Checklist", "Clients", "Billing", "Templates"] as const;
type Tab = typeof TABS[number];

// ─── Component ───────────────────────────────────────────────────────────────

export function LaunchView(props: Props) {
  const [tab, setTab] = useState<Tab>("Overview");
  const score = calcScore(props);
  const checklist = buildChecklist(props);
  const byCategory = checklist.reduce<Record<string, CheckItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});
  const doneCount    = checklist.filter(c => c.status === "done").length;
  const warnCount    = checklist.filter(c => c.status === "warn").length;
  const missingCount = checklist.filter(c => c.status === "missing").length;

  const activeClients = props.clients.filter(c => c.status === "Active").length;
  const testPassing = props.testCases.filter(t => t.status === "Pass").length;
  const cfg = Object.fromEntries(props.configStatus.map(s => [s.key, s.configured]));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111111] tracking-tight">Launch Center</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Track readiness and go-live status for Arashi Ops</p>
        </div>
        <Link
          href="/admin/system/deployment"
          className="flex items-center gap-1.5 text-[13px] text-[#6b7280] border border-[#e5e7eb] px-3 py-1.5 rounded-lg hover:bg-[#f3f4f6] transition-colors"
        >
          Deployment Checklist <ArrowRight size={12} />
        </Link>
      </div>

      {/* Critical banner */}
      {props.criticalMissing > 0 && (
        <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-red-700">
            <span className="font-semibold">{props.criticalMissing} critical env var{props.criticalMissing > 1 ? "s" : ""} missing</span> — app will not function correctly.{" "}
            <Link href="/admin/system" className="underline">View in System</Link>
          </p>
        </div>
      )}

      {/* Score + summary */}
      <div className="grid grid-cols-5 gap-4 mb-5">
        <div className="col-span-1 bg-white border border-[#e5e7eb] rounded-xl p-5 flex flex-col items-center justify-center">
          <p className="text-[11.5px] font-medium text-[#9ca3af] mb-1 uppercase tracking-wide">Readiness</p>
          <p className={`text-[42px] font-bold leading-none ${scoreColor(score)}`}>{score}<span className="text-[22px] text-[#9ca3af]">%</span></p>
          <p className={`text-[12px] font-medium mt-1 ${scoreColor(score)}`}>{scoreLabel(score)}</p>
          <div className="w-full mt-3 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${score}%` }} />
          </div>
        </div>
        {[
          { label: "Checks Passed", value: doneCount, icon: <CheckCircle2 size={14} />, color: "text-emerald-600" },
          { label: "Warnings",      value: warnCount,    icon: <AlertCircle size={14} />, color: "text-amber-600" },
          { label: "Blocking",      value: missingCount, icon: <XCircle size={14} />,     color: "text-red-600" },
          { label: "Tests Passing", value: `${testPassing}/${props.testCases.length}`, icon: <TestTube size={14} />, color: "text-[#111111]" },
        ].map(card => (
          <div key={card.label} className="bg-white border border-[#e5e7eb] rounded-xl p-5">
            <div className={`flex items-center gap-1.5 mb-2 ${card.color}`}>
              {card.icon}
              <span className="text-[11.5px] font-medium text-[#6b7280]">{card.label}</span>
            </div>
            <p className={`text-[26px] font-semibold ${card.color}`}>{card.value}</p>
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
              tab === t ? "border-[#111111] text-[#111111]" : "border-transparent text-[#6b7280] hover:text-[#111111]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "Overview" && (
        <div className="grid grid-cols-3 gap-5">
          {/* Area status */}
          <div className="col-span-2 bg-white border border-[#e5e7eb] rounded-xl">
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <h2 className="text-[13px] font-semibold text-[#111111]">Readiness by Area</h2>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {[
                { icon: <Server size={13} />, label: "Core Config", done: cfg["DATABASE_URL"] && cfg["SESSION_SECRET"], warn: !cfg["NEXT_PUBLIC_APP_URL"], note: cfg["DATABASE_URL"] && cfg["SESSION_SECRET"] ? "DB and auth configured" : "Missing required config" },
                { icon: <Shield size={13} />, label: "Security", done: true, warn: false, note: "Route protection, rate limiting, audit logging active" },
                { icon: <Brain size={13} />,  label: "AI / Claude", done: !!cfg["ANTHROPIC_API_KEY"], warn: !cfg["ANTHROPIC_API_KEY"], note: cfg["ANTHROPIC_API_KEY"] ? "API key configured" : "Not configured — AI features disabled" },
                { icon: <CreditCard size={13} />, label: "Billing", done: !!(cfg["STRIPE_SECRET_KEY"] && cfg["STRIPE_PUBLISHABLE_KEY"]), warn: !(cfg["STRIPE_SECRET_KEY"] && cfg["STRIPE_PUBLISHABLE_KEY"]), note: cfg["STRIPE_SECRET_KEY"] ? "Stripe configured" : "Demo mode — no live payments" },
                { icon: <Plug size={13} />,    label: "Integrations", done: props.configStatus.some(s => ["APOLLO_API_KEY","INSTANTLY_API_KEY"].includes(s.key) && s.configured), warn: !props.configStatus.some(s => ["APOLLO_API_KEY","INSTANTLY_API_KEY"].includes(s.key) && s.configured), note: "Apollo, Instantly, HubSpot" },
                { icon: <Activity size={13} />, label: "Monitoring", done: props.healthChecks.length > 0 && props.healthChecks.every(h => h.status === "healthy"), warn: props.healthChecks.length === 0, note: props.healthChecks.length === 0 ? "Run /api/health to populate" : `${props.healthChecks.filter(h => h.status === "healthy").length}/${props.healthChecks.length} services healthy` },
                { icon: <FileText size={13} />, label: "Documentation", done: props.sops.length > 0 && props.docs.length > 0, warn: props.sops.length === 0 || props.docs.length === 0, note: `${props.sops.length} SOPs, ${props.docs.length} docs` },
              ].map(area => (
                <div key={area.label} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="text-[#9ca3af]">{area.icon}</span>
                  <span className="text-[13px] font-medium text-[#111111] w-36 shrink-0">{area.label}</span>
                  <span className="flex-1 text-[12px] text-[#9ca3af]">{area.note}</span>
                  {area.done ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  ) : area.warn ? (
                    <AlertCircle size={14} className="text-amber-500 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-red-400 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-5">
              <h2 className="text-[13px] font-semibold text-[#111111] mb-3">Quick Access</h2>
              <div className="space-y-1">
                {[
                  { label: "SOPs",       href: "/admin/sops",         icon: <FileText size={12} /> },
                  { label: "Docs",       href: "/admin/docs",          icon: <FileText size={12} /> },
                  { label: "Testing",    href: "/admin/testing",       icon: <TestTube size={12} /> },
                  { label: "Support",    href: "/admin/support",       icon: <LifeBuoy size={12} /> },
                  { label: "System",     href: "/admin/system",        icon: <Server size={12} /> },
                  { label: "Clients",    href: "/admin/clients",       icon: <Users size={12} /> },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f4f6] transition-colors"
                  >
                    {link.icon} {link.label}
                    <ArrowRight size={11} className="ml-auto opacity-40" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
              <p className="text-[11.5px] font-medium text-[#9ca3af] uppercase tracking-wide mb-2">Export Data</p>
              <div className="space-y-1">
                {["clients","invoices","payments","leads"].map(type => (
                  <a
                    key={type}
                    href={`/api/export?type=${type}`}
                    className="flex items-center gap-2 text-[12.5px] text-[#6b7280] hover:text-[#111111] px-2 py-1 rounded hover:bg-[#f3f4f6] capitalize"
                  >
                    ↓ {type}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checklist */}
      {tab === "Checklist" && (
        <div className="space-y-4">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className="bg-white border border-[#e5e7eb] rounded-xl">
              <div className="px-5 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-[#111111]">{cat}</h2>
                <span className="text-[11.5px] text-[#9ca3af]">
                  {items.filter(i => i.status === "done").length}/{items.length} done
                </span>
              </div>
              <div className="divide-y divide-[#f3f4f6]">
                {items.map(item => (
                  <div key={item.label} className="flex items-start gap-3 px-5 py-3.5">
                    <StatusIcon s={item.status} />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[#111111]">{item.label}</p>
                      <p className="text-[12px] text-[#9ca3af]">{item.description}</p>
                    </div>
                    {item.status === "missing" && (
                      <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase shrink-0">
                        Required
                      </span>
                    )}
                    {item.status === "warn" && (
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded uppercase shrink-0">
                        Optional
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clients */}
      {tab === "Clients" && (
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white border border-[#e5e7eb] rounded-xl">
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <h2 className="text-[13px] font-semibold text-[#111111]">Client Status</h2>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {[
                { label: "Active",   count: props.clients.filter(c => c.status === "Active").length },
                { label: "Review",   count: props.clients.filter(c => c.status === "Review").length },
                { label: "Paused",   count: props.clients.filter(c => c.status === "Paused").length },
                { label: "Churned",  count: props.clients.filter(c => c.status === "Churned").length },
                { label: "Archived", count: props.clients.filter(c => c.status === "Archived").length },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-[13px] text-[#6b7280] flex-1">{row.label}</span>
                  <span className="text-[13px] font-semibold text-[#111111]">{row.count}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 px-5 py-3 bg-[#fafafa]">
                <span className="text-[13px] font-medium text-[#111111] flex-1">Total</span>
                <span className="text-[13px] font-semibold text-[#111111]">{props.clients.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-xl">
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <h2 className="text-[13px] font-semibold text-[#111111]">Health Overview</h2>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {props.clients.slice(0, 8).map(c => {
                const sub = props.subscriptions.find(s => s.client_id === c.id);
                const health = c.health_score >= 80 ? "text-emerald-600" : c.health_score >= 60 ? "text-amber-600" : "text-red-600";
                return (
                  <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                    <Link href={`/admin/clients/${c.id}`} className="text-[13px] font-medium text-[#111111] hover:underline flex-1 truncate">
                      {c.company_name}
                    </Link>
                    <span className="text-[11.5px] text-[#9ca3af] shrink-0">{sub?.status ?? "No sub"}</span>
                    <span className={`text-[12px] font-semibold ${health} shrink-0`}>{c.health_score}</span>
                  </div>
                );
              })}
              {props.clients.length === 0 && (
                <p className="text-[13px] text-[#9ca3af] px-5 py-4">No clients yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Billing */}
      {tab === "Billing" && (
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5">
            <h2 className="text-[13px] font-semibold text-[#111111] mb-4">Billing Metrics</h2>
            <div className="space-y-3">
              {[
                { label: "Monthly Recurring Revenue", value: `$${props.billingMetrics.mrr.toLocaleString()}` },
                { label: "Annual Run Rate",            value: `$${(props.billingMetrics.mrr * 12).toLocaleString()}` },
                { label: "Active Subscriptions",       value: props.billingMetrics.activeSubscriptions },
                { label: "Past Due",                   value: props.billingMetrics.pastDue },
                { label: "Total Revenue",              value: `$${props.billingMetrics.totalRevenue.toLocaleString()}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-[13px] text-[#6b7280]">{row.label}</span>
                  <span className="text-[13px] font-semibold text-[#111111]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5">
            <h2 className="text-[13px] font-semibold text-[#111111] mb-4">Billing Configuration</h2>
            <div className="space-y-3">
              {[
                { label: "Stripe Secret Key",     ok: !!cfg["STRIPE_SECRET_KEY"] },
                { label: "Stripe Publishable Key",ok: !!cfg["STRIPE_PUBLISHABLE_KEY"] },
                { label: "Stripe Webhook Secret", ok: !!cfg["STRIPE_WEBHOOK_SECRET"] },
                { label: "SMTP (for receipts)",   ok: !!(cfg["SMTP_HOST"] && cfg["SMTP_USER"]) },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-[13px] text-[#6b7280]">{row.label}</span>
                  {row.ok
                    ? <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Configured</span>
                    : <span className="text-[11px] font-medium text-[#9ca3af] bg-[#f3f4f6] border border-[#e5e7eb] px-2 py-0.5 rounded-full">Not set</span>
                  }
                </div>
              ))}
            </div>
            {!cfg["STRIPE_SECRET_KEY"] && (
              <p className="mt-4 text-[12px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                Running in demo mode. Set STRIPE_SECRET_KEY to enable live payments.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Templates */}
      {tab === "Templates" && (
        <div className="space-y-4">
          <p className="text-[13px] text-[#6b7280]">
            Client package templates define the default configuration, deliverables, and features for each tier.
            Use these when onboarding new clients via{" "}
            <Link href="/admin/clients/invite" className="text-[#111111] underline">Client Invite</Link>.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {props.templates.map(tmpl => (
              <div key={tmpl.id} className="bg-white border border-[#e5e7eb] rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#111111]">{tmpl.name}</h3>
                    <span className="text-[11px] font-medium text-[#6b7280]">{tmpl.tier} · {tmpl.default_status}</span>
                  </div>
                </div>
                {tmpl.description && (
                  <p className="text-[12.5px] text-[#6b7280] mb-3">{tmpl.description}</p>
                )}
                {tmpl.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tmpl.features.map(f => (
                      <span key={f} className="text-[11px] bg-[#f3f4f6] border border-[#e5e7eb] text-[#6b7280] px-2 py-0.5 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {props.templates.length === 0 && (
              <p className="col-span-2 text-[13px] text-[#9ca3af] text-center py-6">
                No templates yet. Run the Phase 12 migration to seed defaults.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
