"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbClient } from "@/lib/db-types";

export function ClientsTable({ clients }: { clients: DbClient[] }) {
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");

  const filtered = clients.filter((c) => {
    const matchQ =
      c.company_name.toLowerCase().includes(query.toLowerCase()) ||
      c.industry.toLowerCase().includes(query.toLowerCase());
    const matchT = tierFilter === "All" || c.tier === tierFilter;
    return matchQ && matchT;
  });

  const activeCount = clients.filter((c) => c.status === "Active").length;

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Clients</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">
            {clients.length} total · {activeCount} active
          </p>
        </div>
        <Link
          href="/admin/clients/invite"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          <Plus size={13} />
          Invite Client
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-[280px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full pl-8 pr-3 py-2 border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151] placeholder:text-[#9ca3af] bg-white focus:outline-none focus:border-[#d1d5db]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {["All", "Silver", "Gold", "Enterprise"].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors ${
                tierFilter === t
                  ? "bg-[#111111] text-white"
                  : "text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f4f6]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Client", "Tier", "Status", "Industry", "Started", "Monthly Value", "Health", "Renewal"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => window.location.href = `/admin/clients/${c.id}`}
                className="hover:bg-[#fafafa] transition-colors cursor-pointer"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-semibold text-[#374151]">{c.company_name[0]}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#111111]">{c.company_name}</p>
                      <p className="text-[11px] text-[#9ca3af]">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5"><Badge label={c.tier} /></td>
                <td className="px-4 py-3.5"><Badge label={c.status} /></td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{c.industry}</td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{c.start_date}</td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-[#111111]">
                  ${c.monthly_value.toLocaleString()}/mo
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-[48px] h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.health_score >= 80 ? "bg-emerald-500" : c.health_score >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${c.health_score}%` }}
                      />
                    </div>
                    <span className="text-[12px] text-[#6b7280]">{c.health_score}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{c.renewal_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-[13px] text-[#9ca3af]">
            No clients match your search.
          </div>
        )}
      </div>
    </div>
  );
}
