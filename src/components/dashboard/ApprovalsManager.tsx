"use client";

import { useState, useTransition } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { updateApprovalStatus } from "@/lib/actions";
import type { DbApproval, ApprovalStatus } from "@/lib/db-types";

const typeColors: Record<string, string> = {
  Script:   "bg-blue-50 text-blue-700",
  Video:    "bg-purple-50 text-purple-700",
  Report:   "bg-amber-50 text-amber-700",
  Research: "bg-teal-50 text-teal-700",
  Asset:    "bg-pink-50 text-pink-700",
  Campaign: "bg-orange-50 text-orange-700",
};

export function ApprovalsManager({ approvals }: { approvals: DbApproval[] }) {
  const [optimistic, setOptimistic] = useState<Record<number, ApprovalStatus>>({});
  const [, startTransition] = useTransition();

  const getStatus = (a: DbApproval): ApprovalStatus =>
    optimistic[a.id] ?? a.status;

  const act = (a: DbApproval, status: ApprovalStatus) => {
    setOptimistic((prev) => ({ ...prev, [a.id]: status }));
    startTransition(async () => {
      await updateApprovalStatus(a.id, status);
    });
  };

  const pending  = approvals.filter((a) => getStatus(a) === "Pending");
  const actioned = approvals.filter((a) => getStatus(a) !== "Pending");

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Approvals</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">{pending.length} pending · {actioned.length} resolved</p>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Awaiting Review</p>
          <div className="space-y-2">
            {pending.map((a) => (
              <div key={a.id} className="border border-[#e5e7eb] rounded-xl p-5 bg-white hover:border-[#d1d5db] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap mt-0.5 ${typeColors[a.type] ?? "bg-[#f3f4f6] text-[#6b7280]"}`}>
                      {a.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold text-[#111111] leading-snug">{a.title}</p>
                      <p className="text-[12px] text-[#9ca3af] mt-1">{a.client_name} · {a.agent} · {a.created_at}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => act(a, "Approved")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[12px] font-medium rounded-md hover:bg-emerald-100 transition-colors"
                    >
                      <Check size={12} strokeWidth={2.5} />
                      Approve
                    </button>
                    <button
                      onClick={() => act(a, "Revision Requested")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 text-[12px] font-medium rounded-md hover:bg-amber-100 transition-colors"
                    >
                      <RotateCcw size={12} strokeWidth={2} />
                      Revision
                    </button>
                    <button
                      onClick={() => act(a, "Rejected")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 text-[12px] font-medium rounded-md hover:bg-red-100 transition-colors"
                    >
                      <X size={12} strokeWidth={2.5} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div className="border border-emerald-100 rounded-xl p-8 bg-emerald-50 text-center mb-8">
          <Check size={20} className="text-emerald-500 mx-auto mb-2" strokeWidth={2.5} />
          <p className="text-[14px] font-medium text-emerald-800">All caught up</p>
          <p className="text-[12.5px] text-emerald-600 mt-1">No pending approvals right now.</p>
        </div>
      )}

      {/* Resolved */}
      {actioned.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Resolved</p>
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
                  {["Type", "Title", "Client", "Agent", "Date", "Status"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f4f6]">
                {actioned.map((a) => (
                  <tr key={a.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${typeColors[a.type] ?? "bg-[#f3f4f6] text-[#6b7280]"}`}>
                        {a.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] max-w-[220px] leading-snug">{a.title}</td>
                    <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{a.client_name}</td>
                    <td className="px-4 py-3.5 text-[12px] text-[#6b7280]">{a.agent}</td>
                    <td className="px-4 py-3.5 text-[12px] text-[#9ca3af]">{a.created_at}</td>
                    <td className="px-4 py-3.5"><Badge label={getStatus(a)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
