"use client";

import { useState, useTransition } from "react";
import { Check, RotateCcw, MessageSquare } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { updateApprovalStatus } from "@/lib/actions";
import type { DbApproval, ApprovalStatus } from "@/lib/db-types";

export function ClientApprovalsManager({ approvals }: { approvals: DbApproval[] }) {
  const [optimistic, setOptimistic] = useState<Record<number, ApprovalStatus>>({});
  const [comments, setComments]     = useState<Record<number, string>>({});
  const [commenting, setCommenting] = useState<number | null>(null);
  const [draft, setDraft]           = useState("");
  const [, startTransition]         = useTransition();

  const getStatus = (a: DbApproval): ApprovalStatus => optimistic[a.id] ?? a.status;

  const act = (a: DbApproval, status: ApprovalStatus, comment?: string) => {
    setOptimistic((prev) => ({ ...prev, [a.id]: status }));
    if (comment) setComments((prev) => ({ ...prev, [a.id]: comment }));
    setCommenting(null);
    setDraft("");
    startTransition(async () => {
      await updateApprovalStatus(a.id, status, comment);
    });
  };

  const pending  = approvals.filter((a) => getStatus(a) === "Pending");
  const resolved = approvals.filter((a) => getStatus(a) !== "Pending");

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Approvals</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">{pending.length} awaiting your review</p>
      </div>

      {pending.length > 0 && (
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Needs Your Review</p>
          <div className="space-y-3">
            {pending.map((a) => (
              <div key={a.id} className="border border-[#e5e7eb] rounded-xl bg-white">
                <div className="px-6 py-5 border-b border-[#f3f4f6]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#111111] mb-1">{a.title}</p>
                      <p className="text-[12px] text-[#9ca3af]">{a.type} · Submitted by {a.agent} · {a.created_at}</p>
                    </div>
                    <Badge label={getStatus(a)} />
                  </div>
                </div>
                <div className="px-6 py-4">
                  {commenting === a.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Describe the revision needed..."
                        rows={3}
                        className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-[13px] text-[#374151] placeholder:text-[#9ca3af] resize-none focus:outline-none focus:border-[#d1d5db]"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => act(a, "Revision Requested", draft)}
                          className="px-4 py-2 bg-amber-500 text-white text-[12.5px] font-medium rounded-md hover:bg-amber-600 transition-colors"
                        >
                          Send Revision Request
                        </button>
                        <button
                          onClick={() => { setCommenting(null); setDraft(""); }}
                          className="px-4 py-2 border border-[#e5e7eb] text-[#374151] text-[12.5px] font-medium rounded-md hover:bg-[#f9fafb] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => act(a, "Approved")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[12.5px] font-medium rounded-md hover:bg-emerald-100 transition-colors"
                      >
                        <Check size={13} strokeWidth={2.5} />
                        Approve
                      </button>
                      <button
                        onClick={() => setCommenting(a.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 text-[12.5px] font-medium rounded-md hover:bg-amber-100 transition-colors"
                      >
                        <RotateCcw size={12} />
                        Request Revision
                      </button>
                      <button
                        onClick={() => setCommenting(a.id)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-[#e5e7eb] text-[#374151] text-[12.5px] font-medium rounded-md hover:bg-[#f9fafb] transition-colors"
                      >
                        <MessageSquare size={12} />
                        Comment
                      </button>
                    </div>
                  )}
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
          <p className="text-[12.5px] text-emerald-600 mt-1">No items awaiting your approval.</p>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">History</p>
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white divide-y divide-[#f3f4f6]">
            {resolved.map((a) => (
              <div key={a.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#374151]">{a.title}</p>
                  <p className="text-[11.5px] text-[#9ca3af] mt-0.5">{a.type} · {a.created_at}</p>
                  {(comments[a.id] || a.comment) && (
                    <p className="text-[12px] text-[#6b7280] mt-1 italic">"{comments[a.id] ?? a.comment}"</p>
                  )}
                </div>
                <Badge label={getStatus(a)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
