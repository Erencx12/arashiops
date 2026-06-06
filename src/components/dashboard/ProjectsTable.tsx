"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbProject, ProjectStatus } from "@/lib/db-types";

const statuses: ProjectStatus[] = ["Pending", "Active", "Review", "Completed", "Paused"];
const tabs = ["All", ...statuses];

export function ProjectsTable({ projects }: { projects: DbProject[] }) {
  const [tab, setTab] = useState("All");

  const filtered = tab === "All" ? projects : projects.filter((p) => p.status === tab);

  const counts = tabs.reduce((acc, t) => {
    acc[t] = t === "All" ? projects.length : projects.filter((p) => p.status === t).length;
    return acc;
  }, {} as Record<string, number>);

  const clientCount = new Set(projects.map((p) => p.client_id)).size;

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Projects</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">
            {projects.length} total across {clientCount} clients
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors">
          <Plus size={13} />
          New Project
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-[#e5e7eb] pb-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-[#111111] text-[#111111]"
                : "border-transparent text-[#6b7280] hover:text-[#374151]"
            }`}
          >
            {t}
            {counts[t] > 0 && (
              <span
                className={`ml-1.5 text-[10.5px] px-1.5 py-0.5 rounded-full ${
                  tab === t ? "bg-[#111111] text-white" : "bg-[#f3f4f6] text-[#6b7280]"
                }`}
              >
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Project", "Client", "Status", "Deadline", "Progress", "Agent"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3.5">
                  <p className="text-[13px] font-medium text-[#111111]">{p.title}</p>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{p.client_name}</td>
                <td className="px-4 py-3.5"><Badge label={p.status} /></td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{p.deadline}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-[72px] h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-[12px] text-[#6b7280] w-8">{p.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-[12px] font-medium text-[#374151] bg-[#f3f4f6] px-2 py-1 rounded">
                    {p.agent}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[13px] text-[#9ca3af]">No projects with this status.</div>
        )}
      </div>
    </div>
  );
}
