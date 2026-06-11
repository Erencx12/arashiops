"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { updateTestCaseAction } from "@/lib/test-actions";
import type { DbTestCase } from "@/lib/db-types";

type Props = { testCases: DbTestCase[] };

function StatusIcon({ s }: { s: string }) {
  if (s === "Pass")         return <CheckCircle2 size={14} className="text-emerald-500" />;
  if (s === "Fail")         return <XCircle      size={14} className="text-red-500" />;
  return                           <AlertCircle  size={14} className="text-amber-500" />;
}

const STATUS_PILL: Record<string, string> = {
  Pass:          "text-emerald-700 bg-emerald-50 border-emerald-100",
  Fail:          "text-red-700 bg-red-50 border-red-100",
  "Needs Review":"text-amber-700 bg-amber-50 border-amber-100",
};

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function TestingView({ testCases }: Props) {
  const [catFilter, setCatFilter] = useState("All");
  const [, startTransition] = useTransition();

  const categories = ["All", ...Array.from(new Set(testCases.map(t => t.category ?? "Other"))).sort()];

  const filtered = catFilter === "All"
    ? testCases
    : testCases.filter(t => (t.category ?? "Other") === catFilter);

  const passing   = testCases.filter(t => t.status === "Pass").length;
  const failing   = testCases.filter(t => t.status === "Fail").length;
  const review    = testCases.filter(t => t.status === "Needs Review").length;
  const pct       = testCases.length > 0 ? Math.round((passing / testCases.length) * 100) : 0;

  function setStatus(id: number, status: "Pass" | "Fail" | "Needs Review") {
    startTransition(async () => {
      await updateTestCaseAction(id, status);
    });
  }

  const byCategory = filtered.reduce<Record<string, DbTestCase[]>>((acc, t) => {
    const cat = t.category ?? "Other";
    (acc[cat] ??= []).push(t);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111111] tracking-tight">Testing</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Track feature test status before launch</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 mb-5">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-[13px] font-medium text-[#111111]">Test Coverage</p>
            <p className="text-[12px] text-[#9ca3af] mt-0.5">{passing} passing · {failing} failing · {review} needs review</p>
          </div>
          <span className={`text-[26px] font-semibold ${pct === 100 ? "text-emerald-600" : pct >= 70 ? "text-amber-600" : "text-red-600"}`}>
            {pct}%
          </span>
        </div>
        <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-400" : "bg-red-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-5 mt-3">
          {[
            { label: "Pass",         count: passing, color: "text-emerald-600" },
            { label: "Fail",         count: failing, color: "text-red-600" },
            { label: "Needs Review", count: review,  color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className={`text-[13px] font-semibold ${s.color}`}>{s.count}</span>
              <span className="text-[12px] text-[#9ca3af]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1 flex-wrap mb-5">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
              catFilter === c ? "bg-[#111111] text-white" : "bg-white text-[#6b7280] border border-[#e5e7eb] hover:bg-[#f3f4f6]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tests by category */}
      <div className="space-y-4">
        {Object.entries(byCategory).map(([cat, tests]) => (
          <div key={cat} className="bg-white border border-[#e5e7eb] rounded-xl">
            <div className="px-5 py-3 border-b border-[#e5e7eb] flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-[#111111]">{cat}</h2>
              <span className="text-[11.5px] text-[#9ca3af]">
                {tests.filter(t => t.status === "Pass").length}/{tests.length} passing
              </span>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {tests.map(t => (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                  <StatusIcon s={t.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111111] truncate">{t.feature}</p>
                    {t.description && <p className="text-[11.5px] text-[#9ca3af] truncate">{t.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-[11px] text-[#9ca3af]">
                    <Clock size={11} />
                    {timeAgo(t.last_tested_at)}
                  </div>
                  <span className={`text-[11px] font-medium border px-2 py-0.5 rounded-full shrink-0 ${STATUS_PILL[t.status] ?? ""}`}>
                    {t.status}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    {(["Pass", "Fail", "Needs Review"] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setStatus(t.id, s)}
                        disabled={t.status === s}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          t.status === s
                            ? "bg-[#111111] text-white cursor-default"
                            : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"
                        }`}
                      >
                        {s === "Needs Review" ? "Review" : s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
