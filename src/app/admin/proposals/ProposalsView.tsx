"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, FileText, DollarSign, ArrowRight } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbProposal, ProposalStatus } from "@/lib/db-types";
import { updateProposalStatusAction } from "@/lib/proposal-actions";

const TABS: (ProposalStatus | "All")[] = ["All", "Draft", "Sent", "Viewed", "Accepted", "Rejected", "Expired"];

export function ProposalsView({ proposals }: { proposals: DbProposal[] }) {
  const [activeTab, setActiveTab] = useState<string>("All");
  const [isPending, startTransition] = useTransition();

  const filtered = activeTab === "All" ? proposals : proposals.filter(p => p.status === activeTab);

  const totalValue = proposals.filter(p => p.status === "Accepted").reduce((s, p) => s + p.monthly_value, 0);

  function handleStatus(id: number, status: string) {
    startTransition(async () => { await updateProposalStatusAction(id, status); });
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Proposals</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">
            {proposals.length} total · ${totalValue.toLocaleString()}/mo accepted
          </p>
        </div>
        <Link href="/admin/proposals/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors">
          <Plus size={13} /> New Proposal
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 mb-5 border-b border-[#e5e7eb]">
        {TABS.map((tab) => {
          const count = tab === "All" ? proposals.length : proposals.filter(p => p.status === tab).length;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[12.5px] font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab ? "border-[#111111] text-[#111111]" : "border-transparent text-[#6b7280] hover:text-[#111111]"
              }`}>
              {tab}
              <span className="ml-1.5 text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Proposal", "Package", "Monthly Value", "Deal / Client", "Status", "Sent", "Expires", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                      <FileText size={12} className="text-[#6b7280]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#111111]">{p.title}</p>
                      <p className="text-[11px] text-[#9ca3af]">v{p.version}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{p.package}</td>
                <td className="px-4 py-3.5">
                  <p className="text-[13px] font-semibold text-[#111111]">${p.monthly_value.toLocaleString()}/mo</p>
                  {p.setup_fee > 0 && <p className="text-[11px] text-[#9ca3af]">+${p.setup_fee.toLocaleString()} setup</p>}
                </td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">
                  {p.deal_company ?? p.client_name ?? "—"}
                </td>
                <td className="px-4 py-3.5">
                  <select
                    value={p.status}
                    onChange={(e) => handleStatus(p.id, e.target.value)}
                    disabled={isPending}
                    className="text-[12px] border border-[#e5e7eb] rounded-md px-2 py-1 bg-white outline-none cursor-pointer hover:border-[#111111] transition-colors"
                  >
                    {(["Draft","Sent","Viewed","Accepted","Rejected","Expired"] as ProposalStatus[]).map(s =>
                      <option key={s}>{s}</option>
                    )}
                  </select>
                </td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#9ca3af]">{p.sent_at ? p.sent_at.slice(0, 10) : "—"}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#9ca3af]">{p.expires_at ?? "—"}</td>
                <td className="px-4 py-3.5">
                  <Link href={`/admin/proposals/${p.id}`}
                    className="flex items-center gap-1 text-[12px] text-[#6b7280] hover:text-[#111111] transition-colors">
                    View <ArrowRight size={11} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-[13px] text-[#9ca3af]">
            No {activeTab === "All" ? "" : activeTab.toLowerCase() + " "}proposals.
          </div>
        )}
      </div>
    </div>
  );
}
