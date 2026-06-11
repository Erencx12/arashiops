"use client";

import { useState, useActionState, useTransition } from "react";
import { BookOpen, Plus, Pencil, Trash2, CheckCircle2, X, Loader2, Lock } from "lucide-react";
import { createAiPromptAction, updateAiPromptAction, deleteAiPromptAction } from "@/lib/ai-actions";
import type { DbAiPrompt } from "@/lib/db-types";

type Props = { prompts: DbAiPrompt[] };

const CATEGORIES = ["lead_scoring", "research", "analysis", "classification"] as const;
const CATEGORY_LABELS: Record<string, string> = {
  lead_scoring:   "Lead Scoring",
  research:       "Research",
  analysis:       "Analysis",
  classification: "Classification",
};

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CreateForm({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState(createAiPromptAction, null);
  return (
    <div className="border border-[#e5e7eb] rounded-xl bg-white p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] font-semibold text-[#111111]">New Prompt</p>
        <button onClick={onClose} className="text-[#9ca3af] hover:text-[#111111] transition-colors">
          <X size={14} />
        </button>
      </div>
      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Name *</label>
            <input name="name" required placeholder="e.g. Lead Qualification v2"
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-[#111111] bg-white transition-colors" />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#374151] mb-1">Category *</label>
            <select name="category" required
              className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-[#111111] bg-white transition-colors">
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Description</label>
          <input name="description" placeholder="What does this prompt do?"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-[#111111] bg-white transition-colors" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">System Prompt *</label>
          <textarea name="prompt" required rows={8} placeholder="You are a..."
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-[#111111] bg-white transition-colors resize-none font-mono" />
        </div>
        {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
        {state?.success && <p className="text-[12px] text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> Prompt created.</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending}
            className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
            {pending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Create Prompt
          </button>
          <button type="button" onClick={onClose} className="text-[12.5px] text-[#6b7280] hover:text-[#111111] transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function EditForm({ prompt, onClose }: { prompt: DbAiPrompt; onClose: () => void }) {
  const [name, setName] = useState(prompt.name);
  const [desc, setDesc] = useState(prompt.description ?? "");
  const [text, setText] = useState(prompt.prompt);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateAiPromptAction(prompt.id, { name, description: desc || null, prompt: text });
      setSaved(true);
      setTimeout(onClose, 800);
    });
  }

  return (
    <div className="border border-[#111111] rounded-xl bg-white p-5 mt-2">
      <div className="space-y-3">
        <div>
          <label className="block text-[11.5px] font-medium text-[#374151] mb-1">Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-[#111111] bg-white transition-colors" />
        </div>
        <div>
          <label className="block text-[11.5px] font-medium text-[#374151] mb-1">Description</label>
          <input value={desc} onChange={e => setDesc(e.target.value)}
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-[#111111] bg-white transition-colors" />
        </div>
        <div>
          <label className="block text-[11.5px] font-medium text-[#374151] mb-1">System Prompt</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={10}
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-[#111111] bg-white transition-colors resize-none font-mono" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={isPending}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#111111] text-white text-[12px] font-medium rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
            {saved ? <CheckCircle2 size={12} /> : isPending ? <Loader2 size={12} className="animate-spin" /> : null}
            {saved ? "Saved" : "Save Changes"}
          </button>
          <button onClick={onClose} className="text-[12px] text-[#6b7280] hover:text-[#111111] transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function PromptCard({ prompt }: { prompt: DbAiPrompt }) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${prompt.name}"? This cannot be undone.`)) return;
    startTransition(async () => { await deleteAiPromptAction(prompt.id); });
  }

  function handleToggle() {
    startTransition(async () => { await updateAiPromptAction(prompt.id, { isActive: !prompt.is_active }); });
  }

  return (
    <div className={`border rounded-xl bg-white overflow-hidden transition-opacity ${!prompt.is_active ? "opacity-60" : ""}`}
      style={{ borderColor: prompt.is_default ? "#111111" : "#e5e7eb" }}>
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[13px] font-semibold text-[#111111]">{prompt.name}</p>
              {prompt.is_default && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#6b7280] bg-[#f3f4f6] px-1.5 py-0.5 rounded">
                  <Lock size={9} /> Default
                </span>
              )}
              <span className="text-[10px] font-medium text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-0.5 rounded capitalize">
                {CATEGORY_LABELS[prompt.category] ?? prompt.category}
              </span>
              {!prompt.is_active && (
                <span className="text-[10px] font-medium text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-0.5 rounded">Disabled</span>
              )}
            </div>
            {prompt.description && (
              <p className="text-[12px] text-[#6b7280]">{prompt.description}</p>
            )}
            <p className="text-[11px] text-[#9ca3af] mt-0.5">v{prompt.version} · updated {relativeTime(prompt.updated_at)}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setExpanded(e => !e)}
              className="px-2 py-1.5 text-[11px] text-[#9ca3af] hover:text-[#374151] transition-colors">
              {expanded ? "Hide" : "View"}
            </button>
            <button onClick={() => setEditing(e => !e)}
              className="p-1.5 text-[#9ca3af] hover:text-[#374151] transition-colors">
              <Pencil size={13} />
            </button>
            {!prompt.is_default && (
              <>
                <button onClick={handleToggle} disabled={isPending}
                  className="px-2 py-1.5 text-[11px] text-[#9ca3af] hover:text-[#374151] disabled:opacity-50 transition-colors">
                  {prompt.is_active ? "Disable" : "Enable"}
                </button>
                <button onClick={handleDelete} disabled={isPending}
                  className="p-1.5 text-[#9ca3af] hover:text-red-600 disabled:opacity-50 transition-colors">
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        </div>
        {expanded && (
          <pre className="mt-3 px-3 py-3 bg-[#f3f4f6] rounded-lg text-[11px] text-[#374151] whitespace-pre-wrap font-mono leading-relaxed border border-[#e5e7eb] max-h-[300px] overflow-y-auto">
            {prompt.prompt}
          </pre>
        )}
      </div>
      {editing && <div className="px-5 pb-5"><EditForm prompt={prompt} onClose={() => setEditing(false)} /></div>}
    </div>
  );
}

export function PromptsView({ prompts }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");

  const filtered = prompts.filter(p => filterCat === "all" || p.category === filterCat);

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-[#111111]" />
            <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">AI Prompts</h1>
          </div>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">System prompts used by Claude for each task. Default prompts are locked; you can create custom alternatives.</p>
        </div>
        <button onClick={() => setShowCreate(s => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors">
          <Plus size={13} />
          New Prompt
        </button>
      </div>

      {showCreate && <CreateForm onClose={() => setShowCreate(false)} />}

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-6">
        {[["all", "All"], ...CATEGORIES.map(c => [c, CATEGORY_LABELS[c]])].map(([val, label]) => (
          <button key={val} onClick={() => setFilterCat(val)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              filterCat === val
                ? "bg-[#111111] text-white"
                : "border border-[#e5e7eb] text-[#6b7280] hover:text-[#111111] hover:border-[#111111]"
            }`}>
            {label}
          </button>
        ))}
        <span className="ml-2 text-[12px] text-[#9ca3af]">{filtered.length} prompts</span>
      </div>

      {/* Prompt cards */}
      <div className="space-y-3">
        {filtered.map(p => <PromptCard key={p.id} prompt={p} />)}
        {filtered.length === 0 && (
          <div className="border border-dashed border-[#e5e7eb] rounded-xl px-6 py-12 text-center">
            <BookOpen size={24} className="text-[#d1d5db] mx-auto mb-3" />
            <p className="text-[13px] text-[#9ca3af]">No prompts in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
