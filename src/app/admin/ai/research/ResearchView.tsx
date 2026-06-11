"use client";

import { useState, useActionState, useTransition } from "react";
import { Search, Loader2, ChevronDown, ChevronUp, User, Building2, FileText } from "lucide-react";
import { researchProspectAction, researchAccountAction, summarizeDiscoveryAction } from "@/lib/ai-actions";
import type { DbResearchReport } from "@/lib/db-types";

type Props = { reports: DbResearchReport[] };

const TABS = ["Prospect Research", "Account Research", "Discovery Summary"] as const;
type Tab = typeof TABS[number];

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function MarkdownBlock({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="text-[13px] text-[#374151] leading-relaxed space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <h3 key={i} className="text-[13px] font-semibold text-[#111111] mt-4 first:mt-0">{line.slice(3)}</h3>;
        if (line.startsWith("# "))  return <h2 key={i} className="text-[14px] font-bold text-[#111111] mt-4 first:mt-0">{line.slice(2)}</h2>;
        if (line.startsWith("- "))  return <p key={i} className="pl-3 text-[12.5px] text-[#6b7280]">• {line.slice(2)}</p>;
        if (!line.trim())            return <div key={i} className="h-1" />;
        return <p key={i} className="text-[12.5px] text-[#6b7280]">{line}</p>;
      })}
    </div>
  );
}

function ReportCard({ report }: { report: DbResearchReport }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-[#fafafa] transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
          {report.report_type === "prospect" ? <User size={14} className="text-[#6b7280]" /> :
           report.report_type === "account"  ? <Building2 size={14} className="text-[#6b7280]" /> :
                                               <FileText size={14} className="text-[#6b7280]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#111111] truncate">{report.subject_name}</p>
          <p className="text-[11.5px] text-[#9ca3af] capitalize">
            {report.report_type} research · {relativeTime(report.created_at)}
            {report.tokens_input ? ` · ${(report.tokens_input + (report.tokens_output ?? 0)).toLocaleString()} tokens` : ""}
          </p>
        </div>
        {open ? <ChevronUp size={14} className="text-[#9ca3af] shrink-0" /> : <ChevronDown size={14} className="text-[#9ca3af] shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-[#f3f4f6]">
          <MarkdownBlock content={report.report_markdown} />
        </div>
      )}
    </div>
  );
}

function ProspectForm() {
  const [state, action, pending] = useActionState(researchProspectAction, null);
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Name *</label>
          <input name="name" required placeholder="Jane Smith"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Title</label>
          <input name="title" placeholder="VP of Sales"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Company</label>
          <input name="company" placeholder="Acme Corp"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Industry</label>
          <input name="industry" placeholder="SaaS / Fintech"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white" />
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#374151] mb-1">Additional Notes</label>
        <textarea name="notes" rows={2} placeholder="Any LinkedIn info, mutual connections, recent news..."
          className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white resize-none" />
      </div>
      {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
      {state?.reportId && <p className="text-[12px] text-emerald-600">Report generated successfully.</p>}
      <button type="submit" disabled={pending}
        className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
        {pending ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
        Generate Report
      </button>
    </form>
  );
}

function AccountForm() {
  const [state, action, pending] = useActionState(researchAccountAction, null);
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Company *</label>
          <input name="company" required placeholder="Acme Corp"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Industry</label>
          <input name="industry" placeholder="SaaS / B2B Tech"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Website</label>
          <input name="website" placeholder="acmecorp.com"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Size</label>
          <input name="size" placeholder="200-500 employees"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white" />
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#374151] mb-1">Additional Notes</label>
        <textarea name="notes" rows={2} placeholder="Recent news, funding, competitors..."
          className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white resize-none" />
      </div>
      {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
      {state?.reportId && <p className="text-[12px] text-emerald-600">Report generated successfully.</p>}
      <button type="submit" disabled={pending}
        className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
        {pending ? <Loader2 size={13} className="animate-spin" /> : <Building2 size={13} />}
        Generate Report
      </button>
    </form>
  );
}

function DiscoveryForm() {
  const [state, action, pending] = useActionState(summarizeDiscoveryAction, null);
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Contact Name</label>
          <input name="contact" placeholder="Jane Smith"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#374151] mb-1">Company</label>
          <input name="company" placeholder="Acme Corp"
            className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white" />
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-medium text-[#374151] mb-1">Call Notes *</label>
        <textarea name="notes" required rows={8} placeholder="Paste your raw call notes here — bullet points, paragraphs, anything..."
          className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[12.5px] text-[#374151] outline-none focus:border-[#111111] transition-colors bg-white resize-none font-mono" />
      </div>
      {state?.error && <p className="text-[12px] text-red-600">{state.error}</p>}
      {state?.reportId && <p className="text-[12px] text-emerald-600">Summary generated successfully.</p>}
      <button type="submit" disabled={pending}
        className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
        {pending ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
        Summarize Notes
      </button>
    </form>
  );
}

export function ResearchView({ reports }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Prospect Research");

  const typeMap: Record<Tab, string> = {
    "Prospect Research": "prospect",
    "Account Research":  "account",
    "Discovery Summary": "discovery",
  };
  const filteredReports = reports.filter(r => r.report_type === typeMap[activeTab]);

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Search size={16} className="text-[#111111]" />
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Research</h1>
        </div>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">Generate AI-powered research reports. All outputs are saved for future reference.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border border-[#e5e7eb] rounded-lg p-1 bg-[#f3f4f6] w-fit mb-8">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-[12.5px] font-medium transition-colors ${
              activeTab === tab ? "bg-white text-[#111111] shadow-sm" : "text-[#6b7280] hover:text-[#374151]"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_1.4fr] gap-8">
        {/* Form */}
        <div className="border border-[#e5e7eb] rounded-xl bg-white p-6">
          <p className="text-[12px] font-semibold text-[#374151] mb-4">{activeTab}</p>
          {activeTab === "Prospect Research" && <ProspectForm />}
          {activeTab === "Account Research"  && <AccountForm />}
          {activeTab === "Discovery Summary" && <DiscoveryForm />}
        </div>

        {/* Reports */}
        <div>
          <p className="text-[12px] font-semibold text-[#374151] mb-4">
            {filteredReports.length > 0 ? `${filteredReports.length} saved reports` : "No reports yet"}
          </p>
          <div className="space-y-3">
            {filteredReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
            {filteredReports.length === 0 && (
              <div className="border border-dashed border-[#e5e7eb] rounded-xl px-6 py-12 text-center">
                <Search size={24} className="text-[#d1d5db] mx-auto mb-3" />
                <p className="text-[13px] text-[#9ca3af]">No {activeTab.toLowerCase()} reports yet.</p>
                <p className="text-[12px] text-[#9ca3af] mt-1">Generate your first report using the form.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
