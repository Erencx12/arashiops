"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { scoreLeadAction, scoreAllUnscoredAction } from "@/lib/ai-actions";
import type { DbApolloLead, DbLeadScore } from "@/lib/db-types";

type ScoredLead = DbLeadScore & { lead_name: string; lead_company: string | null };
type Stats = { total: number; hot: number; warm: number; cold: number; disqualified: number; unscored: number };

type Props = {
  leads: DbApolloLead[];
  scores: ScoredLead[];
  stats: Stats;
};

const SCORE_FILTERS = ["All", "Hot", "Warm", "Cold", "Disqualified", "Unscored"] as const;

export function LeadsAIView({ leads, scores, stats }: Props) {
  const [filterScore, setFilterScore] = useState<string>("All");
  const [scoringId, setScoringId] = useState<number | null>(null);
  const [scoringAll, setScoringAll] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const scoreMap = new Map<number, ScoredLead>(scores.map(s => [s.apollo_lead_id, s]));

  const filteredLeads = leads.filter(lead => {
    if (filterScore === "All") return true;
    const score = scoreMap.get(lead.id);
    if (filterScore === "Unscored") return !score;
    return score?.score === filterScore;
  });

  function handleScoreLead(leadId: number) {
    setScoringId(leadId);
    setStatusMsg(null);
    startTransition(async () => {
      const res = await scoreLeadAction(leadId);
      setScoringId(null);
      if (res.error) setStatusMsg(`Error: ${res.error}`);
      else setStatusMsg(`Scored as ${res.score}`);
    });
  }

  function handleScoreAll() {
    setScoringAll(true);
    setStatusMsg(null);
    startTransition(async () => {
      const res = await scoreAllUnscoredAction();
      setScoringAll(false);
      if (res.error) setStatusMsg(`Error: ${res.error}`);
      else setStatusMsg(`Scored ${res.scored} leads. ${res.failed ? `${res.failed} failed.` : ""}`);
    });
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-[#111111]" />
            <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Lead Scoring</h1>
          </div>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">Claude scores each lead as Hot, Warm, Cold, or Disqualified with a confidence level and reason.</p>
        </div>
        <button
          onClick={handleScoreAll}
          disabled={isPending || scoringAll || stats.unscored === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {scoringAll ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Score All Unscored ({stats.unscored})
        </button>
      </div>

      {statusMsg && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-[12.5px] border flex items-center gap-2 ${
          statusMsg.startsWith("Error")
            ? "bg-red-50 text-red-700 border-red-100"
            : "bg-emerald-50 text-emerald-700 border-emerald-100"
        }`}>
          <CheckCircle2 size={13} />
          {statusMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total",         value: stats.total,         color: "text-[#374151] bg-white border-[#e5e7eb]" },
          { label: "Hot",           value: stats.hot,           color: "text-red-700 bg-red-50 border-red-100" },
          { label: "Warm",          value: stats.warm,          color: "text-amber-700 bg-amber-50 border-amber-100" },
          { label: "Cold",          value: stats.cold,          color: "text-blue-700 bg-blue-50 border-blue-100" },
          { label: "Disqualified",  value: stats.disqualified,  color: "text-[#9ca3af] bg-[#fafafa] border-[#e5e7eb]" },
          { label: "Unscored",      value: stats.unscored,      color: stats.unscored > 0 ? "text-amber-700 bg-amber-50 border-amber-100" : "text-[#9ca3af] bg-[#fafafa] border-[#e5e7eb]" },
        ].map(item => (
          <div key={item.label} className={`border rounded-xl px-4 py-3 ${item.color}`}>
            <p className="text-[22px] font-bold tracking-tight">{item.value}</p>
            <p className="text-[11px] font-medium mt-0.5 opacity-80">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {SCORE_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilterScore(f)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              filterScore === f
                ? "bg-[#111111] text-white"
                : "border border-[#e5e7eb] text-[#6b7280] hover:text-[#111111] hover:border-[#111111]"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-2 text-[12px] text-[#9ca3af]">{filteredLeads.length} leads</span>
      </div>

      {/* Table */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <Sparkles size={24} className="text-[#d1d5db] mx-auto mb-3" />
            <p className="text-[13px] text-[#9ca3af]">No leads in this category.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
                {["Name", "Company", "Title", "Industry", "Score", "Confidence", "Reason", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {filteredLeads.map(lead => {
                const scored = scoreMap.get(lead.id);
                const isScoring = scoringId === lead.id;
                return (
                  <tr key={lead.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#111111]">{lead.name}</td>
                    <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{lead.company ?? "—"}</td>
                    <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280] max-w-[140px] truncate">{lead.title ?? "—"}</td>
                    <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{lead.industry ?? "—"}</td>
                    <td className="px-4 py-3.5">
                      <Badge label={scored ? scored.score : "Unscored"} />
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280] tabular-nums">
                      {scored?.confidence != null ? `${scored.confidence}%` : "—"}
                    </td>
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <span className="text-[12px] text-[#6b7280] line-clamp-2">{scored?.reason ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {!scored && (
                        <button
                          onClick={() => handleScoreLead(lead.id)}
                          disabled={isPending || isScoring}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#e5e7eb] rounded-lg text-[11.5px] font-medium text-[#6b7280] hover:text-[#111111] hover:border-[#111111] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isScoring ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                          Score
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
