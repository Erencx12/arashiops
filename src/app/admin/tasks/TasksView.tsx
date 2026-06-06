"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { Plus, Circle, CheckCircle2, Clock, AlertCircle, Ban } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbTask, DbClient, DbProject } from "@/lib/db-types";
import { createTaskAction, updateTaskStatusAction } from "@/lib/task-actions";

type Tab = "All" | "To Do" | "In Progress" | "Review" | "Completed" | "Blocked";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  "To Do":       <Circle size={13} className="text-[#9ca3af]" />,
  "In Progress": <Clock size={13} className="text-blue-500" />,
  "Review":      <AlertCircle size={13} className="text-amber-500" />,
  "Completed":   <CheckCircle2 size={13} className="text-emerald-500" />,
  "Blocked":     <Ban size={13} className="text-red-500" />,
};

const PRIORITY_DOT: Record<string, string> = {
  Critical: "bg-red-500",
  High:     "bg-orange-400",
  Medium:   "bg-amber-400",
  Low:      "bg-[#d1d5db]",
};

type Props = {
  tasks: DbTask[];
  clients: DbClient[];
  projects: DbProject[];
};

export function TasksView({ tasks, clients, projects }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, action, formPending] = useActionState(createTaskAction, null);

  const TABS: Tab[] = ["All", "To Do", "In Progress", "Review", "Completed", "Blocked"];

  const filtered = activeTab === "All" ? tasks : tasks.filter((t) => t.status === activeTab);

  function handleStatusChange(id: number, status: string) {
    startTransition(async () => { await updateTaskStatusAction(id, status); });
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Tasks</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{tasks.length} task{tasks.length !== 1 ? "s" : ""} · {tasks.filter((t) => t.status !== "Completed").length} open</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          <Plus size={13} /> New Task
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form action={action} className="border border-[#e5e7eb] rounded-xl bg-white p-5 mb-6 space-y-4">
          <p className="text-[13px] font-semibold text-[#111111]">New Task</p>
          {state?.error && <p className="text-[12.5px] text-red-600">{state.error}</p>}
          {state?.success && <p className="text-[12.5px] text-emerald-600">Task created.</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input
                name="title"
                required
                placeholder="Task title *"
                className="w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors"
              />
            </div>
            <div className="col-span-2">
              <textarea
                name="description"
                placeholder="Description (optional)"
                rows={2}
                className="w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] resize-none transition-colors"
              />
            </div>
            <select name="priority" defaultValue="Medium" className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] outline-none focus:border-[#111111] bg-white">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
            <input
              name="assignee"
              placeholder="Assignee (optional)"
              className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors"
            />
            <select name="clientId" className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] outline-none focus:border-[#111111] bg-white">
              <option value="">No client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
            <select name="projectId" className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] outline-none focus:border-[#111111] bg-white">
              <option value="">No project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input
              name="dueDate"
              type="date"
              className="border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] outline-none focus:border-[#111111] transition-colors"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-[12.5px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors">Cancel</button>
            <button type="submit" disabled={formPending} className="px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">Create Task</button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-0.5 mb-4 border-b border-[#e5e7eb]">
        {TABS.map((tab) => {
          const count = tab === "All" ? tasks.length : tasks.filter((t) => t.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[12.5px] font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? "border-[#111111] text-[#111111]"
                  : "border-transparent text-[#6b7280] hover:text-[#111111]"
              }`}
            >
              {tab}
              <span className="ml-1.5 text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Task list */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <div className="divide-y divide-[#f3f4f6]">
          {filtered.map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 group">
              <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} title={task.priority} />
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-medium truncate ${task.status === "Completed" ? "line-through text-[#9ca3af]" : "text-[#111111]"}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.client_name && <span className="text-[11.5px] text-[#9ca3af]">{task.client_name}</span>}
                  {task.client_name && task.due_date && <span className="text-[#e5e7eb]">·</span>}
                  {task.due_date && <span className="text-[11.5px] text-[#9ca3af]">Due {task.due_date}</span>}
                  {task.assignee && <span className="text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{task.assignee}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <Badge label={task.priority} />
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  disabled={isPending}
                  className="text-[12px] border border-[#e5e7eb] rounded-md px-2 py-1 text-[#374151] bg-white outline-none cursor-pointer hover:border-[#111111] transition-colors"
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Review</option>
                  <option>Completed</option>
                  <option>Blocked</option>
                </select>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center">
              <CheckCircle2 size={20} className="text-[#d1d5db] mx-auto mb-2" />
              <p className="text-[13px] text-[#9ca3af]">
                {activeTab === "All" ? "No tasks yet." : `No ${activeTab.toLowerCase()} tasks.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
