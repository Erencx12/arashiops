"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Phone, Plus, X, ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import type { DbDiscoveryCall, DbDeal } from "@/lib/db-types";
import { createDiscoveryCallAction } from "@/lib/proposal-actions";

type Props = {
  calls: DbDiscoveryCall[];
  deals: DbDeal[];
  defaultDealId?: string;
};

const inputCls = "w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors";
const labelCls = "block text-[12.5px] font-medium text-[#374151] mb-1.5";

export function DiscoveryView({ calls, deals, defaultDealId }: Props) {
  const [showForm, setShowForm] = useState(Boolean(defaultDealId));
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [state, action, pending] = useActionState(createDiscoveryCallAction, null);

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Discovery Calls</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{calls.length} call{calls.length !== 1 ? "s" : ""} logged</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          <Plus size={13} /> Log Call
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[14px] font-semibold text-[#111111]">Log Discovery Call</p>
            <button onClick={() => setShowForm(false)}><X size={14} className="text-[#9ca3af] hover:text-[#111111]" /></button>
          </div>
          {state?.error && <p className="text-[12.5px] text-red-600 mb-3">{state.error}</p>}
          {state?.success && <p className="text-[12.5px] text-emerald-600 mb-3">Call logged successfully.</p>}

          <form action={action} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Company *</label>
                <input name="company" required placeholder="Acme Inc." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Contact Name *</label>
                <input name="contactName" required placeholder="John Smith" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Link to Deal</label>
                <select name="dealId" defaultValue={defaultDealId ?? ""} className={`${inputCls} bg-white`}>
                  <option value="">No deal linked</option>
                  {deals.map(d => <option key={d.id} value={d.id}>{d.company} — {d.stage}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Call Date</label>
                <input name="callDate" type="date" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Meeting Notes</label>
              <textarea name="meetingNotes" rows={3} placeholder="What was discussed..." className={`${inputCls} resize-none`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Pain Points</label>
                <textarea name="painPoints" rows={2} placeholder="Key challenges identified..." className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Requirements</label>
                <textarea name="requirements" rows={2} placeholder="What they need..." className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Budget</label>
                <input name="budget" placeholder="e.g. $3k–$7k/mo" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Decision Timeline</label>
                <input name="decisionTimeline" placeholder="e.g. Q3 2026" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Next Action</label>
              <input name="nextAction" placeholder="e.g. Send proposal by Friday" className={inputCls} />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 text-[12.5px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors">Cancel</button>
              <button type="submit" disabled={pending}
                className="px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                {pending ? "Logging…" : "Log Call"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Call list */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <div className="divide-y divide-[#f3f4f6]">
          {calls.map((call) => (
            <div key={call.id} className="px-5 py-4">
              <button
                onClick={() => setExpandedId(expandedId === call.id ? null : call.id)}
                className="w-full flex items-start gap-3 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone size={13} className="text-[#6b7280]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-[#111111]">{call.company}</p>
                    {call.deal_company && (
                      <span className="text-[10.5px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded">
                        Deal: {call.deal_company}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#9ca3af]">{call.contact_name} · {call.call_date ?? "Date not set"}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {call.next_action && (
                    <span className="text-[10.5px] text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Action pending</span>
                  )}
                  {expandedId === call.id ? <ChevronDown size={14} className="text-[#9ca3af]" /> : <ChevronRight size={14} className="text-[#9ca3af]" />}
                </div>
              </button>

              {expandedId === call.id && (
                <div className="mt-4 ml-11 space-y-3">
                  {call.meeting_notes && (
                    <div>
                      <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">Notes</p>
                      <p className="text-[13px] text-[#374151] leading-relaxed">{call.meeting_notes}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {call.pain_points && (
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">Pain Points</p>
                        <p className="text-[12.5px] text-[#374151] leading-relaxed">{call.pain_points}</p>
                      </div>
                    )}
                    {call.requirements && (
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">Requirements</p>
                        <p className="text-[12.5px] text-[#374151] leading-relaxed">{call.requirements}</p>
                      </div>
                    )}
                    {call.budget && (
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">Budget</p>
                        <p className="text-[12.5px] text-[#374151]">{call.budget}</p>
                      </div>
                    )}
                    {call.decision_timeline && (
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">Decision Timeline</p>
                        <p className="text-[12.5px] text-[#374151]">{call.decision_timeline}</p>
                      </div>
                    )}
                  </div>
                  {call.next_action && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3.5 py-2.5">
                      <ArrowRight size={12} className="text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-amber-600 mb-0.5">Next Action</p>
                        <p className="text-[12.5px] text-amber-900">{call.next_action}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {calls.length === 0 && (
            <div className="px-5 py-14 text-center">
              <Phone size={20} className="text-[#d1d5db] mx-auto mb-3" />
              <p className="text-[13px] text-[#9ca3af]">No discovery calls yet. Log your first call above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
