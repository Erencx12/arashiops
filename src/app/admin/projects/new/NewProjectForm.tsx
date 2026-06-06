"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { DbClient } from "@/lib/db-types";
import { createProjectAction } from "@/lib/project-actions";

export function NewProjectForm({ clients, defaultClientId }: { clients: DbClient[]; defaultClientId?: string }) {
  const [state, action, pending] = useActionState(createProjectAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.projectId) {
      router.push(`/admin/projects/${state.projectId}`);
    }
  }, [state, router]);

  return (
    <form action={action} className="border border-[#e5e7eb] rounded-xl bg-white p-6 space-y-4">
      {state?.error && <p className="text-[12.5px] text-red-600">{state.error}</p>}

      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-[#374151]">Client *</label>
        <select name="clientId" defaultValue={defaultClientId ?? ""} required className="w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] bg-white outline-none focus:border-[#111111] transition-colors">
          <option value="" disabled>Select a client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-[#374151]">Project Title *</label>
        <input name="title" required placeholder="e.g. Q3 Outbound Campaign" className="w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors" />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-medium text-[#374151]">Description</label>
        <textarea name="description" rows={3} placeholder="What is this project about?" className="w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] resize-none transition-colors" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-[#374151]">Status</label>
          <select name="status" defaultValue="Pending" className="w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-[#111111] transition-colors">
            <option>Pending</option>
            <option>Planning</option>
            <option>Active</option>
            <option>Review</option>
            <option>Waiting On Client</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-[#374151]">Priority</label>
          <select name="priority" defaultValue="Medium" className="w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-[#111111] transition-colors">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-[#374151]">Deadline *</label>
          <input name="deadline" type="date" required className="w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] outline-none focus:border-[#111111] transition-colors" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[12.5px] font-medium text-[#374151]">Assigned Agent</label>
          <select name="agent" defaultValue="Claude CEO" className="w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] bg-white outline-none focus:border-[#111111] transition-colors">
            <option>Claude CEO</option>
            <option>Claude CMO</option>
            <option>Claude CFO</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => history.back()} className="px-4 py-2.5 text-[13px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors">Cancel</button>
        <button type="submit" disabled={pending} className="flex-1 px-4 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
          {pending ? "Creating…" : "Create Project"}
        </button>
      </div>
    </form>
  );
}
