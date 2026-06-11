"use client";

import { useTransition } from "react";
import { Printer, Send, Check, X } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbProposal, ProposalStatus } from "@/lib/db-types";
import { updateProposalStatusAction } from "@/lib/proposal-actions";

const STATUSES: ProposalStatus[] = ["Draft", "Sent", "Viewed", "Accepted", "Rejected", "Expired"];

export function ProposalDetail({ proposal }: { proposal: DbProposal }) {
  const [isPending, startTransition] = useTransition();

  function handleStatus(status: string) {
    startTransition(async () => { await updateProposalStatusAction(proposal.id, status); });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_240px] gap-6">
      {/* Proposal document */}
      <div>
        {/* Print/screen document */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden print:border-0 print:rounded-none" id="proposal-doc">
          {/* Cover */}
          <div className="px-10 py-10 border-b border-[#e5e7eb] print:border-[#e5e7eb]">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Arashi OPS</p>
                <p className="text-[11px] text-[#9ca3af]">ellisongod@gmail.com</p>
              </div>
              <Badge label={proposal.status} />
            </div>
            <h1 className="text-[26px] font-bold tracking-tight text-[#111111] mb-2">{proposal.title}</h1>
            <p className="text-[14px] text-[#6b7280]">
              {proposal.deal_company ?? proposal.client_name ?? ""}
              {proposal.expires_at ? ` · Valid until ${proposal.expires_at}` : ""}
            </p>
          </div>

          {/* Pricing */}
          <div className="px-10 py-8 border-b border-[#e5e7eb] bg-[#fafafa]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Investment</p>
            <div className="flex items-end gap-8">
              <div>
                <p className="text-[13px] text-[#6b7280] mb-1">{proposal.package} Package</p>
                <p className="text-[32px] font-bold tracking-tight text-[#111111]">
                  ${proposal.monthly_value.toLocaleString()}
                  <span className="text-[16px] font-normal text-[#9ca3af]">/mo</span>
                </p>
                <p className="text-[12px] text-[#9ca3af] mt-1">
                  ${(proposal.monthly_value * 12).toLocaleString()} per year
                </p>
              </div>
              {proposal.setup_fee > 0 && (
                <div>
                  <p className="text-[13px] text-[#6b7280] mb-1">One-time Setup</p>
                  <p className="text-[24px] font-bold text-[#374151]">${proposal.setup_fee.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Deliverables */}
          {proposal.deliverables && (
            <div className="px-10 py-8 border-b border-[#e5e7eb]">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">What&apos;s Included</p>
              <div className="text-[13.5px] text-[#374151] leading-relaxed whitespace-pre-line">{proposal.deliverables}</div>
            </div>
          )}

          {/* Timeline */}
          {proposal.timeline && (
            <div className="px-10 py-8 border-b border-[#e5e7eb]">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Timeline</p>
              <div className="text-[13.5px] text-[#374151] leading-relaxed whitespace-pre-line">{proposal.timeline}</div>
            </div>
          )}

          {/* Terms */}
          {proposal.terms && (
            <div className="px-10 py-8">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-4">Terms</p>
              <div className="text-[13px] text-[#6b7280] leading-relaxed whitespace-pre-line">{proposal.terms}</div>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4 print:hidden">
        {/* Actions */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Actions</p>
          <button
            onClick={() => window.print()}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-[12.5px] font-medium text-[#374151] hover:bg-[#f3f4f6] transition-colors border border-[#e5e7eb]"
          >
            <Printer size={13} className="text-[#6b7280]" /> Print / Save PDF
          </button>
          {proposal.status === "Draft" && (
            <button
              onClick={() => handleStatus("Sent")}
              disabled={isPending}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-[12.5px] font-medium bg-[#111111] text-white hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
            >
              <Send size={13} /> Mark as Sent
            </button>
          )}
          {proposal.status === "Sent" && (
            <>
              <button onClick={() => handleStatus("Accepted")} disabled={isPending}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-[12.5px] font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                <Check size={13} /> Mark Accepted
              </button>
              <button onClick={() => handleStatus("Rejected")} disabled={isPending}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-[12.5px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors border border-red-100">
                <X size={13} /> Mark Rejected
              </button>
            </>
          )}
        </div>

        {/* Status */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Status</p>
          <div className="space-y-1">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => handleStatus(s)} disabled={isPending || proposal.status === s}
                className={`w-full text-left px-3 py-2 rounded-md text-[12.5px] font-medium transition-colors ${
                  proposal.status === s ? "bg-[#111111] text-white" : "text-[#374151] hover:bg-[#f3f4f6]"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">Details</p>
          <div>
            <p className="text-[10.5px] text-[#9ca3af]">Version</p>
            <p className="text-[13px] font-medium text-[#111111]">v{proposal.version}</p>
          </div>
          {proposal.sent_at && (
            <div>
              <p className="text-[10.5px] text-[#9ca3af]">Sent</p>
              <p className="text-[13px] font-medium text-[#111111]">{proposal.sent_at.slice(0, 10)}</p>
            </div>
          )}
          {proposal.accepted_at && (
            <div>
              <p className="text-[10.5px] text-[#9ca3af]">Accepted</p>
              <p className="text-[13px] font-medium text-emerald-700">{proposal.accepted_at.slice(0, 10)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
