"use client";

import { useState, useTransition, useRef } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { Plus, DollarSign, Calendar, GripVertical, Trophy, X } from "lucide-react";
import type { DbDeal, DealStage } from "@/lib/db-types";
import { createDealAction } from "@/lib/deal-actions";
import { updateDealStageAction } from "@/lib/deal-actions";

const STAGES: DealStage[] = [
  "Lead", "Contacted", "Discovery Scheduled", "Discovery Completed",
  "Proposal Sent", "Negotiation", "Won", "Lost",
];

const STAGE_COLORS: Record<DealStage, string> = {
  "Lead":                 "border-t-[#e5e7eb]",
  "Contacted":            "border-t-blue-200",
  "Discovery Scheduled":  "border-t-violet-200",
  "Discovery Completed":  "border-t-violet-300",
  "Proposal Sent":        "border-t-amber-200",
  "Negotiation":          "border-t-orange-300",
  "Won":                  "border-t-emerald-400",
  "Lost":                 "border-t-red-300",
};

const STAGE_HEADER: Record<DealStage, string> = {
  "Lead":                 "text-[#374151]",
  "Contacted":            "text-blue-700",
  "Discovery Scheduled":  "text-violet-700",
  "Discovery Completed":  "text-violet-800",
  "Proposal Sent":        "text-amber-700",
  "Negotiation":          "text-orange-700",
  "Won":                  "text-emerald-700",
  "Lost":                 "text-red-600",
};

export function DealsBoard({ deals }: { deals: DbDeal[] }) {
  const [isPending, startTransition] = useTransition();
  const [showNewDeal, setShowNewDeal] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const [localDeals, setLocalDeals] = useState<DbDeal[]>(deals);
  const [state, action, formPending] = useActionState(createDealAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  const totalValue = localDeals.filter(d => d.stage !== "Lost").reduce((s, d) => s + d.deal_value, 0);
  const wonValue = localDeals.filter(d => d.stage === "Won").reduce((s, d) => s + d.deal_value, 0);

  function handleDragStart(e: React.DragEvent, dealId: number) {
    setDragId(dealId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, stage: DealStage) {
    e.preventDefault();
    if (dragId === null) return;
    const deal = localDeals.find(d => d.id === dragId);
    if (!deal || deal.stage === stage) { setDragId(null); return; }

    setLocalDeals(prev => prev.map(d => d.id === dragId ? { ...d, stage } : d));
    setDragId(null);
    startTransition(async () => { await updateDealStageAction(dragId, stage); });
  }

  // After successful creation, append the new deal optimistically by re-rendering
  // (server revalidates the page)
  const handleFormSuccess = () => {
    if (state?.success) {
      formRef.current?.reset();
      setShowNewDeal(false);
    }
  };

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Deals Pipeline</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">
            {localDeals.length} deals · ${totalValue.toLocaleString()} pipeline · ${wonValue.toLocaleString()} won
          </p>
        </div>
        <button
          onClick={() => setShowNewDeal(!showNewDeal)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          <Plus size={13} /> New Deal
        </button>
      </div>

      {/* New Deal Form */}
      {showNewDeal && (
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-[#111111]">New Deal</p>
            <button onClick={() => setShowNewDeal(false)}>
              <X size={14} className="text-[#9ca3af] hover:text-[#111111]" />
            </button>
          </div>
          {state?.error && <p className="text-[12.5px] text-red-600 mb-3">{state.error}</p>}
          <form ref={formRef} action={action} className="grid grid-cols-3 gap-3">
            <input name="company" required placeholder="Company *"
              className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-[#111111] transition-colors" />
            <input name="contactName" required placeholder="Contact Name *"
              className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-[#111111] transition-colors" />
            <input name="contactEmail" type="email" placeholder="Email"
              className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-[#111111] transition-colors" />
            <input name="dealValue" type="number" min="0" placeholder="Deal Value ($) *"
              className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-[#111111] transition-colors" />
            <select name="stage" defaultValue="Lead"
              className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-[#111111]">
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
            <input name="expectedCloseDate" type="date"
              className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-[#111111] transition-colors" />
            <input name="owner" defaultValue="Soham Das" placeholder="Owner"
              className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-[#111111] transition-colors" />
            <textarea name="notes" placeholder="Notes" rows={1}
              className="col-span-2 border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-[#111111] resize-none transition-colors" />
            <div className="col-span-3 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowNewDeal(false)}
                className="px-4 py-2 text-[12.5px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors">Cancel</button>
              <button type="submit" disabled={formPending}
                className="px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                {formPending ? "Creating…" : "Create Deal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "60vh" }}>
        {STAGES.map((stage) => {
          const stageDeals = localDeals.filter(d => d.stage === stage);
          const stageValue = stageDeals.reduce((s, d) => s + d.deal_value, 0);
          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="flex-shrink-0 w-[220px]"
            >
              {/* Column header */}
              <div className={`border border-[#e5e7eb] border-t-2 ${STAGE_COLORS[stage]} rounded-xl bg-white overflow-hidden`}>
                <div className="px-3.5 py-3 border-b border-[#f3f4f6]">
                  <div className="flex items-center justify-between">
                    <p className={`text-[11.5px] font-semibold ${STAGE_HEADER[stage]} truncate`}>{stage}</p>
                    <span className="text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-1">
                      {stageDeals.length}
                    </span>
                  </div>
                  {stageValue > 0 && (
                    <p className="text-[11px] text-[#9ca3af] mt-0.5">${stageValue.toLocaleString()}</p>
                  )}
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[120px]">
                  {stageDeals.map((deal) => (
                    <Link key={deal.id} href={`/admin/deals/${deal.id}`}>
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        className={`border border-[#e5e7eb] rounded-lg bg-[#fafafa] p-3 cursor-grab active:cursor-grabbing hover:border-[#d1d5db] hover:bg-white transition-colors group ${isPending && dragId === deal.id ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <p className="text-[12.5px] font-semibold text-[#111111] leading-tight line-clamp-2">{deal.company}</p>
                          <GripVertical size={10} className="text-[#d1d5db] shrink-0 mt-0.5 group-hover:text-[#9ca3af]" />
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mb-2">{deal.contact_name}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <DollarSign size={10} className="text-[#9ca3af]" />
                            <span className="text-[11px] font-semibold text-[#374151]">
                              {deal.deal_value > 0 ? `${(deal.deal_value / 1000).toFixed(0)}k` : "—"}
                            </span>
                          </div>
                          {deal.expected_close_date && (
                            <div className="flex items-center gap-1">
                              <Calendar size={9} className="text-[#9ca3af]" />
                              <span className="text-[10px] text-[#9ca3af]">{deal.expected_close_date.split(",")[0]}</span>
                            </div>
                          )}
                        </div>
                        {stage === "Won" && (
                          <div className="mt-2 flex items-center gap-1">
                            <Trophy size={9} className="text-emerald-500" />
                            <span className="text-[10px] text-emerald-600 font-medium">Won</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="flex items-center justify-center h-16">
                      <p className="text-[11px] text-[#d1d5db]">Drop here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
