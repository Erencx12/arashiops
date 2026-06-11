import { verifyClientSession } from "@/lib/dal";
import { getLeadsByClient, getContentItemsByClient } from "@/lib/queries";
import { BarChart2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DbLead, DbContentItem } from "@/lib/db-types";

export const metadata = { title: "Reports — Arashi OPS" };

function computeKpis(leads: DbLead[]) {
  const total = leads.length;
  const meetingsBooked = leads.filter(l =>
    ["Meeting Booked", "Qualified", "Closed Won"].includes(l.status)
  ).length;
  const responded = leads.filter(l => l.status !== "Contacted").length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;
  const closedWon = leads.filter(l => l.status === "Closed Won").length;
  const pipelineValue = leads
    .filter(l => !["Closed Won", "Not Qualified"].includes(l.status))
    .reduce((sum, l) => {
      const v = l.estimated_value ? parseFloat(l.estimated_value.replace(/[^0-9.]/g, "")) : 0;
      return sum + (isNaN(v) ? 0 : v);
    }, 0);

  return { total, meetingsBooked, responseRate, closedWon, pipelineValue };
}

function getWeeklyData(leads: DbLead[]) {
  const now = new Date();
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { label: `Wk ${4 - i}`, start, end };
  }).reverse();

  return weeks.map(({ label, start, end }) => {
    const weekLeads = leads.filter(l => {
      const d = new Date(l.created_at);
      return d >= start && d <= end;
    });
    const meetings = weekLeads.filter(l =>
      ["Meeting Booked", "Qualified", "Closed Won"].includes(l.status)
    ).length;
    const responded = weekLeads.filter(l => l.status !== "Contacted").length;
    return { week: label, leads: weekLeads.length, meetings, responded };
  });
}

export default async function ReportsPage() {
  const session = await verifyClientSession();
  const [leads, contentItems] = await Promise.all([
    getLeadsByClient(session.clientId),
    getContentItemsByClient(session.clientId),
  ]);

  const kpis = computeKpis(leads);
  const weeklyData = getWeeklyData(leads);
  const reports = contentItems.filter(c => c.type === "Report");
  const maxLeads = Math.max(...weeklyData.map(d => d.leads), 1);

  const kpiCards = [
    {
      label: "Total Leads Generated",
      value: kpis.total.toString(),
      sub: `${kpis.closedWon} closed won`,
      trend: kpis.total > 0 ? "up" : "neutral",
    },
    {
      label: "Meetings Booked",
      value: kpis.meetingsBooked.toString(),
      sub: "qualified or booked",
      trend: kpis.meetingsBooked > 0 ? "up" : "neutral",
    },
    {
      label: "Response Rate",
      value: `${kpis.responseRate}%`,
      sub: "leads past contacted stage",
      trend: kpis.responseRate >= 20 ? "up" : kpis.responseRate > 0 ? "neutral" : "down",
    },
    {
      label: "Active Pipeline Value",
      value: kpis.pipelineValue > 0 ? `$${(kpis.pipelineValue / 1000).toFixed(0)}K` : "—",
      sub: "estimated deal value",
      trend: kpis.pipelineValue > 0 ? "up" : "neutral",
    },
  ] as const;

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Reports</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">
          Live performance data · {leads.length} lead{leads.length !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((k) => (
          <div key={k.label} className="border border-[#e5e7eb] rounded-xl p-5 bg-white">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">{k.label}</p>
            <p className="text-[26px] font-bold text-[#111111] tracking-tight leading-none mb-1.5">{k.value}</p>
            <div className="flex items-center gap-1">
              {k.trend === "up"
                ? <TrendingUp size={11} className="text-emerald-500" />
                : k.trend === "down"
                ? <TrendingDown size={11} className="text-red-500" />
                : <Minus size={11} className="text-[#9ca3af]" />
              }
              <span className={`text-[11.5px] ${k.trend === "up" ? "text-emerald-600" : k.trend === "down" ? "text-red-500" : "text-[#9ca3af]"}`}>
                {k.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly leads chart */}
        <div className="border border-[#e5e7eb] rounded-xl p-6 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-5">
            Leads Generated — Last 4 Weeks
          </p>
          {leads.length === 0 ? (
            <p className="text-[13px] text-[#9ca3af] text-center py-6">No lead data yet.</p>
          ) : (
            <div className="flex items-end gap-4 h-[80px]">
              {weeklyData.map((d) => (
                <div key={d.week} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[11px] text-[#6b7280] font-medium">{d.leads}</span>
                  <div
                    className="w-full bg-[#111111] rounded-sm"
                    style={{ height: `${Math.max((d.leads / maxLeads) * 56, d.leads > 0 ? 4 : 2)}px` }}
                  />
                  <span className="text-[10px] text-[#9ca3af]">{d.week}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly breakdown table */}
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
          <div className="px-5 py-4 border-b border-[#e5e7eb]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">
              Weekly Breakdown
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
                {["Week", "Leads", "Responded", "Meetings"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {weeklyData.map((d) => (
                <tr key={d.week} className="hover:bg-[#fafafa]">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#374151]">{d.week}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7280]">{d.leads}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7280]">{d.responded}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-[#111111]">{d.meetings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report archive */}
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
        <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center gap-2">
          <BarChart2 size={14} className="text-[#6b7280]" />
          <p className="text-[13px] font-semibold text-[#111111]">Report Archive</p>
        </div>
        {reports.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-[#9ca3af]">
            No reports delivered yet. Your first report will appear here.
          </div>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {reports.map((r) => (
              <div key={r.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#111111]">{r.title}</p>
                  <p className="text-[12px] text-[#9ca3af]">
                    Report · {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {r.tags.length > 0 && ` · ${r.tags.join(", ")}`}
                  </p>
                </div>
                <span className="text-[11.5px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
