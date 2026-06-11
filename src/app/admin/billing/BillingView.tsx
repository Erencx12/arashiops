"use client";

import { useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard, TrendingUp, AlertCircle, Clock, Users,
  ChevronDown, ChevronRight, RefreshCw, Plus, X, Check, Settings,
} from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type {
  DbPlan, DbSubscription, DbBillingPayment, DbRefund,
  DbBillingEvent, DbPlanChange, DbBillingRenewal,
} from "@/lib/db-types";
import type { DbClient } from "@/lib/db-types";
import {
  cancelSubscriptionAction, updateSubscriptionStatusAction,
  createSubscriptionAction, changePlanAction,
  issueRefundAction, recordManualPaymentAction, createCheckoutAction,
} from "@/lib/billing-actions";

type BillingMetrics = {
  mrr: number; arr: number; activeSubscriptions: number;
  trialSubscriptions: number; pastDue: number; cancelled: number;
  upcomingRenewals30d: number; failedPayments: number;
  totalRevenue: number; revenueByTier: Record<string, number>;
};

type Props = {
  plans: DbPlan[];
  subscriptions: DbSubscription[];
  payments: DbBillingPayment[];
  refunds: DbRefund[];
  metrics: BillingMetrics;
  upcomingRenewals: DbSubscription[];
  planChanges: DbPlanChange[];
  renewalHistory: DbBillingRenewal[];
  clients: DbClient[];
  billingEvents: DbBillingEvent[];
  stripeConfigured: boolean;
};

const TABS = ["Overview", "Subscriptions", "Payments", "Refunds", "Analytics", "Renewals"] as const;
type Tab = typeof TABS[number];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, icon: Icon, warn }: {
  label: string; value: string; sub?: string; icon: React.ElementType; warn?: boolean;
}) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-semibold mt-1 ${warn ? "text-red-600" : "text-[#111111]"}`}>{value}</p>
          {sub && <p className="text-[12px] text-[#9ca3af] mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${warn ? "bg-red-50" : "bg-[#f3f4f6]"}`}>
          <Icon size={16} className={warn ? "text-red-500" : "text-[#6b7280]"} />
        </div>
      </div>
    </div>
  );
}

// ─── Subscription Row ─────────────────────────────────────────────────────────

function SubscriptionRow({ sub, plans, onCancel, onStatusChange }: {
  sub: DbSubscription;
  plans: DbPlan[];
  onCancel: (id: number, stripeId: string | null) => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className="border-b border-[#f3f4f6] hover:bg-[#fafafa] transition-colors">
        <td className="px-4 py-3">
          <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1.5 text-[13px] font-medium text-[#111111]">
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            {sub.client_name ?? `Client #${sub.client_id}`}
          </button>
        </td>
        <td className="px-4 py-3 text-[13px] text-[#374151]">{sub.plan_name ?? "—"}</td>
        <td className="px-4 py-3 text-[13px] text-[#374151]">{sub.tier ? <Badge label={sub.tier} /> : "—"}</td>
        <td className="px-4 py-3"><Badge label={sub.status} /></td>
        <td className="px-4 py-3 text-[13px] text-[#374151]">{sub.mrr != null ? fmt(sub.mrr) + "/mo" : "—"}</td>
        <td className="px-4 py-3 text-[13px] text-[#6b7280]">{fmtDate(sub.current_period_end)}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {sub.status !== "Cancelled" && (
              <button
                onClick={() => onCancel(sub.id, sub.stripe_subscription_id)}
                className="text-[11px] text-red-600 hover:text-red-800 transition-colors"
              >Cancel</button>
            )}
            {sub.status === "Past Due" && (
              <button
                onClick={() => onStatusChange(sub.id, "Active")}
                className="text-[11px] text-emerald-600 hover:text-emerald-800 transition-colors"
              >Mark Active</button>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
          <td colSpan={7} className="px-8 py-3">
            <div className="grid grid-cols-3 gap-4 text-[12px]">
              <div><span className="text-[#9ca3af]">Period Start:</span> <span className="text-[#374151]">{fmtDate(sub.current_period_start)}</span></div>
              <div><span className="text-[#9ca3af]">ARR:</span> <span className="text-[#374151]">{sub.arr != null ? fmt(sub.arr) : "—"}</span></div>
              <div><span className="text-[#9ca3af]">Stripe Sub ID:</span> <span className="text-[#374151] font-mono">{sub.stripe_subscription_id ?? "Manual"}</span></div>
              {sub.notes && <div className="col-span-3"><span className="text-[#9ca3af]">Notes:</span> <span className="text-[#374151]">{sub.notes}</span></div>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── New Subscription Modal ───────────────────────────────────────────────────

function NewSubscriptionModal({ plans, clients, onClose }: {
  plans: DbPlan[]; clients: DbClient[]; onClose: () => void;
}) {
  const [state, action, pending] = useActionState(createSubscriptionAction, null);
  if (state?.success) { onClose(); return null; }
  return (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-[#e5e7eb] w-[420px] shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <h3 className="text-[14px] font-semibold text-[#111111]">New Subscription</h3>
          <button onClick={onClose}><X size={16} className="text-[#9ca3af]" /></button>
        </div>
        <form action={action} className="p-5 space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Client</label>
            <select name="clientId" required className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] bg-white focus:outline-none focus:border-[#111111]">
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Plan</label>
            <select name="planSlug" required className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] bg-white focus:outline-none focus:border-[#111111]">
              <option value="">Select plan…</option>
              {plans.filter(p => p.status === "Active").map(p => (
                <option key={p.slug} value={p.slug}>{p.name} — {fmt(p.price_monthly)}/mo</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Status</label>
            <select name="status" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] bg-white focus:outline-none focus:border-[#111111]">
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Start Date</label>
            <input type="date" name="startDate" defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Notes</label>
            <input type="text" name="notes" placeholder="Optional notes"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] placeholder-[#9ca3af] focus:outline-none focus:border-[#111111]" />
          </div>
          {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-[13px] font-medium text-[#6b7280] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] transition-colors">Cancel</button>
            <button type="submit" disabled={pending} className="flex-1 py-2 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] disabled:opacity-50 transition-colors">
              {pending ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Record Payment Modal ─────────────────────────────────────────────────────

function RecordPaymentModal({ clients, onClose }: { clients: DbClient[]; onClose: () => void }) {
  const [state, action, pending] = useActionState(recordManualPaymentAction, null);
  if (state?.success) { onClose(); return null; }
  return (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-[#e5e7eb] w-[420px] shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <h3 className="text-[14px] font-semibold text-[#111111]">Record Payment</h3>
          <button onClick={onClose}><X size={16} className="text-[#9ca3af]" /></button>
        </div>
        <form action={action} className="p-5 space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Client</label>
            <select name="clientId" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] bg-white focus:outline-none focus:border-[#111111]">
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Amount ($)</label>
            <input type="number" name="amount" min="0" step="0.01" required placeholder="0.00"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] placeholder-[#9ca3af] focus:outline-none focus:border-[#111111]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Method</label>
            <select name="method" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] bg-white focus:outline-none focus:border-[#111111]">
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Check">Check</option>
              <option value="Wire">Wire</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Reference</label>
            <input type="text" name="reference" placeholder="Invoice # or transaction ID"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] placeholder-[#9ca3af] focus:outline-none focus:border-[#111111]" />
          </div>
          {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-[13px] font-medium text-[#6b7280] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] transition-colors">Cancel</button>
            <button type="submit" disabled={pending} className="flex-1 py-2 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] disabled:opacity-50 transition-colors">
              {pending ? "Recording…" : "Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Refund Modal ─────────────────────────────────────────────────────────────

function RefundModal({ clients, onClose }: { clients: DbClient[]; onClose: () => void }) {
  const [state, action, pending] = useActionState(issueRefundAction, null);
  if (state?.success) { onClose(); return null; }
  return (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center">
      <div className="bg-white rounded-xl border border-[#e5e7eb] w-[420px] shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <h3 className="text-[14px] font-semibold text-[#111111]">Issue Refund</h3>
          <button onClick={onClose}><X size={16} className="text-[#9ca3af]" /></button>
        </div>
        <form action={action} className="p-5 space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Client</label>
            <select name="clientId" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] bg-white focus:outline-none focus:border-[#111111]">
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Amount ($)</label>
            <input type="number" name="amount" min="0.01" step="0.01" required placeholder="0.00"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] placeholder-[#9ca3af] focus:outline-none focus:border-[#111111]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Reason</label>
            <select name="reason" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] bg-white focus:outline-none focus:border-[#111111]">
              <option value="">Select reason…</option>
              <option value="duplicate">Duplicate charge</option>
              <option value="fraudulent">Fraudulent</option>
              <option value="requested_by_customer">Customer request</option>
              <option value="service_issue">Service issue</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Notes</label>
            <input type="text" name="notes" placeholder="Internal notes"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] text-[#111111] placeholder-[#9ca3af] focus:outline-none focus:border-[#111111]" />
          </div>
          {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-[13px] font-medium text-[#6b7280] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] transition-colors">Cancel</button>
            <button type="submit" disabled={pending} className="flex-1 py-2 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] disabled:opacity-50 transition-colors">
              {pending ? "Processing…" : "Issue Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BillingView({
  plans, subscriptions, payments, refunds, metrics,
  upcomingRenewals, planChanges, renewalHistory, clients, billingEvents, stripeConfigured,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [showNewSub, setShowNewSub] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleCancel(id: number, stripeId: string | null) {
    if (!confirm("Cancel this subscription?")) return;
    startTransition(async () => {
      await cancelSubscriptionAction(id, stripeId);
      router.refresh();
    });
  }

  function handleStatusChange(id: number, status: string) {
    startTransition(async () => {
      await updateSubscriptionStatusAction(id, status);
      router.refresh();
    });
  }

  const activeSubs = subscriptions.filter(s => s.status === "Active" || s.status === "Trial");
  const pastDueSubs = subscriptions.filter(s => s.status === "Past Due");

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111111] tracking-tight">Billing Center</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Subscriptions, payments, and revenue analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {!stripeConfigured && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-700">
              <AlertCircle size={12} />
              Demo mode — no payment provider configured
            </div>
          )}
          <Link
            href="/admin/billing/providers"
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#374151] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] transition-colors"
          >
            <Settings size={13} /> Providers
          </Link>
          <button
            onClick={() => setShowPayment(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[#374151] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] transition-colors"
          >
            <Plus size={13} /> Record Payment
          </button>
          <button
            onClick={() => setShowNewSub(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors"
          >
            <Plus size={13} /> New Subscription
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-[#e5e7eb] mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? "border-[#111111] text-[#111111]"
                : "border-transparent text-[#6b7280] hover:text-[#374151]"
            }`}
          >{tab}</button>
        ))}
      </div>

      {/* ─── Overview ─────────────────────────────────────────────── */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <MetricCard label="Monthly Recurring Revenue" value={fmt(metrics.mrr)} sub={`ARR: ${fmt(metrics.arr)}`} icon={TrendingUp} />
            <MetricCard label="Active Subscriptions" value={String(metrics.activeSubscriptions)} sub={`${metrics.trialSubscriptions} on trial`} icon={CreditCard} />
            <MetricCard label="Past Due" value={String(metrics.pastDue)} sub="Require attention" icon={AlertCircle} warn={metrics.pastDue > 0} />
            <MetricCard label="Upcoming Renewals (30d)" value={String(metrics.upcomingRenewals30d)} sub={`${metrics.failedPayments} failed payments`} icon={Clock} warn={metrics.failedPayments > 0} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Revenue by Tier */}
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-[#111111] mb-3">Revenue by Tier</h3>
              {Object.keys(metrics.revenueByTier).length === 0 ? (
                <p className="text-[13px] text-[#9ca3af]">No active subscriptions</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(metrics.revenueByTier).sort(([, a], [, b]) => b - a).map(([tier, mrr]) => (
                    <div key={tier} className="flex items-center justify-between py-1.5 border-b border-[#f3f4f6] last:border-0">
                      <div className="flex items-center gap-2">
                        <Badge label={tier} />
                      </div>
                      <span className="text-[13px] font-medium text-[#111111]">{fmt(mrr)}<span className="text-[11px] text-[#9ca3af]">/mo</span></span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Alerts */}
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-[#111111] mb-3">Attention Required</h3>
              {pastDueSubs.length === 0 && upcomingRenewals.length === 0 ? (
                <div className="flex items-center gap-2 text-[13px] text-emerald-600">
                  <Check size={14} /> All subscriptions healthy
                </div>
              ) : (
                <div className="space-y-2">
                  {pastDueSubs.map(s => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#f3f4f6] last:border-0">
                      <div>
                        <p className="text-[13px] font-medium text-[#111111]">{s.client_name}</p>
                        <p className="text-[11px] text-red-600">Past due — {s.mrr != null ? fmt(s.mrr) : ""}</p>
                      </div>
                      <Badge label="Past Due" />
                    </div>
                  ))}
                  {upcomingRenewals.slice(0, 3).map(s => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#f3f4f6] last:border-0">
                      <div>
                        <p className="text-[13px] font-medium text-[#111111]">{s.client_name}</p>
                        <p className="text-[11px] text-[#9ca3af]">Renews {fmtDate(s.current_period_end)}</p>
                      </div>
                      <Badge label="Active" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white border border-[#e5e7eb] rounded-lg">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-[#111111]">Recent Payments</h3>
              <button onClick={() => setActiveTab("Payments")} className="text-[12px] text-[#6b7280] hover:text-[#111111]">View all →</button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {["Client", "Amount", "Method", "Date", "Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map(p => (
                  <tr key={p.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-[13px] font-medium text-[#111111]">{p.client_name ?? "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-[#374151]">{fmtFull(p.amount)}</td>
                    <td className="px-4 py-3 text-[13px] text-[#6b7280]">{p.method}</td>
                    <td className="px-4 py-3 text-[13px] text-[#6b7280]">{fmtDate(p.payment_date)}</td>
                    <td className="px-4 py-3"><Badge label={p.billing_status ?? "Paid"} /></td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-[13px] text-[#9ca3af]">No payments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Subscriptions ───────────────────────────────────────── */}
      {activeTab === "Subscriptions" && (
        <div className="bg-white border border-[#e5e7eb] rounded-lg">
          <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-[#111111]">All Subscriptions</h3>
              <p className="text-[12px] text-[#9ca3af] mt-0.5">{activeSubs.length} active · {metrics.pastDue} past due · {metrics.cancelled} cancelled</p>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                {["Client", "Plan", "Tier", "Status", "MRR", "Renews", "Actions"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(sub => (
                <SubscriptionRow
                  key={sub.id}
                  sub={sub}
                  plans={plans}
                  onCancel={handleCancel}
                  onStatusChange={handleStatusChange}
                />
              ))}
              {subscriptions.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[13px] text-[#9ca3af]">No subscriptions yet. Create one to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Payments ────────────────────────────────────────────── */}
      {activeTab === "Payments" && (
        <div className="bg-white border border-[#e5e7eb] rounded-lg">
          <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-[#111111]">Payment History</h3>
              <p className="text-[12px] text-[#9ca3af] mt-0.5">Total collected: {fmtFull(metrics.totalRevenue)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowRefund(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#374151] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6] transition-colors">
                <RefreshCw size={12} /> Issue Refund
              </button>
              <button onClick={() => setShowPayment(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors">
                <Plus size={12} /> Record Payment
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                {["Client", "Amount", "Method", "Reference", "Date", "Status"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafafa]">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#111111]">{p.client_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-[#374151]">{fmtFull(p.amount)}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7280]">{p.method}</td>
                  <td className="px-4 py-3 text-[12px] text-[#9ca3af] font-mono">{p.reference ?? p.stripe_payment_intent_id ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7280]">{fmtDate(p.payment_date)}</td>
                  <td className="px-4 py-3"><Badge label={p.billing_status ?? "Paid"} /></td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#9ca3af]">No payments recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Refunds ─────────────────────────────────────────────── */}
      {activeTab === "Refunds" && (
        <div className="bg-white border border-[#e5e7eb] rounded-lg">
          <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-[#111111]">Refunds</h3>
            <button onClick={() => setShowRefund(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors">
              <Plus size={12} /> Issue Refund
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                {["Client", "Amount", "Reason", "Status", "Processed By", "Date"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {refunds.map(r => (
                <tr key={r.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafafa]">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#111111]">{r.client_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-[#374151]">{fmtFull(r.amount)}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7280]">{r.reason ?? "—"}</td>
                  <td className="px-4 py-3"><Badge label={r.status} /></td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7280]">{r.processed_by ?? "—"}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7280]">{fmtDate(r.created_at)}</td>
                </tr>
              ))}
              {refunds.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#9ca3af]">No refunds issued</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Analytics ───────────────────────────────────────────── */}
      {activeTab === "Analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wide">MRR</p>
              <p className="text-2xl font-semibold text-[#111111] mt-1">{fmt(metrics.mrr)}</p>
              <p className="text-[12px] text-[#9ca3af] mt-0.5">Monthly recurring</p>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wide">ARR</p>
              <p className="text-2xl font-semibold text-[#111111] mt-1">{fmt(metrics.arr)}</p>
              <p className="text-[12px] text-[#9ca3af] mt-0.5">Annual run rate</p>
            </div>
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wide">Total Collected</p>
              <p className="text-2xl font-semibold text-[#111111] mt-1">{fmt(metrics.totalRevenue)}</p>
              <p className="text-[12px] text-[#9ca3af] mt-0.5">All time payments</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Subscription Health */}
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-[#111111] mb-3">Subscription Health</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Active", value: metrics.activeSubscriptions, color: "bg-emerald-500" },
                  { label: "Trial", value: metrics.trialSubscriptions, color: "bg-violet-500" },
                  { label: "Past Due", value: metrics.pastDue, color: "bg-red-500" },
                  { label: "Cancelled", value: metrics.cancelled, color: "bg-[#e5e7eb]" },
                ].map(({ label, value, color }) => {
                  const total = metrics.activeSubscriptions + metrics.trialSubscriptions + metrics.pastDue + metrics.cancelled;
                  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] text-[#374151]">{label}</span>
                        <span className="text-[12px] font-medium text-[#111111]">{value} <span className="text-[#9ca3af]">({pct}%)</span></span>
                      </div>
                      <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan Changes */}
            <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-[#111111] mb-3">Recent Plan Changes</h3>
              {planChanges.length === 0 ? (
                <p className="text-[13px] text-[#9ca3af]">No plan changes recorded</p>
              ) : (
                <div className="space-y-2">
                  {planChanges.slice(0, 5).map(pc => (
                    <div key={pc.id} className="flex items-start justify-between py-1.5 border-b border-[#f3f4f6] last:border-0">
                      <div>
                        <p className="text-[13px] font-medium text-[#111111]">{pc.client_name}</p>
                        <p className="text-[11px] text-[#9ca3af]">
                          {pc.from_tier ?? "?"} → {pc.to_tier ?? "?"} · {fmtDate(pc.effective_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge label={pc.change_type === "upgrade" ? "Active" : pc.change_type === "downgrade" ? "Paused" : "Active"} />
                        {pc.revenue_impact != null && (
                          <span className={`text-[11px] font-medium ${pc.revenue_impact >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {pc.revenue_impact >= 0 ? "+" : ""}{fmt(pc.revenue_impact)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Plans table */}
          <div className="bg-white border border-[#e5e7eb] rounded-lg">
            <div className="px-4 py-3 border-b border-[#e5e7eb]">
              <h3 className="text-[13px] font-semibold text-[#111111]">Available Plans</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {["Plan", "Tier", "Monthly", "Annual", "Status", "Stripe Price ID"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map(p => (
                  <tr key={p.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-[13px] font-medium text-[#111111]">{p.name}</td>
                    <td className="px-4 py-3">{p.tier ? <Badge label={p.tier} /> : <span className="text-[#9ca3af]">—</span>}</td>
                    <td className="px-4 py-3 text-[13px] text-[#374151]">{fmt(p.price_monthly)}/mo</td>
                    <td className="px-4 py-3 text-[13px] text-[#6b7280]">{p.price_annual ? fmt(p.price_annual) + "/yr" : "—"}</td>
                    <td className="px-4 py-3"><Badge label={p.status} /></td>
                    <td className="px-4 py-3 text-[12px] text-[#9ca3af] font-mono">{p.stripe_price_id ?? "Not set"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Renewals ────────────────────────────────────────────── */}
      {activeTab === "Renewals" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e5e7eb] rounded-lg">
            <div className="px-4 py-3 border-b border-[#e5e7eb]">
              <h3 className="text-[13px] font-semibold text-[#111111]">Upcoming Renewals (Next 30 Days)</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {["Client", "Plan", "MRR", "Renews", "Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcomingRenewals.map(s => (
                  <tr key={s.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-[13px] font-medium text-[#111111]">{s.client_name ?? "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-[#374151]">{s.plan_name ?? "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-[#374151]">{s.mrr != null ? fmt(s.mrr) : "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-[#6b7280]">{fmtDate(s.current_period_end)}</td>
                    <td className="px-4 py-3"><Badge label={s.status} /></td>
                  </tr>
                ))}
                {upcomingRenewals.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-[13px] text-[#9ca3af]">No renewals in the next 30 days</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white border border-[#e5e7eb] rounded-lg">
            <div className="px-4 py-3 border-b border-[#e5e7eb]">
              <h3 className="text-[13px] font-semibold text-[#111111]">Renewal History</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {["Client", "Amount", "Renewal Date", "Invoice", "Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {renewalHistory.map(r => (
                  <tr key={r.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-[13px] font-medium text-[#111111]">{r.client_name ?? "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-[#374151]">{r.amount != null ? fmtFull(r.amount) : "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-[#6b7280]">{fmtDate(r.renewal_date)}</td>
                    <td className="px-4 py-3 text-[12px] text-[#9ca3af] font-mono">{r.stripe_invoice_id ?? "Manual"}</td>
                    <td className="px-4 py-3"><Badge label={r.status} /></td>
                  </tr>
                ))}
                {renewalHistory.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-[13px] text-[#9ca3af]">No renewal history yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewSub && <NewSubscriptionModal plans={plans} clients={clients} onClose={() => { setShowNewSub(false); router.refresh(); }} />}
      {showPayment && <RecordPaymentModal clients={clients} onClose={() => { setShowPayment(false); router.refresh(); }} />}
      {showRefund && <RefundModal clients={clients} onClose={() => { setShowRefund(false); router.refresh(); }} />}
    </div>
  );
}
