"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import type { DbLead, LeadStatus } from "@/lib/db-types";

const statusBadge: Record<LeadStatus, string> = {
  "Contacted":      "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]",
  "Responded":      "bg-blue-50 text-blue-700 border-blue-100",
  "Meeting Booked": "bg-amber-50 text-amber-700 border-amber-100",
  "Qualified":      "bg-purple-50 text-purple-700 border-purple-100",
  "Not Qualified":  "bg-[#f3f4f6] text-[#9ca3af] border-[#e5e7eb]",
  "Closed Won":     "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const filters: (LeadStatus | "All")[] = ["All", "Contacted", "Responded", "Meeting Booked", "Qualified", "Closed Won"];

export function LeadsTable({ leads }: { leads: DbLead[] }) {
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All" ? leads : leads.filter((l) => l.status === filter);
  const closedWon      = leads.filter((l) => l.status === "Closed Won").length;
  const meetingsBooked = leads.filter((l) => l.status === "Meeting Booked").length;

  const stageOrder: LeadStatus[] = ["Contacted", "Responded", "Meeting Booked", "Qualified", "Closed Won", "Not Qualified"];

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Lead Tracker</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{leads.length} leads · updated by Arashi OPS team</p>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          <TrendingUp size={13} />
          {closedWon} closed · {meetingsBooked} meetings booked
        </div>
      </div>

      {/* Funnel summary */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stageOrder.map((s) => {
          const count = leads.filter((l) => l.status === s).length;
          return (
            <div key={s} className="border border-[#e5e7eb] rounded-xl p-3.5 bg-white text-center">
              <p className="text-[20px] font-bold text-[#111111] tracking-tight">{count}</p>
              <p className="text-[10.5px] text-[#9ca3af] mt-0.5 leading-tight">{s}</p>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-[#e5e7eb]">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-[12.5px] font-medium border-b-2 -mb-px transition-colors ${
              filter === f ? "border-[#111111] text-[#111111]" : "border-transparent text-[#6b7280] hover:text-[#374151]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Lead", "Company", "Status", "Source", "Date Added", "Est. Value"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filtered.map((lead) => (
              <tr key={lead.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-[#374151]">{lead.name[0]}</span>
                    </div>
                    <p className="text-[13px] font-medium text-[#111111]">{lead.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{lead.company}</td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-[12px] text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded">{lead.source}</span>
                </td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#9ca3af]">{lead.created_at}</td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-[#111111]">{lead.estimated_value ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-[#9ca3af]">No leads in this stage.</div>
        )}
      </div>
    </div>
  );
}
