"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Mail, Phone, FolderKanban, Trash2, Plus, ExternalLink } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbClient, DbProject, DbClientNote, DbTask } from "@/lib/db-types";
import {
  updateClientTierAction, updateClientStatusAction,
  addClientNoteAction, deleteClientNoteAction,
} from "@/lib/client-actions";

type Props = {
  client: DbClient;
  projects: DbProject[];
  notes: DbClientNote[];
  tasks: DbTask[];
  clientId: number;
};

const TIERS = ["Silver", "Gold", "Enterprise"] as const;
const STATUSES = ["Active", "Review", "Paused", "Suspended", "Archived"] as const;

export function ClientDetail({ client, projects, notes, tasks, clientId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "tasks" | "notes" | "info">("projects");

  function handleTierChange(tier: string) {
    startTransition(async () => { await updateClientTierAction(clientId, tier); });
  }

  function handleStatusChange(status: string) {
    startTransition(async () => { await updateClientStatusAction(clientId, status); });
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    const content = noteText.trim();
    setNoteText("");
    startTransition(async () => { await addClientNoteAction(clientId, content, isInternal); });
  }

  function handleDeleteNote(noteId: number) {
    startTransition(async () => { await deleteClientNoteAction(noteId, clientId); });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      {/* Left: tabbed content */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[#e5e7eb]">
          {(["projects", "tasks", "notes", "info"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-[12.5px] font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-[#111111] text-[#111111]"
                  : "border-transparent text-[#6b7280] hover:text-[#111111]"
              }`}
            >
              {tab}
              {tab === "projects" && <span className="ml-1.5 text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{projects.length}</span>}
              {tab === "tasks" && <span className="ml-1.5 text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{tasks.length}</span>}
              {tab === "notes" && <span className="ml-1.5 text-[10px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full">{notes.length}</span>}
            </button>
          ))}
        </div>

        {/* Projects tab */}
        {activeTab === "projects" && (
          <div>
            <div className="px-5 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
              <p className="text-[12px] text-[#9ca3af]">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
              <Link
                href={`/admin/projects/new?clientId=${clientId}`}
                className="text-[12px] text-[#6b7280] hover:text-[#111111] flex items-center gap-1 transition-colors"
              >
                <Plus size={11} /> New
              </Link>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {projects.map((p) => (
                <Link key={p.id} href={`/admin/projects/${p.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fafafa] transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111111] truncate group-hover:text-[#111111]">{p.title}</p>
                    <p className="text-[11.5px] text-[#9ca3af]">{p.priority} priority · Due {p.deadline}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[60px]">
                      <div className="h-1 bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#111111] rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>
                    <Badge label={p.status} />
                    <ExternalLink size={11} className="text-[#d1d5db] group-hover:text-[#9ca3af]" />
                  </div>
                </Link>
              ))}
              {projects.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <FolderKanban size={20} className="text-[#d1d5db] mx-auto mb-2" />
                  <p className="text-[13px] text-[#9ca3af]">No projects yet.</p>
                  <Link href={`/admin/projects/new?clientId=${clientId}`} className="text-[12.5px] text-[#6b7280] hover:text-[#111111] mt-1 inline-block transition-colors">Create one →</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tasks tab */}
        {activeTab === "tasks" && (
          <div>
            <div className="px-5 py-3 border-b border-[#f3f4f6] flex items-center justify-between">
              <p className="text-[12px] text-[#9ca3af]">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</p>
              <Link
                href={`/admin/tasks?clientId=${clientId}`}
                className="text-[12px] text-[#6b7280] hover:text-[#111111] flex items-center gap-1 transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {tasks.slice(0, 8).map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    t.priority === "Critical" ? "bg-red-500" :
                    t.priority === "High" ? "bg-orange-400" :
                    t.priority === "Medium" ? "bg-amber-400" : "bg-[#d1d5db]"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111111] truncate">{t.title}</p>
                    <p className="text-[11.5px] text-[#9ca3af]">{t.due_date ? `Due ${t.due_date}` : "No deadline"}</p>
                  </div>
                  <Badge label={t.status} />
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-[13px] text-[#9ca3af]">No tasks for this client.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes tab */}
        {activeTab === "notes" && (
          <div>
            <div className="px-5 py-4 border-b border-[#f3f4f6]">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full text-[13px] text-[#111111] placeholder-[#9ca3af] border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 resize-none outline-none focus:border-[#111111] transition-colors"
              />
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="accent-[#111111]" />
                  <span className="text-[12px] text-[#6b7280]">Internal only</span>
                </label>
                <button
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || isPending}
                  className="px-3.5 py-1.5 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-40 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {notes.map((note) => (
                <div key={note.id} className="px-5 py-4 flex items-start gap-3 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-[#374151] leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-[#9ca3af]">{note.created_by}</span>
                      <span className="text-[#e5e7eb]">·</span>
                      {note.is_internal && (
                        <span className="text-[10px] font-medium text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-0.5 rounded">Internal</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    disabled={isPending}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#d1d5db] hover:text-red-500 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-[13px] text-[#9ca3af]">No notes yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info tab */}
        {activeTab === "info" && (
          <div className="px-5 py-5 space-y-4">
            {[
              { label: "Contact Name", value: client.contact_name },
              { label: "Email", value: client.email, icon: Mail },
              { label: "Industry", value: client.industry },
              { label: "Start Date", value: client.start_date },
              { label: "Renewal Date", value: client.renewal_date },
              { label: "Contract Status", value: client.contract_status ?? "—" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[#9ca3af] w-32 shrink-0">{row.label}</p>
                <p className="text-[13px] text-[#374151]">{row.value || "—"}</p>
              </div>
            ))}
            {client.internal_notes && (
              <div className="pt-3 border-t border-[#f3f4f6]">
                <p className="text-[11.5px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-2">Internal Notes</p>
                <p className="text-[13px] text-[#374151] leading-relaxed">{client.internal_notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="space-y-4">
        {/* Tier */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Change Tier</p>
          <div className="space-y-1.5">
            {TIERS.map((tier) => (
              <button
                key={tier}
                onClick={() => handleTierChange(tier)}
                disabled={isPending || client.tier === tier}
                className={`w-full text-left px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  client.tier === tier
                    ? "bg-[#111111] text-white"
                    : "text-[#374151] hover:bg-[#f3f4f6]"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Client Status</p>
          <div className="space-y-1.5">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isPending || client.status === status}
                className={`w-full text-left px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                  client.status === status
                    ? "bg-[#111111] text-white"
                    : status === "Archived" || status === "Suspended"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-[#374151] hover:bg-[#f3f4f6]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">Quick Links</p>
          <div className="space-y-1">
            {[
              { label: "Onboarding", href: `/admin/clients/${clientId}/onboarding` },
              { label: "New Project", href: `/admin/projects/new?clientId=${clientId}` },
              { label: "All Clients", href: "/admin/clients" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between px-3 py-2 rounded-md text-[13px] text-[#6b7280] hover:text-[#111111] hover:bg-[#f3f4f6] transition-colors"
              >
                {link.label}
                <ExternalLink size={11} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
