"use client";

import { useState, useActionState, useTransition } from "react";
import { Plus, Edit2, Archive, RotateCcw } from "lucide-react";
import { createDocAction, updateDocAction, setDocStatusAction } from "@/lib/doc-actions";
import type { DbDocPage } from "@/lib/db-types";

type Props = { docs: DbDocPage[] };

const DOC_CATEGORIES = [
  "Deployment", "Technical", "Integrations", "Support",
  "Finance", "Operations", "Security", "Other"
];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white border border-[#e5e7eb] rounded-xl w-full max-w-2xl shadow-lg">
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
  const [state, action, pending] = useActionState(createDocAction, null);
  if (state?.success) { onClose(); return null; }
  return (
    <Modal title="New Document" onClose={onClose}>
      <form action={action} className="p-5 space-y-4">
        {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Title *</label>
            <input name="title" required placeholder="Document title"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Category *</label>
            <select name="category" required
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]">
              {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Content</label>
          <textarea name="content" rows={12} placeholder="Document content…"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af] resize-none font-mono" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={pending}
            className="flex-1 bg-[#111111] text-white text-[13px] font-medium py-2 rounded-lg hover:bg-[#222] disabled:opacity-50">
            {pending ? "Saving…" : "Create Doc"}
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

function EditModal({ doc, onClose }: { doc: DbDocPage; onClose: () => void }) {
  const boundAction = updateDocAction.bind(null, doc.id);
  const [state, action, pending] = useActionState(boundAction, null);
  if (state?.success) { onClose(); return null; }
  return (
    <Modal title="Edit Document" onClose={onClose}>
      <form action={action} className="p-5 space-y-4">
        {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Title *</label>
            <input name="title" defaultValue={doc.title} required
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Category *</label>
            <select name="category" defaultValue={doc.category} required
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af]">
              {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Content</label>
          <textarea name="content" rows={12} defaultValue={doc.content ?? ""}
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#9ca3af] resize-none font-mono" />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={pending}
            className="flex-1 bg-[#111111] text-white text-[13px] font-medium py-2 rounded-lg hover:bg-[#222] disabled:opacity-50">
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

export function DocsView({ docs }: Props) {
  const [selected, setSelected] = useState<DbDocPage | null>(docs[0] ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<DbDocPage | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [, startTransition] = useTransition();

  const visible = showArchived ? docs : docs.filter(d => d.status === "Active");
  const byCategory = visible.reduce<Record<string, DbDocPage[]>>((acc, d) => {
    (acc[d.category] ??= []).push(d);
    return acc;
  }, {});

  function toggleArchive(doc: DbDocPage) {
    startTransition(async () => {
      await setDocStatusAction(doc.id, doc.status === "Active" ? "Archived" : "Active");
    });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      {editing && <EditModal doc={editing} onClose={() => setEditing(null)} />}

      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-[#e5e7eb] bg-white flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e5e7eb]">
          <h1 className="text-[14px] font-semibold text-[#111111]">Docs</h1>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 text-[12px] text-[#6b7280] hover:text-[#111111] border border-[#e5e7eb] px-2 py-1 rounded-lg hover:bg-[#f3f4f6]">
            <Plus size={11} /> New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af] px-4 mb-1">{cat}</p>
              {items.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelected(doc)}
                  className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                    selected?.id === doc.id
                      ? "bg-[#f3f4f6] text-[#111111] font-medium"
                      : "text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111111]"
                  } ${doc.status !== "Active" ? "opacity-50" : ""}`}
                >
                  {doc.title}
                </button>
              ))}
            </div>
          ))}
          {visible.length === 0 && (
            <p className="text-[12.5px] text-[#9ca3af] px-4 py-2">No documents yet.</p>
          )}
        </div>
        <div className="px-4 py-3 border-t border-[#e5e7eb]">
          <label className="flex items-center gap-1.5 text-[12px] text-[#9ca3af] cursor-pointer">
            <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} className="rounded" />
            Show archived
          </label>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {selected ? (
          <div className="max-w-3xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-[20px] font-semibold text-[#111111]">{selected.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11.5px] text-[#9ca3af] bg-[#f3f4f6] border border-[#e5e7eb] px-2 py-0.5 rounded-full">
                    {selected.category}
                  </span>
                  {selected.created_by && (
                    <span className="text-[11.5px] text-[#9ca3af]">by {selected.created_by}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(selected)}
                  className="flex items-center gap-1.5 text-[12.5px] text-[#6b7280] border border-[#e5e7eb] px-3 py-1.5 rounded-lg hover:bg-[#f3f4f6]">
                  <Edit2 size={11} /> Edit
                </button>
                <button onClick={() => toggleArchive(selected)}
                  className="flex items-center gap-1.5 text-[12.5px] text-[#9ca3af] border border-[#e5e7eb] px-3 py-1.5 rounded-lg hover:bg-[#f3f4f6]">
                  {selected.status === "Active" ? <Archive size={11} /> : <RotateCcw size={11} />}
                  {selected.status === "Active" ? "Archive" : "Restore"}
                </button>
              </div>
            </div>
            {selected.content ? (
              <pre className="text-[13.5px] text-[#374151] whitespace-pre-wrap font-sans leading-7">
                {selected.content}
              </pre>
            ) : (
              <p className="text-[13px] text-[#9ca3af]">This document has no content yet.</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-[#9ca3af]">
            <p className="text-[13px]">Select a document from the sidebar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
