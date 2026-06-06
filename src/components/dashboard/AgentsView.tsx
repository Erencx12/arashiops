"use client";

import { useState } from "react";
import { Bot, CheckCircle2, Clock, AlertCircle, Loader } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbAgentTask, AgentName } from "@/lib/db-types";

const agents: { name: AgentName; role: string; description: string }[] = [
  { name: "Claude CEO", role: "Strategy & Intelligence", description: "ICP analysis, onboarding briefs, competitive research, and strategic playbooks." },
  { name: "Claude CMO", role: "Content & Campaigns",    description: "Email sequences, LinkedIn content, campaign briefs, and creative scripts." },
  { name: "Claude CFO", role: "Finance & Analytics",    description: "Revenue attribution, financial baselines, reporting, and pipeline analysis." },
];

const statusIcon = {
  Completed: <CheckCircle2 size={13} className="text-emerald-500" />,
  Review:    <AlertCircle size={13} className="text-amber-500" />,
  Active:    <Loader size={13} className="text-blue-500 animate-spin" />,
  Pending:   <Clock size={13} className="text-[#9ca3af]" />,
};

export function AgentsView({ tasks }: { tasks: DbAgentTask[] }) {
  const [activeAgent, setActiveAgent] = useState<string>("All");

  const filtered =
    activeAgent === "All" ? tasks : tasks.filter((t) => t.agent === activeAgent);

  const taskCounts = agents.reduce((acc, a) => {
    acc[a.name] = tasks.filter((t) => t.agent === a.name).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Agent Workflows</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">
          Operational core · {tasks.filter((t) => t.status === "Active").length} tasks running
        </p>
      </div>

      {/* Agent cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {agents.map((a) => {
          const active = tasks.filter((t) => t.agent === a.name && t.status === "Active").length;
          const done   = tasks.filter((t) => t.agent === a.name && t.status === "Completed").length;
          const review = tasks.filter((t) => t.agent === a.name && t.status === "Review").length;
          const isSelected = activeAgent === a.name;
          return (
            <button
              key={a.name}
              onClick={() => setActiveAgent(isSelected ? "All" : a.name)}
              className={`border rounded-xl p-5 text-left transition-all ${
                isSelected ? "border-[#111111] bg-[#111111]" : "border-[#e5e7eb] bg-white hover:border-[#d1d5db]"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? "bg-white/10" : "bg-[#f3f4f6]"}`}>
                  <Bot size={15} className={isSelected ? "text-white" : "text-[#374151]"} />
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/10 text-white" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
                  {taskCounts[a.name]} tasks
                </span>
              </div>
              <p className={`text-[13.5px] font-semibold mb-0.5 ${isSelected ? "text-white" : "text-[#111111]"}`}>{a.name}</p>
              <p className={`text-[11px] mb-3 ${isSelected ? "text-white/60" : "text-[#9ca3af]"}`}>{a.role}</p>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] ${isSelected ? "text-white/70" : "text-emerald-600"}`}>{done} done</span>
                {review > 0 && <span className={`text-[11px] ${isSelected ? "text-white/70" : "text-amber-600"}`}>{review} review</span>}
                {active > 0 && <span className={`text-[11px] ${isSelected ? "text-white/70" : "text-blue-600"}`}>{active} active</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tasks table */}
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
        <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#111111]">
            {activeAgent === "All" ? "All Tasks" : `${activeAgent} Tasks`}
          </p>
          {activeAgent !== "All" && (
            <button onClick={() => setActiveAgent("All")} className="text-[12px] text-[#9ca3af] hover:text-[#374151] transition-colors">
              Show all
            </button>
          )}
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Task", "Agent", "Status", "Output", "Created", "Completed", "Approval"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3.5">
                  <p className="text-[13px] font-medium text-[#111111] max-w-[200px] leading-snug">{t.task}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-[11.5px] font-medium text-[#374151] bg-[#f3f4f6] px-2 py-0.5 rounded whitespace-nowrap">{t.agent}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    {statusIcon[t.status]}
                    <Badge label={t.status} />
                  </div>
                </td>
                <td className="px-4 py-3.5 max-w-[180px]">
                  {t.output
                    ? <p className="text-[12px] text-[#6b7280] leading-snug">{t.output}</p>
                    : <span className="text-[12px] text-[#d1d5db]">In progress...</span>
                  }
                </td>
                <td className="px-4 py-3.5 text-[12px] text-[#9ca3af] whitespace-nowrap">{t.created_at}</td>
                <td className="px-4 py-3.5 text-[12px] text-[#9ca3af] whitespace-nowrap">{t.completed_at ?? "—"}</td>
                <td className="px-4 py-3.5">
                  {t.approved
                    ? <span className="text-[11px] text-emerald-600 font-medium">Approved</span>
                    : t.reviewed
                    ? <span className="text-[11px] text-amber-600 font-medium">Reviewed</span>
                    : <span className="text-[11px] text-[#9ca3af]">Pending</span>
                  }
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-[13px] text-[#9ca3af]">No tasks found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
