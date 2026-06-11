"use client";

import { useState, useActionState, useTransition } from "react";
import { Plus, Search, Edit2, Archive, RotateCcw, ChevronRight } from "lucide-react";
import { createSopAction, updateSopAction, setSopStatusAction } from "@/lib/sop-actions";
import type { DbSop } from "@/lib/db-types";

type Props = { sops: DbSop[] };

const SOP_CATEGORIES = ["Sales", "Onboarding", "Legal", "Finance", "Support", "Operations", "AI", "Technical", "Other"];

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

function CreateModal({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState(createSopAction, null);
  if (state?.success) { onClose(); return null; }
  return (
    <Modal title="New SOP" onClose={onClose}>
      <form action={action} className="p-5 space-y-4">
        {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Title *</label>
          <input name="title" placeholder="e.g. Client Onboarding Checklist" required
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Category *</label>
          <select name="category" required
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]">
            {SOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Content</label>
          <textarea name="content" rows={8} placeholder="Describe the standard operating procedure..."
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af] resize-none font-mono" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={pending}
            className="flex-1 bg-[#111111] text-white text-[13px] font-medium py-2 rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50">
            {pending ? "Saving…" : "Create SOP"}
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

function EditModal({ sop, onClose }: { sop: DbSop; onClose: () => void }) {
  const boundAction = updateSopAction.bind(null, sop.id);
  const [state, action, pending] = useActionState(boundAction, null);
  if (state?.success) { onClose(); return null; }
  return (
    <Modal title="Edit SOP" onClose={onClose}>
      <form action={action} className="p-5 space-y-4">
        {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Title *</label>
          <input name="title" defaultValue={sop.title} required
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Category *</label>
          <select name="category" defaultValue={sop.category} required
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]">
            {SOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Content</label>
          <textarea name="content" rows={8} defaultValue={sop.content ?? ""}
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af] resize-none font-mono" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={pending}
            className="flex-1 bg-[#111111] text-white text-[13px] font-medium py-2 rounded-lg hover:bg-[#222] transition-colors disabled:opacity-50">
            {pending ? "Saving…" : "Save Changes"}
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

function ViewModal({ sop, onClose, onEdit }: { sop: DbSop; onClose: () => void; onEdit: () => void }) {
  return (
    <Modal title={sop.title} onClose={onClose}>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-medium text-[#6b7280] bg-[#f3f4f6] border border-[#e5e7eb] px-2 py-0.5 rounded-full">
            {sop.category}
          </span>
          <span className="text-[11px] text-[#9ca3af]">v{sop.version}</span>
          {sop.status !== "Active" && (
            <span className="text-[11px] font-medium text-[#9ca3af] bg-[#f3f4f6] border border-[#e5e7eb] px-2 py-0.5 rounded-full">
              Archived
            </span>
          )}
        </div>
        {sop.content ? (
          <pre className="text-[12.5px] text-[#374151] whitespace-pre-wrap font-sans leading-relaxed bg-[#fafafa] border border-[#e5e7eb] rounded-lg p-4 max-h-80 overflow-y-auto">
            {sop.content}
          </pre>
        ) : (
          <p className="text-[13px] text-[#9ca3af]">No content yet.</p>
        )}
        <div className="flex gap-2 mt-4">
          <button onClick={onEdit}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#111111] bg-[#f3f4f6] border border-[#e5e7eb] px-3 py-1.5 rounded-lg hover:bg-[#e5e7eb]">
            <Edit2 size={12} /> Edit
          </button>
          <button onClick={onClose} className="px-3 py-1.5 text-[13px] text-[#6b7280] border border-[#e5e7eb] rounded-lg hover:bg-[#f3f4f6]">
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function SopsView({ sops }: Props) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<DbSop | null>(null);
  const [viewing, setViewing] = useState<DbSop | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [, startTransition] = useTransition();

  const categories = ["All", ...Array.from(new Set(sops.map(s => s.category))).sort()];

  const filtered = sops.filter(s => {
    if (!showArchived && s.status !== "Active") return false;
    if (catFilter !== "All" && s.category !== catFilter) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const byCategory = filtered.reduce<Record<string, DbSop[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  function toggleArchive(sop: DbSop) {
    startTransition(async () => {
      await setSopStatusAction(sop.id, sop.status === "Active" ? "Archived" : "Active");
    });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      {editing && <EditModal sop={editing} onClose={() => setEditing(null)} />}
      {viewing && !editing && (
        <ViewModal
          sop={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => { setEditing(viewing); setViewing(null); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111111] tracking-tight">SOPs</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Standard operating procedures for your agency</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 bg-[#111111] text-white text-[13px] font-medium px-3.5 py-2 rounded-lg hover:bg-[#222] transition-colors"
        >
          <Plus size={13} /> New SOP
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search SOPs…"
            className="w-full border border-[#e5e7eb] rounded-lg pl-8 pr-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]"
          />
        </div>
        <div className="flex gap-1">
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
        <label className="flex items-center gap-1.5 text-[12.5px] text-[#6b7280] cursor-pointer ml-auto">
          <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} className="rounded" />
          Show archived
        </label>
      </div>

      {/* Content */}
      {Object.keys(byCategory).length === 0 ? (
        <div className="text-center py-12 text-[#9ca3af]">
          <p className="text-[14px]">{sops.length === 0 ? "No SOPs yet. Create your first one." : "No SOPs match your filters."}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-[11.5px] font-semibold uppercase tracking-widest text-[#9ca3af] px-1 mb-2">{cat}</h2>
              <div className="bg-white border border-[#e5e7eb] rounded-xl divide-y divide-[#f3f4f6]">
                {items.map(sop => (
                  <div key={sop.id} className="flex items-center gap-3 px-5 py-3.5 group">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => setViewing(sop)}
                        className="text-[13px] font-medium text-[#111111] hover:underline text-left truncate"
                      >
                        {sop.title}
                      </button>
                      <p className="text-[11.5px] text-[#9ca3af]">v{sop.version} · {sop.status !== "Active" ? "Archived" : "Active"}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(sop)} className="p-1.5 text-[#9ca3af] hover:text-[#111111] rounded">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => toggleArchive(sop)} className="p-1.5 text-[#9ca3af] hover:text-[#111111] rounded" title={sop.status === "Active" ? "Archive" : "Restore"}>
                        {sop.status === "Active" ? <Archive size={13} /> : <RotateCcw size={13} />}
                      </button>
                    </div>
                    <button onClick={() => setViewing(sop)} className="text-[#9ca3af] hover:text-[#111111]">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
