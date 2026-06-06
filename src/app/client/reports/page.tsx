import { BarChart2, TrendingUp, TrendingDown } from "lucide-react";

export const metadata = { title: "Reports" };

const kpis = [
  { label: "Qualified Meetings / mo",    before: "4",    after: "28",  trend: "up" as const },
  { label: "Pipeline Value",             before: "$45K", after: "$280K", trend: "up" as const },
  { label: "Email Response Rate",        before: "3%",   after: "14%", trend: "up" as const },
  { label: "LinkedIn Acceptance Rate",   before: "18%",  after: "34%", trend: "up" as const },
];

const weeklyData = [
  { week: "Wk 1", meetings: 4,  emails: 120, replies: 14 },
  { week: "Wk 2", meetings: 7,  emails: 160, replies: 22 },
  { week: "Wk 3", meetings: 9,  emails: 180, replies: 28 },
  { week: "Wk 4", meetings: 8,  emails: 175, replies: 25 },
];

const reports = [
  { title: "May 2026 Performance Report",   date: "Jun 1, 2026",  type: "Monthly",   status: "Delivered" },
  { title: "Campaign Analysis — Q2 Start",  date: "May 15, 2026", type: "Campaign",  status: "Delivered" },
  { title: "ICP Validation Report",         date: "Mar 10, 2026", type: "Strategy",  status: "Delivered" },
];

export default function ReportsPage() {
  const maxMeetings = Math.max(...weeklyData.map(d => d.meetings));

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Reports</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">Performance since engagement start · Feb 2026</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} className="border border-[#e5e7eb] rounded-xl p-5 bg-white">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-3">{k.label}</p>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="text-[13px] text-[#9ca3af] line-through">{k.before}</span>
              <span className="text-[26px] font-bold text-[#111111] tracking-tight leading-none">{k.after}</span>
            </div>
            <div className="flex items-center gap-1">
              {k.trend === "up"
                ? <TrendingUp size={11} className="text-emerald-500" />
                : <TrendingDown size={11} className="text-red-500" />
              }
              <span className={`text-[11.5px] ${k.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                vs. baseline
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly meetings chart */}
        <div className="border border-[#e5e7eb] rounded-xl p-6 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-5">
            Qualified Meetings — Last 4 Weeks
          </p>
          <div className="flex items-end gap-4 h-[80px]">
            {weeklyData.map((d) => (
              <div key={d.week} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[11px] text-[#6b7280] font-medium">{d.meetings}</span>
                <div
                  className="w-full bg-[#111111] rounded-sm"
                  style={{ height: `${Math.max((d.meetings / maxMeetings) * 56, 4)}px` }}
                />
                <span className="text-[10px] text-[#9ca3af]">{d.week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outreach table */}
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
          <div className="px-5 py-4 border-b border-[#e5e7eb]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">
              Weekly Outreach Breakdown
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
                {["Week","Emails Sent","Replies","Meetings"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {weeklyData.map((d) => (
                <tr key={d.week} className="hover:bg-[#fafafa]">
                  <td className="px-4 py-3 text-[13px] font-medium text-[#374151]">{d.week}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7280]">{d.emails}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6b7280]">{d.replies}</td>
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
        <div className="divide-y divide-[#f3f4f6]">
          {reports.map((r) => (
            <div key={r.title} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-[#111111]">{r.title}</p>
                <p className="text-[12px] text-[#9ca3af]">{r.type} · {r.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11.5px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
