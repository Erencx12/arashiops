"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { DbClient, DbDeal } from "@/lib/db-types";
import { createProposalAction } from "@/lib/proposal-actions";

type Props = { clients: DbClient[]; deals: DbDeal[]; defaultDealId?: string };

const inputCls = "w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors";
const labelCls = "block text-[12.5px] font-medium text-[#374151] mb-1.5";

const DEFAULT_DELIVERABLES = `• Monthly outreach campaigns
• Lead qualification & enrichment
• Weekly performance reports
• CRM data management
• Dedicated account manager`;

const DEFAULT_TERMS = `• Monthly retainer, invoiced at the start of each billing cycle
• 30-day cancellation notice required
• All intellectual property remains with Arashi
• Client to provide timely access to required systems`;

export function ProposalForm({ clients, deals, defaultDealId }: Props) {
  const [state, action, pending] = useActionState(createProposalAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.proposalId) {
      router.push(`/admin/proposals/${state.proposalId}`);
    }
  }, [state, router]);

  const selectedDeal = deals.find(d => String(d.id) === defaultDealId);

  return (
    <form action={action} className="border border-[#e5e7eb] rounded-xl bg-white p-6 space-y-5">
      {state?.error && <p className="text-[12.5px] text-red-600">{state.error}</p>}

      <div>
        <label className={labelCls}>Proposal Title *</label>
        <input name="title" required
          defaultValue={selectedDeal ? `Arashi OPS Proposal — ${selectedDeal.company}` : ""}
          placeholder="e.g. Arashi OPS Proposal — Acme Inc."
          className={inputCls} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Link to Deal</label>
          <select name="dealId" defaultValue={defaultDealId ?? ""} className={`${inputCls} bg-white`}>
            <option value="">No deal</option>
            {deals.map(d => <option key={d.id} value={d.id}>{d.company} — {d.stage}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Link to Client</label>
          <select name="clientId" className={`${inputCls} bg-white`}>
            <option value="">No client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Package *</label>
          <select name="package" defaultValue={selectedDeal ? "Gold" : "Silver"} className={`${inputCls} bg-white`}>
            <option>Silver</option>
            <option>Gold</option>
            <option>Platinum</option>
            <option>Enterprise</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Monthly Value ($) *</label>
          <input name="monthlyValue" type="number" min="0" required
            defaultValue={selectedDeal?.deal_value ?? ""}
            placeholder="4500"
            className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Setup Fee ($)</label>
          <input name="setupFee" type="number" min="0" defaultValue="0"
            placeholder="0"
            className={inputCls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Expiry Date</label>
          <input name="expiresAt" type="date" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Deliverables</label>
        <textarea name="deliverables" rows={5}
          defaultValue={DEFAULT_DELIVERABLES}
          className={`${inputCls} resize-none`} />
      </div>

      <div>
        <label className={labelCls}>Timeline</label>
        <textarea name="timeline" rows={2}
          placeholder="e.g. Kickoff within 5 business days of signing. Month 1: onboarding & setup. Month 2+: full operations."
          className={`${inputCls} resize-none`} />
      </div>

      <div>
        <label className={labelCls}>Terms</label>
        <textarea name="terms" rows={4}
          defaultValue={DEFAULT_TERMS}
          className={`${inputCls} resize-none`} />
      </div>

      <div>
        <label className={labelCls}>Internal Notes</label>
        <textarea name="notes" rows={2}
          placeholder="Notes visible only to your team..."
          className={`${inputCls} resize-none`} />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={() => history.back()}
          className="px-4 py-2.5 text-[13px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={pending}
          className="flex-1 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
          {pending ? "Creating…" : "Create Proposal"}
        </button>
      </div>
    </form>
  );
}
