"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Phone, FileText, DollarSign, Calendar, ArrowRight, Trophy, Plus } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbDeal, DbDiscoveryCall, DbProposal, DealStage } from "@/lib/db-types";
import { updateDealStageAction } from "@/lib/deal-actions";

const STAGES: DealStage[] = [
  "Lead", "Contacted", "Discovery Scheduled", "Discovery Completed",
  "Proposal Sent", "Negotiation", "Won", "Lost",
];

type Props = {
  deal: DbDeal;
  calls: DbDiscoveryCall[];
  proposals: DbProposal[];
};

export function DealDetail({ deal, calls, proposals }: Props) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"overview" | "calls" | "proposals">("overview");

  function handleStage(stage: string) {
    startTransition(async () => { await updateDealStageAction(deal.id, stage); });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_260px] gap-6">
      {/* Left: tabs */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <div className="flex border-b border-[#e5e7eb]">
          {(["overview", "calls", "proposals"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-[12.5px] font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab ? "border-[#111111] text-[#111111]" : "border-transparent text-[#6b7280] hover:text-[#111111]"
              }`}>
              {tab}
              {tab === "calls" && <span className="ml-1.5 text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{calls.length}</span>}
              {tab === "proposals" && <span className="ml-1.5 text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{proposals.length}</span>}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="divide-y divide-[#f3f4f6]">
            <div className="grid grid-cols-3 divide-x divide-[#f3f4f6]">
              <div className="px-5 py-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1.5">Deal Value</p>
                <p className="text-[20px] font-bold text-[#111111]">${deal.deal_value.toLocaleString()}</p>
                <p className="text-[11.5px] text-[#9ca3af]">ARR: ${(deal.deal_value * 12).toLocaleString()}</p>
              </div>
              <div className="px-5 py-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1.5">Expected Close</p>
                <p className="text-[14px] font-semibold text-[#111111]">{deal.expected_close_date ?? "Not set"}</p>
              </div>
              <div className="px-5 py-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1.5">Owner</p>
                <p className="text-[14px] font-semibold text-[#111111]">{deal.owner}</p>
              </div>
            </div>
            {deal.notes && (
              <div className="px-5 py-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-2">Notes</p>
                <p className="text-[13px] text-[#374151] leading-relaxed">{deal.notes}</p>
              </div>
            )}

            {/* Conversion flow for Won deals */}
            {deal.stage === "Won" && (
              <div className="px-5 py-5 bg-emerald-50">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={14} className="text-emerald-600" />
                  <p className="text-[13px] font-semibold text-emerald-900">Deal Won — Convert to Client</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: "New Proposal", href: `/admin/proposals/new?dealId=${deal.id}` },
                    { label: "New Contract", href: `/admin/contracts?newFor=${deal.id}` },
                    { label: "New Invoice", href: `/admin/invoices?newFor=${deal.id}` },
                    { label: "Create Client", href: `/admin/clients/invite?company=${encodeURIComponent(deal.company)}&contact=${encodeURIComponent(deal.contact_name)}&email=${encodeURIComponent(deal.contact_email ?? "")}` },
                  ].map((action, i) => (
                    <Link key={action.label} href={action.href}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-white border border-emerald-200 text-emerald-800 rounded-md hover:bg-emerald-50 transition-colors">
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 w-4 h-4 rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                      {action.label}
                      <ArrowRight size={10} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Discovery Calls */}
        {activeTab === "calls" && (
          <div>
            <div className="px-5 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
              <p className="text-[12px] text-[#9ca3af]">{calls.length} call{calls.length !== 1 ? "s" : ""}</p>
              <Link href={`/admin/discovery?dealId=${deal.id}`}
                className="text-[12px] text-[#6b7280] hover:text-[#111111] flex items-center gap-1 transition-colors">
                <Plus size={11} /> Log Call
              </Link>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {calls.map((call) => (
                <div key={call.id} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-[#9ca3af] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[13px] font-medium text-[#111111]">{call.contact_name}</p>
                        <p className="text-[11.5px] text-[#9ca3af]">{call.call_date ?? "Date not set"}</p>
                      </div>
                    </div>
                  </div>
                  {call.meeting_notes && <p className="text-[12.5px] text-[#374151] leading-relaxed mb-2">{call.meeting_notes}</p>}
                  {call.next_action && (
                    <div className="flex items-start gap-1.5">
                      <ArrowRight size={11} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-[12px] text-amber-700">{call.next_action}</p>
                    </div>
                  )}
                </div>
              ))}
              {calls.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <Phone size={18} className="text-[#d1d5db] mx-auto mb-2" />
                  <p className="text-[13px] text-[#9ca3af]">No discovery calls logged.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Proposals */}
        {activeTab === "proposals" && (
          <div>
            <div className="px-5 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
              <p className="text-[12px] text-[#9ca3af]">{proposals.length} proposal{proposals.length !== 1 ? "s" : ""}</p>
              <Link href={`/admin/proposals/new?dealId=${deal.id}`}
                className="text-[12px] text-[#6b7280] hover:text-[#111111] flex items-center gap-1 transition-colors">
                <Plus size={11} /> New Proposal
              </Link>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {proposals.map((p) => (
                <Link key={p.id} href={`/admin/proposals/${p.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors block">
                  <div className="w-8 h-8 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                    <FileText size={13} className="text-[#6b7280]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111111] truncate">{p.title}</p>
                    <p className="text-[11.5px] text-[#9ca3af]">{p.package} · v{p.version}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-semibold text-[#111111]">${p.monthly_value.toLocaleString()}/mo</p>
                    <Badge label={p.status} />
                  </div>
                </Link>
              ))}
              {proposals.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <FileText size={18} className="text-[#d1d5db] mx-auto mb-2" />
                  <p className="text-[13px] text-[#9ca3af]">No proposals yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: stage control */}
      <div className="space-y-4">
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Pipeline Stage</p>
          <div className="space-y-1">
            {STAGES.map((s) => (
              <button key={s} onClick={() => handleStage(s)}
                disabled={isPending || deal.stage === s}
                className={`w-full text-left px-3 py-2 rounded-md text-[12.5px] font-medium transition-colors ${
                  deal.stage === s ? "bg-[#111111] text-white" : "text-[#374151] hover:bg-[#f3f4f6]"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-[#e5e7eb] rounded-xl bg-white p-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">Quick Actions</p>
          <Link href={`/admin/discovery?dealId=${deal.id}`}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-[12.5px] text-[#374151] hover:bg-[#f3f4f6] transition-colors">
            <Phone size={13} className="text-[#6b7280]" /> Log Discovery Call
          </Link>
          <Link href={`/admin/proposals/new?dealId=${deal.id}`}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-[12.5px] text-[#374151] hover:bg-[#f3f4f6] transition-colors">
            <FileText size={13} className="text-[#6b7280]" /> Create Proposal
          </Link>
        </div>
      </div>
    </div>
  );
}
