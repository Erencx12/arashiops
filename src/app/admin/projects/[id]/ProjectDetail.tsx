"use client";

import { useState, useTransition, useRef } from "react";
import { useActionState } from "react";
import { Plus, Check, Circle, Package } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbProject, DbProjectMilestone, DbTask, DbContentItem } from "@/lib/db-types";
import { addMilestoneAction, updateMilestoneStatusAction, updateProjectStatusAction, updateProjectProgressAction } from "@/lib/project-actions";
import { updateTaskStatusAction } from "@/lib/task-actions";

type Props = {
  project: DbProject;
  milestones: DbProjectMilestone[];
  tasks: DbTask[];
  deliverables: DbContentItem[];
};

const PRIORITY_DOT: Record<string, string> = {
  Critical: "bg-red-500",
  High:     "bg-orange-400",
  Medium:   "bg-amber-400",
  Low:      "bg-[#d1d5db]",
};

export function ProjectDetail({ project, milestones, tasks, deliverables }: Props) {
  const [isPending, startTransition] = useTransition();
  const sliderRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"milestones" | "tasks" | "deliverables">("milestones");
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  const addMilestone = addMilestoneAction.bind(null, project.id);
  const [milestoneState, milestoneAction, milestonePending] = useActionState(addMilestone, null);

  function handleMilestoneStatus(id: number, status: string) {
    startTransition(async () => { await updateMilestoneStatusAction(id, status, project.id); });
  }

  function handleProjectStatus(status: string) {
    startTransition(async () => { await updateProjectStatusAction(project.id, status); });
  }

  function handleProgress() {
    const val = Number(sliderRef.current?.value ?? project.progress);
    startTransition(async () => { await updateProjectProgressAction(project.id, val); });
  }

  function handleTaskStatus(id: number, status: string) {
    startTransition(async () => { await updateTaskStatusAction(id, status); });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_260px] gap-6">
      {/* Left: tabbed content */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <div className="flex border-b border-[#e5e7eb]">
          {(["milestones", "tasks", "deliverables"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-[12.5px] font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab ? "border-[#111111] text-[#111111]" : "border-transparent text-[#6b7280] hover:text-[#111111]"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">
                {tab === "milestones" ? milestones.length : tab === "tasks" ? tasks.length : deliverables.length}
              </span>
            </button>
          ))}
        </div>

        {/* Milestones */}
        {activeTab === "milestones" && (
          <div>
            <div className="px-5 py-3 border-b border-[#f3f4f6] flex justify-between items-center">
              <p className="text-[12px] text-[#9ca3af]">{milestones.length} milestone{milestones.length !== 1 ? "s" : ""}</p>
              <button
                onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                className="text-[12px] text-[#6b7280] hover:text-[#111111] flex items-center gap-1 transition-colors"
              >
                <Plus size={11} /> Add
              </button>
            </div>

            {showMilestoneForm && (
              <form action={milestoneAction} className="px-5 py-4 border-b border-[#f3f4f6] space-y-2.5">
                {milestoneState?.error && <p className="text-[12px] text-red-600">{milestoneState.error}</p>}
                <input name="title" required placeholder="Milestone title *" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#111111] transition-colors" />
                <input name="description" placeholder="Description (optional)" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#111111] transition-colors" />
                <input name="dueDate" type="date" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#111111] transition-colors" />
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowMilestoneForm(false)} className="px-3 py-1.5 text-[12px] text-[#6b7280] hover:bg-[#f3f4f6] rounded-md transition-colors">Cancel</button>
                  <button type="submit" disabled={milestonePending} className="px-3 py-1.5 bg-[#111111] text-white text-[12px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">Add</button>
                </div>
              </form>
            )}

            <div className="divide-y divide-[#f3f4f6]">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-start gap-3 px-5 py-4">
                  <button
                    onClick={() => handleMilestoneStatus(m.id, m.status === "Completed" ? "Pending" : "Completed")}
                    disabled={isPending}
                    className="mt-0.5 shrink-0"
                  >
                    {m.status === "Completed"
                      ? <Check size={16} className="text-emerald-500" />
                      : <Circle size={16} className="text-[#d1d5db] hover:text-[#111111] transition-colors" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-medium ${m.status === "Completed" ? "line-through text-[#9ca3af]" : "text-[#111111]"}`}>{m.title}</p>
                    {m.description && <p className="text-[12px] text-[#9ca3af] mt-0.5">{m.description}</p>}
                    {m.due_date && <p className="text-[11.5px] text-[#9ca3af] mt-0.5">Due {m.due_date}</p>}
                  </div>
                  <Badge label={m.status} />
                </div>
              ))}
              {milestones.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-[13px] text-[#9ca3af]">No milestones yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tasks */}
        {activeTab === "tasks" && (
          <div className="divide-y divide-[#f3f4f6]">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority]}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium truncate ${t.status === "Completed" ? "line-through text-[#9ca3af]" : "text-[#111111]"}`}>{t.title}</p>
                  {t.assignee && <p className="text-[11.5px] text-[#9ca3af]">{t.assignee}</p>}
                </div>
                <select
                  value={t.status}
                  onChange={(e) => handleTaskStatus(t.id, e.target.value)}
                  disabled={isPending}
                  className="text-[12px] border border-[#e5e7eb] rounded-md px-2 py-1 bg-white outline-none"
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Review</option>
                  <option>Completed</option>
                  <option>Blocked</option>
                </select>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-[#9ca3af]">No tasks for this project.</p>
              </div>
            )}
          </div>
        )}

        {/* Deliverables */}
        {activeTab === "deliverables" && (
          <div className="divide-y divide-[#f3f4f6]">
            {deliverables.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-7 h-7 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                  <Package size={12} className="text-[#6b7280]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#111111] truncate">{d.title}</p>
                  <p className="text-[11.5px] text-[#9ca3af]">{d.type} · v{d.version}</p>
                </div>
                <Badge label={d.status} />
              </div>
            ))}
            {deliverables.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-[13px] text-[#9ca3af]">No deliverables linked to this project.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: project controls */}
      <div className="space-y-4">
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Status</p>
          <div className="space-y-1">
            {(["Pending","Planning","Active","Review","Waiting On Client","Completed","Paused","Cancelled"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleProjectStatus(s)}
                disabled={isPending || project.status === s}
                className={`w-full text-left px-3 py-2 rounded-md text-[12.5px] font-medium transition-colors ${
                  project.status === s ? "bg-[#111111] text-white" : "text-[#374151] hover:bg-[#f3f4f6]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-[#e5e7eb] rounded-xl bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">Progress</p>
            <p className="text-[13px] font-bold text-[#111111]">{project.progress}%</p>
          </div>
          <input
            ref={sliderRef}
            type="range"
            min={0}
            max={100}
            step={5}
            defaultValue={project.progress}
            onMouseUp={handleProgress}
            onTouchEnd={handleProgress}
            disabled={isPending}
            className="w-full accent-[#111111]"
          />
        </div>
      </div>
    </div>
  );
}
