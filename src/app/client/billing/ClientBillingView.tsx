"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard, CheckCircle, AlertTriangle, Clock, TrendingUp, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type {
  DbSubscription, DbBillingPayment, DbRefund, DbPlan,
  DbPlanChange, DbBillingRenewal,
} from "@/lib/db-types";
import { changePlanAction, createCheckoutAction } from "@/lib/billing-actions";

type Props = {
  clientId: number;
  subscription: DbSubscription | null;
  payments: DbBillingPayment[];
  refunds: DbRefund[];
  plans: DbPlan[];
  planChanges: DbPlanChange[];
  renewalHistory: DbBillingRenewal[];
  stripeConfigured: boolean;
  activeProvider?: string;
};

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

function PlanCard({ plan, current, onSelect }: {
  plan: DbPlan; current: DbSubscription | null; onSelect: (slug: string) => void;
}) {
  const isCurrent = current?.plan_id === plan.id;
  const isUpgrade = current?.mrr != null && plan.price_monthly > current.mrr;
  const isDowngrade = current?.mrr != null && plan.price_monthly < current.mrr;
  return (
    <div className={`border rounded-lg p-4 transition-colors ${isCurrent ? "border-[#111111] bg-[#fafafa]" : "border-[#e5e7eb] hover:border-[#d1d5db]"}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[14px] font-semibold text-[#111111]">{plan.name}</p>
          {plan.tier && <Badge label={plan.tier} />}
        </div>
        {isCurrent && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <CheckCircle size={11} /> Current
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-[#111111] mt-3">{fmt(plan.price_monthly)}<span className="text-[13px] font-normal text-[#9ca3af]">/mo</span></p>
      {plan.price_annual && (
        <p className="text-[12px] text-[#6b7280] mt-0.5">{fmt(plan.price_annual)}/yr <span className="text-emerald-600">Save {Math.round((1 - plan.price_annual / (plan.price_monthly * 12)) * 100)}%</span></p>
      )}
      {plan.description && <p className="text-[12px] text-[#6b7280] mt-2">{plan.description}</p>}
      {!isCurrent && (
        <button
          onClick={() => onSelect(plan.slug)}
          className={`w-full mt-3 py-2 text-[13px] font-medium rounded-lg transition-colors ${
            isUpgrade
              ? "bg-[#111111] text-white hover:bg-[#333]"
              : isDowngrade
              ? "text-[#374151] border border-[#e5e7eb] hover:bg-[#f3f4f6]"
              : "bg-[#111111] text-white hover:bg-[#333]"
          }`}
        >
          {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Select"}
        </button>
      )}
    </div>
  );
}

export function ClientBillingView({
  clientId, subscription, payments, refunds, plans, planChanges, renewalHistory, stripeConfigured, activeProvider,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "history">("overview");

  function handlePlanSelect(slug: string) {
    if (!confirm("Confirm plan change?")) return;
    setLoading(true);
    setError(null);
    startTransition(async () => {
      if (stripeConfigured) {
        const res = await createCheckoutAction(clientId, slug);
        if (res.error) { setError(res.error); setLoading(false); return; }
        if (res.checkoutUrl) { window.location.href = res.checkoutUrl; return; }
        if (res.demoMode) { router.refresh(); setLoading(false); return; }
      } else {
        // Demo mode: use changePlanAction directly
        const fd = new FormData();
        fd.set("clientId", String(clientId));
        fd.set("newPlanSlug", slug);
        fd.set("changeType", subscription?.mrr != null
          ? (plans.find(p => p.slug === slug)?.price_monthly ?? 0) > subscription.mrr ? "upgrade" : "downgrade"
          : "upgrade");
        const res = await changePlanAction(null, fd);
        if (res.error) setError(res.error);
        else router.refresh();
        setLoading(false);
      }
    });
  }

  const statusIcon = subscription?.status === "Active" ? (
    <CheckCircle size={14} className="text-emerald-500" />
  ) : subscription?.status === "Past Due" ? (
    <AlertTriangle size={14} className="text-red-500" />
  ) : subscription?.status === "Trial" ? (
    <Clock size={14} className="text-violet-500" />
  ) : null;

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#111111] tracking-tight">Billing & Plans</h1>
        <p className="text-[13px] text-[#6b7280] mt-0.5">Manage your subscription and payment history</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-[#e5e7eb] mb-6">
        {([["overview", "Overview"], ["plans", "Plans & Upgrade"], ["history", "Payment History"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id ? "border-[#111111] text-[#111111]" : "border-transparent text-[#6b7280] hover:text-[#374151]"
            }`}
          >{label}</button>
        ))}
      </div>

      {/* ─── Overview ─────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Current Plan Card */}
          <div className="bg-white border border-[#e5e7eb] rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wide mb-1">Current Plan</p>
                {subscription ? (
                  <>
                    <p className="text-[20px] font-semibold text-[#111111]">{subscription.plan_name ?? "Custom"}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {statusIcon}
                      <Badge label={subscription.status} />
                      {subscription.tier && <Badge label={subscription.tier} />}
                    </div>
                  </>
                ) : (
                  <p className="text-[16px] font-semibold text-[#6b7280]">No active subscription</p>
                )}
              </div>
              <div className="text-right">
                {subscription?.mrr != null && (
                  <>
                    <p className="text-2xl font-semibold text-[#111111]">{fmt(subscription.mrr)}<span className="text-[13px] font-normal text-[#9ca3af]">/mo</span></p>
                    {subscription.arr != null && <p className="text-[12px] text-[#9ca3af]">{fmt(subscription.arr)}/yr</p>}
                  </>
                )}
              </div>
            </div>

            {subscription && (
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#f3f4f6]">
                <div>
                  <p className="text-[11px] text-[#9ca3af]">Current Period</p>
                  <p className="text-[13px] text-[#374151] mt-0.5">{fmtDate(subscription.current_period_start)} – {fmtDate(subscription.current_period_end)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9ca3af]">Next Renewal</p>
                  <p className="text-[13px] text-[#374151] mt-0.5">{fmtDate(subscription.current_period_end)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9ca3af]">Payment Provider</p>
                  {activeProvider ? (
                    <p className="text-[13px] text-[#374151] mt-0.5 capitalize">{activeProvider}</p>
                  ) : (
                    <p className="text-[13px] text-[#9ca3af] mt-0.5">Not configured — manual billing active</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#9ca3af]">Payment Method</p>
                  <p className="text-[13px] text-[#374151] mt-0.5">
                    {activeProvider === "stripe" ? "Card via Stripe" : "Manual / Invoice"}
                  </p>
                </div>
                {subscription.notes && (
                  <div className="col-span-2">
                    <p className="text-[11px] text-[#9ca3af]">Notes</p>
                    <p className="text-[13px] text-[#374151] mt-0.5">{subscription.notes}</p>
                  </div>
                )}
              </div>
            )}

            {!subscription && (
              <button
                onClick={() => setActiveTab("plans")}
                className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-[#111111] hover:underline"
              >
                View available plans <ChevronRight size={13} />
              </button>
            )}
          </div>

          {/* Status-specific alerts */}
          {subscription?.status === "Past Due" && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-red-800">Payment past due</p>
                <p className="text-[12px] text-red-700 mt-0.5">Please contact your account manager to resolve the outstanding balance.</p>
              </div>
            </div>
          )}

          {subscription?.status === "Trial" && (
            <div className="flex items-start gap-3 p-4 bg-violet-50 border border-violet-200 rounded-lg">
              <Clock size={15} className="text-violet-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-semibold text-violet-800">Trial active</p>
                <p className="text-[12px] text-violet-700 mt-0.5">Your trial ends {fmtDate(subscription.trial_end ?? subscription.current_period_end)}. Upgrade anytime to continue.</p>
              </div>
            </div>
          )}

          {/* Recent Invoices */}
          <div className="bg-white border border-[#e5e7eb] rounded-lg">
            <div className="px-4 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-[#111111]">Recent Payments</h3>
              <button onClick={() => setActiveTab("history")} className="text-[12px] text-[#6b7280] hover:text-[#111111]">View all →</button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {["Amount", "Method", "Date", "Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map(p => (
                  <tr key={p.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-[13px] font-medium text-[#111111]">{fmtFull(p.amount)}</td>
                    <td className="px-4 py-3 text-[13px] text-[#6b7280]">{p.method}</td>
                    <td className="px-4 py-3 text-[13px] text-[#6b7280]">{fmtDate(p.payment_date)}</td>
                    <td className="px-4 py-3"><Badge label={p.billing_status ?? "Paid"} /></td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-[13px] text-[#9ca3af]">No payments yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Plans ────────────────────────────────────────────────── */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">{error}</div>
          )}
          {!stripeConfigured && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-700">
              <AlertTriangle size={13} /> Plan changes in demo mode — contact your account manager to process payment.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                current={subscription}
                onSelect={handlePlanSelect}
              />
            ))}
          </div>
          {loading && (
            <div className="flex items-center justify-center py-4 text-[13px] text-[#6b7280]">
              Processing…
            </div>
          )}

          {planChanges.length > 0 && (
            <div className="bg-white border border-[#e5e7eb] rounded-lg">
              <div className="px-4 py-3 border-b border-[#e5e7eb]">
                <h3 className="text-[13px] font-semibold text-[#111111]">Plan Change History</h3>
              </div>
              <div className="divide-y divide-[#f3f4f6]">
                {planChanges.map(pc => (
                  <div key={pc.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-[13px] text-[#374151]">
                        <span className="font-medium">{pc.from_tier ?? "?"}</span> → <span className="font-medium">{pc.to_tier ?? "?"}</span>
                      </p>
                      <p className="text-[11px] text-[#9ca3af] mt-0.5">{fmtDate(pc.effective_date)}{pc.reason ? ` · ${pc.reason}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {pc.revenue_impact != null && (
                        <span className={`text-[12px] font-medium flex items-center gap-0.5 ${pc.revenue_impact >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          <TrendingUp size={11} />
                          {pc.revenue_impact >= 0 ? "+" : ""}{fmt(pc.revenue_impact)}/mo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── History ──────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e5e7eb] rounded-lg">
            <div className="px-4 py-3 border-b border-[#e5e7eb]">
              <h3 className="text-[13px] font-semibold text-[#111111]">All Payments</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {["Amount", "Method", "Reference", "Date", "Status"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-[13px] font-medium text-[#111111]">{fmtFull(p.amount)}</td>
                    <td className="px-4 py-3 text-[13px] text-[#6b7280]">{p.method}</td>
                    <td className="px-4 py-3 text-[12px] text-[#9ca3af] font-mono">{p.reference ?? p.invoice_number ?? "—"}</td>
                    <td className="px-4 py-3 text-[13px] text-[#6b7280]">{fmtDate(p.payment_date)}</td>
                    <td className="px-4 py-3"><Badge label={p.billing_status ?? "Paid"} /></td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#9ca3af]">No payment history</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {refunds.length > 0 && (
            <div className="bg-white border border-[#e5e7eb] rounded-lg">
              <div className="px-4 py-3 border-b border-[#e5e7eb]">
                <h3 className="text-[13px] font-semibold text-[#111111]">Refunds</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f3f4f6]">
                    {["Amount", "Reason", "Date", "Status"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {refunds.map(r => (
                    <tr key={r.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#fafafa]">
                      <td className="px-4 py-3 text-[13px] font-medium text-[#111111]">{fmtFull(r.amount)}</td>
                      <td className="px-4 py-3 text-[13px] text-[#6b7280]">{r.reason ?? "—"}</td>
                      <td className="px-4 py-3 text-[13px] text-[#6b7280]">{fmtDate(r.created_at)}</td>
                      <td className="px-4 py-3"><Badge label={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {renewalHistory.length > 0 && (
            <div className="bg-white border border-[#e5e7eb] rounded-lg">
              <div className="px-4 py-3 border-b border-[#e5e7eb]">
                <h3 className="text-[13px] font-semibold text-[#111111]">Renewal History</h3>
              </div>
              <div className="divide-y divide-[#f3f4f6]">
                {renewalHistory.map(r => (
                  <div key={r.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-[13px] text-[#374151]">{fmtDate(r.renewal_date)}</p>
                      {r.notes && <p className="text-[11px] text-[#9ca3af]">{r.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {r.amount != null && <span className="text-[13px] font-medium text-[#111111]">{fmtFull(r.amount)}</span>}
                      <Badge label={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
