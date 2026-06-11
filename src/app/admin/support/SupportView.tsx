"use client";

import { useState, useActionState, useTransition } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { createTicketAction, updateTicketStatusAction, resolveTicketAction } from "@/lib/support-actions";
import type { DbSupportTicket, DbClient } from "@/lib/db-types";

type Props = { tickets: DbSupportTicket[]; clients: DbClient[] };

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "text-red-700 bg-red-50 border-red-100",
  High:     "text-orange-700 bg-orange-50 border-orange-100",
  Medium:   "text-amber-700 bg-amber-50 border-amber-100",
  Low:      "text-[#6b7280] bg-[#f3f4f6] border-[#e5e7eb]",
};

const STATUS_COLORS: Record<string, string> = {
  "Open":        "text-blue-700 bg-blue-50 border-blue-100",
  "In Progress": "text-violet-700 bg-violet-50 border-violet-100",
  "Resolved":    "text-emerald-700 bg-emerald-50 border-emerald-100",
  "Closed":      "text-[#9ca3af] bg-[#f3f4f6] border-[#e5e7eb]",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white border border-[#e5e7eb] rounded-xl w-full max-w-lg shadow-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-[14px] font-semibold text-[#111111]">{title}</h2>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#111111] text-lg leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreateModal({ clients, onClose }: { clients: DbClient[]; onClose: () => void }) {
  const [state, action, pending] = useActionState(createTicketAction, null);
  if (state?.success) { onClose(); return null; }
  return (
    <Modal title="New Support Ticket" onClose={onClose}>
      <form action={action} className="p-5 space-y-4">
        {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Title *</label>
          <input name="title" placeholder="Brief description of the issue" required
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Priority</label>
            <select name="priority" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]">
              <option>Medium</option><option>Low</option><option>High</option><option>Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Client</label>
            <select name="clientId" className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]">
              <option value="">— None —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Description</label>
          <textarea name="description" rows={4} placeholder="Detailed description…"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af] resize-none" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={pending}
            className="flex-1 bg-[#111111] text-white text-[13px] font-medium py-2 rounded-lg hover:bg-[#222] disabled:opacity-50">
            {pending ? "Creating…" : "Create Ticket"}
          </button>
          <button type="button" onClick={onClose}
            className="px-4 text-[13px] text-[#6b7280] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6]">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ResolveModal({ ticket, onClose }: { ticket: DbSupportTicket; onClose: () => void }) {
  const [state, action, pending] = useActionState(resolveTicketAction, null);
  if (state?.success) { onClose(); return null; }
  return (
    <Modal title="Resolve Ticket" onClose={onClose}>
      <form action={action} className="p-5 space-y-4">
        <input type="hidden" name="id" value={ticket.id} />
        <p className="text-[13px] text-[#6b7280]">{ticket.title}</p>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Resolution Notes</label>
          <textarea name="notes" rows={4} placeholder="Describe how this was resolved…"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af] resize-none" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={pending}
            className="flex-1 bg-emerald-600 text-white text-[13px] font-medium py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
            {pending ? "Resolving…" : "Mark Resolved"}
          </button>
          <button type="button" onClick={onClose}
            className="px-4 text-[13px] text-[#6b7280] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6]">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function SupportView({ tickets, clients }: Props) {
  const [filter, setFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [resolving, setResolving] = useState<DbSupportTicket | null>(null);
  const [, startTransition] = useTransition();

  const filters = ["All", "Open", "In Progress", "Resolved", "Closed"];
  const filtered = filter === "All" ? tickets : tickets.filter(t => t.status === filter);

  const stats = {
    open:       tickets.filter(t => t.status === "Open").length,
    inProgress: tickets.filter(t => t.status === "In Progress").length,
    resolved:   tickets.filter(t => t.status === "Resolved").length,
    critical:   tickets.filter(t => t.priority === "Critical" && t.status !== "Resolved" && t.status !== "Closed").length,
  };

  function setStatus(ticket: DbSupportTicket, status: string) {
    startTransition(async () => {
      await updateTicketStatusAction(ticket.id, status);
    });
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {showCreate && <CreateModal clients={clients} onClose={() => setShowCreate(false)} />}
      {resolving && <ResolveModal ticket={resolving} onClose={() => setResolving(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111111] tracking-tight">Support</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Track and resolve client support requests</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-[#111111] text-white text-[13px] font-medium px-3.5 py-2 rounded-lg hover:bg-[#222]"
        >
          <Plus size={13} /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: "Open",        value: stats.open,       color: "text-blue-600" },
          { label: "In Progress", value: stats.inProgress, color: "text-violet-600" },
          { label: "Resolved",    value: stats.resolved,   color: "text-emerald-600" },
          { label: "Critical",    value: stats.critical,   color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-xl px-5 py-4">
            <p className="text-[11.5px] text-[#9ca3af] font-medium mb-1">{s.label}</p>
            <p className={`text-[26px] font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-4">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
              filter === f ? "bg-[#111111] text-white" : "bg-white text-[#6b7280] border border-[#e5e7eb] hover:bg-[#f3f4f6]"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-[12.5px] text-[#9ca3af] self-center">{filtered.length} ticket{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl">
        <div className="grid grid-cols-[1fr_120px_100px_120px_80px_100px] gap-3 px-5 py-3 border-b border-[#e5e7eb] text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">
          <span>Title</span><span>Client</span><span>Priority</span><span>Status</span><span>Age</span><span>Actions</span>
        </div>
        {filtered.length === 0 ? (
          <p className="text-[13px] text-[#9ca3af] text-center py-10">No tickets found.</p>
        ) : (
          filtered.map(t => (
            <div key={t.id} className="grid grid-cols-[1fr_120px_100px_120px_80px_100px] gap-3 items-center px-5 py-3.5 border-b border-[#f3f4f6] last:border-0">
              <div>
                <p className="text-[13px] font-medium text-[#111111] truncate">{t.title}</p>
                {t.description && (
                  <p className="text-[11.5px] text-[#9ca3af] truncate">{t.description}</p>
                )}
              </div>
              <span className="text-[12px] text-[#6b7280] truncate">{t.client_name ?? "—"}</span>
              <span className={`inline-flex items-center text-[11px] font-medium border px-2 py-0.5 rounded-full ${PRIORITY_COLORS[t.priority] ?? ""}`}>
                {t.priority}
              </span>
              <span className={`inline-flex items-center text-[11px] font-medium border px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status] ?? ""}`}>
                {t.status}
              </span>
              <span className="text-[12px] text-[#9ca3af]">{timeAgo(t.created_at)}</span>
              <div className="flex gap-1">
                {t.status === "Open" && (
                  <button
                    onClick={() => setStatus(t, "In Progress")}
                    className="text-[11px] text-violet-600 hover:underline"
                  >
                    Start
                  </button>
                )}
                {(t.status === "Open" || t.status === "In Progress") && (
                  <button
                    onClick={() => setResolving(t)}
                    className="text-[11px] text-emerald-600 hover:underline"
                  >
                    Resolve
                  </button>
                )}
                {t.status === "Resolved" && (
                  <button
                    onClick={() => setStatus(t, "Closed")}
                    className="text-[11px] text-[#9ca3af] hover:underline"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
