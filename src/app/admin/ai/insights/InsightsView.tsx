"use client";

import { useState, useTransition } from "react";
import { Lightbulb, Loader2, ChevronDown, ChevronUp, BarChart2, Users, Target } from "lucide-react";
import { analyzeCampaignAction, analyzeIcpAction, generateClientSummaryAction } from "@/lib/ai-actions";
import type { DbAiInsight, DbInstantlyCampaign, DbClient } from "@/lib/db-types";

type LeadStats = { total: number; hot: number; warm: number; unscored: number };
type Props = {
  insights: DbAiInsight[];
  campaigns: DbInstantlyCampaign[];
  clients: DbClient[];
  leadStats: LeadStats;
};

const TABS = ["Campaign Analysis", "ICP Profile", "Client Summaries"] as const;
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
    <div className="text-[13px] leading-relaxed space-y-1">
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

function InsightCard({ insight }: { insight: DbAiInsight }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-[#fafafa] transition-colors text-left">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#111111] truncate">{insight.title}</p>
          <p className="text-[11.5px] text-[#9ca3af]">
            {relativeTime(insight.created_at)}
            {insight.tokens_input ? ` · ${(insight.tokens_input + (insight.tokens_output ?? 0)).toLocaleString()} tokens` : ""}
          </p>
        </div>
        {open ? <ChevronUp size={14} className="text-[#9ca3af] shrink-0" /> : <ChevronDown size={14} className="text-[#9ca3af] shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-[#f3f4f6]">
          <MarkdownBlock content={insight.insight_markdown} />
        </div>
      )}
    </div>
  );
}

function CampaignPanel({ campaigns, insights }: { campaigns: DbInstantlyCampaign[]; insights: DbAiInsight[] }) {
  const [isPending, startTransition] = useTransition();
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  function handleAnalyze(campaign: DbInstantlyCampaign) {
    setActiveCampaignId(campaign.campaign_id);
    setStatusMsg(null);
    startTransition(async () => {
      const res = await analyzeCampaignAction(campaign.campaign_id, campaign.name);
      setActiveCampaignId(null);
      if (res.error) setStatusMsg(`Error: ${res.error}`);
      else setStatusMsg("Analysis generated.");
    });
  }

  const campaignInsights = insights.filter(i => i.insight_type === "campaign_analysis");

  return (
    <div className="grid grid-cols-[1fr_1.4fr] gap-8">
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f3f4f6] bg-[#fafafa]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">Campaigns</p>
        </div>
        {statusMsg && (
          <div className={`mx-4 mt-3 px-3 py-2 rounded-lg text-[12px] border ${statusMsg.startsWith("Error") ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
            {statusMsg}
          </div>
        )}
        {campaigns.length === 0 ? (
          <p className="px-5 py-8 text-[12.5px] text-[#9ca3af] text-center">No campaigns synced. Connect Instantly first.</p>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {campaigns.map(c => (
              <div key={c.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#111111] truncate">{c.name}</p>
                  <p className="text-[11.5px] text-[#9ca3af]">{c.sent} sent · {c.replied} replied · {c.meetings_booked} meetings</p>
                </div>
                <button
                  onClick={() => handleAnalyze(c)}
                  disabled={isPending && activeCampaignId === c.campaign_id}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#e5e7eb] rounded-lg text-[11.5px] font-medium text-[#6b7280] hover:text-[#111111] hover:border-[#111111] disabled:opacity-50 transition-colors shrink-0"
                >
                  {isPending && activeCampaignId === c.campaign_id ? <Loader2 size={11} className="animate-spin" /> : <BarChart2 size={11} />}
                  Analyze
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="text-[12px] font-semibold text-[#374151] mb-4">{campaignInsights.length > 0 ? `${campaignInsights.length} analyses` : "No analyses yet"}</p>
        <div className="space-y-3">
          {campaignInsights.map(i => <InsightCard key={i.id} insight={i} />)}
          {campaignInsights.length === 0 && (
            <div className="border border-dashed border-[#e5e7eb] rounded-xl px-6 py-12 text-center">
              <BarChart2 size={24} className="text-[#d1d5db] mx-auto mb-3" />
              <p className="text-[13px] text-[#9ca3af]">No campaign analyses yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IcpPanel({ leadStats, insights }: { leadStats: LeadStats; insights: DbAiInsight[] }) {
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const icpInsights = insights.filter(i => i.insight_type === "icp_analysis");
  const hasEnoughData = leadStats.hot + leadStats.warm >= 3;

  function handleAnalyze() {
    setStatusMsg(null);
    startTransition(async () => {
      const res = await analyzeIcpAction();
      if (res.error) setStatusMsg(`Error: ${res.error}`);
      else setStatusMsg("ICP analysis generated.");
    });
  }

  return (
    <div className="grid grid-cols-[1fr_1.4fr] gap-8">
      <div className="border border-[#e5e7eb] rounded-xl bg-white p-5">
        <p className="text-[12px] font-semibold text-[#374151] mb-4">Generate ICP Profile</p>
        <div className="space-y-2 mb-5">
          {[
            { label: "Hot Leads",  value: leadStats.hot,  color: "text-red-600" },
            { label: "Warm Leads", value: leadStats.warm, color: "text-amber-600" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-[12.5px] text-[#6b7280]">{item.label}</span>
              <span className={`text-[13px] font-semibold ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
        {!hasEnoughData && (
          <p className="text-[12px] text-amber-600 mb-4">Score at least 3 Hot/Warm leads first.</p>
        )}
        {statusMsg && (
          <p className={`text-[12px] mb-4 ${statusMsg.startsWith("Error") ? "text-red-600" : "text-emerald-600"}`}>{statusMsg}</p>
        )}
        <button onClick={handleAnalyze} disabled={isPending || !hasEnoughData}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#111111] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Target size={13} />}
          Generate ICP
        </button>
      </div>
      <div>
        <p className="text-[12px] font-semibold text-[#374151] mb-4">{icpInsights.length > 0 ? `${icpInsights.length} ICP profiles` : "No profiles yet"}</p>
        <div className="space-y-3">
          {icpInsights.map(i => <InsightCard key={i.id} insight={i} />)}
          {icpInsights.length === 0 && (
            <div className="border border-dashed border-[#e5e7eb] rounded-xl px-6 py-12 text-center">
              <Target size={24} className="text-[#d1d5db] mx-auto mb-3" />
              <p className="text-[13px] text-[#9ca3af]">No ICP profiles yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ClientSummaryPanel({ clients, insights }: { clients: DbClient[]; insights: DbAiInsight[] }) {
  const [isPending, startTransition] = useTransition();
  const [activeClientId, setActiveClientId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const clientInsights = insights.filter(i => i.insight_type === "client_summary");

  function handleSummarize(clientId: number) {
    setActiveClientId(clientId);
    setStatusMsg(null);
    startTransition(async () => {
      const res = await generateClientSummaryAction(clientId);
      setActiveClientId(null);
      if (res.error) setStatusMsg(`Error: ${res.error}`);
      else setStatusMsg("Summary generated.");
    });
  }

  return (
    <div className="grid grid-cols-[1fr_1.4fr] gap-8">
      <div className="border border-[#e5e7eb] rounded-xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-[#f3f4f6] bg-[#fafafa]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">Clients</p>
        </div>
        {statusMsg && (
          <div className={`mx-4 mt-3 px-3 py-2 rounded-lg text-[12px] border ${statusMsg.startsWith("Error") ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
            {statusMsg}
          </div>
        )}
        <div className="divide-y divide-[#f3f4f6]">
          {clients.filter(c => c.status === "Active").map(c => (
            <div key={c.id} className="px-5 py-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#111111] truncate">{c.company_name}</p>
                <p className="text-[11.5px] text-[#9ca3af]">{c.tier} · ${c.monthly_value.toLocaleString()}/mo</p>
              </div>
              <button
                onClick={() => handleSummarize(c.id)}
                disabled={isPending && activeClientId === c.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#e5e7eb] rounded-lg text-[11.5px] font-medium text-[#6b7280] hover:text-[#111111] hover:border-[#111111] disabled:opacity-50 transition-colors shrink-0"
              >
                {isPending && activeClientId === c.id ? <Loader2 size={11} className="animate-spin" /> : <Users size={11} />}
                Summarize
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[12px] font-semibold text-[#374151] mb-4">{clientInsights.length > 0 ? `${clientInsights.length} summaries` : "No summaries yet"}</p>
        <div className="space-y-3">
          {clientInsights.map(i => <InsightCard key={i.id} insight={i} />)}
          {clientInsights.length === 0 && (
            <div className="border border-dashed border-[#e5e7eb] rounded-xl px-6 py-12 text-center">
              <Users size={24} className="text-[#d1d5db] mx-auto mb-3" />
              <p className="text-[13px] text-[#9ca3af]">No client summaries yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InsightsView({ insights, campaigns, clients, leadStats }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Campaign Analysis");
  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={16} className="text-[#111111]" />
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Insights</h1>
        </div>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">AI-powered analysis of campaigns, leads, and client accounts. Claude recommends — you decide.</p>
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

      {activeTab === "Campaign Analysis" && <CampaignPanel campaigns={campaigns} insights={insights} />}
      {activeTab === "ICP Profile"       && <IcpPanel leadStats={leadStats} insights={insights} />}
      {activeTab === "Client Summaries"  && <ClientSummaryPanel clients={clients} insights={insights} />}
    </div>
  );
}
