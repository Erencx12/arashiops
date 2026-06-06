"use client";

import {
  BarChart2,
  Users,
  DollarSign,
  Zap,
  FileText,
  GitBranch,
  LayoutDashboard,
  CheckCircle2,
  Clock3,
  Circle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// SVG line chart data points (normalized to 60px height)
const chartPoints = [
  { x: 0, y: 52 },
  { x: 28, y: 44 },
  { x: 56, y: 48 },
  { x: 84, y: 28 },
  { x: 112, y: 34 },
  { x: 140, y: 16 },
  { x: 168, y: 10 },
  { x: 196, y: 4 },
];

const qualPoints = [
  { x: 0, y: 58 },
  { x: 28, y: 54 },
  { x: 56, y: 56 },
  { x: 84, y: 44 },
  { x: 112, y: 46 },
  { x: 140, y: 36 },
  { x: 168, y: 30 },
  { x: 196, y: 24 },
];

function toPolyline(pts: { x: number; y: number }[]) {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

function toFillPoly(pts: { x: number; y: number }[], height: number) {
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  return `${pts[0].x},${height} ${line} ${pts[pts.length - 1].x},${height}`;
}

const campaigns = [
  { name: "Q3 SaaS Outbound", status: "active", leads: 142, conv: "18%", trend: "up" },
  { name: "LinkedIn Decision Makers", status: "active", leads: 89, conv: "24%", trend: "up" },
  { name: "Email Re-engagement", status: "paused", leads: 34, conv: "11%", trend: "down" },
  { name: "Partner Referral Network", status: "active", leads: 67, conv: "31%", trend: "up" },
];

const pipeline = [
  { label: "Lead Capture", done: true },
  { label: "ICP Qualification", done: true },
  { label: "CRM Enrichment", done: true },
  { label: "Sales Handoff", done: false, current: true },
  { label: "Follow-up Sequence", done: false },
];

const recentActivity = [
  { msg: "New lead: Enterprise SaaS", time: "2m ago", type: "lead" },
  { msg: "Meeting confirmed: 14 Jan 2:00 PM", time: "18m ago", type: "meeting" },
  { msg: "Proposal sent to prospect", time: "1h ago", type: "proposal" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: BarChart2, label: "Campaigns", active: false },
  { icon: Users, label: "Leads", active: false },
  { icon: DollarSign, label: "Revenue", active: false },
  { icon: FileText, label: "Content", active: false },
  { icon: GitBranch, label: "Workflows", active: false },
];

export function DashboardMockup() {
  return (
    <div
      className="relative w-full max-w-[580px] rounded-xl border border-[#e5e7eb] bg-white overflow-hidden select-none"
      style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 16px 48px -8px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)" }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 h-10 border-b border-[#e5e7eb] bg-[#f9fafb]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#fca5a5]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#fcd34d]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#86efac]" />
        <div className="ml-3 flex-1 flex items-center">
          <div className="bg-white border border-[#e5e7eb] rounded px-3 py-0.5 text-[10px] text-[#9ca3af] font-medium w-[180px]">
            meridian.app/dashboard
          </div>
        </div>
      </div>

      <div className="flex" style={{ height: 430 }}>
        {/* Sidebar */}
        <div className="w-[152px] border-r border-[#e5e7eb] bg-[#fafafa] flex flex-col py-3 shrink-0">
          {/* Logo in sidebar */}
          <div className="flex items-center gap-1.5 px-3 mb-4">
            <div className="w-4 h-4 bg-[#111111] rounded-[3px] flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
                <path d="M3 12L8 4L13 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="5.5" y1="9" x2="10.5" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-[#111111]">Meridian</span>
          </div>

          <p className="text-[8.5px] font-semibold text-[#9ca3af] uppercase tracking-widest px-3 mb-1.5">
            Workspace
          </p>
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md mb-0.5 ${
                item.active
                  ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.07)] text-[#111111]"
                  : "text-[#9ca3af]"
              }`}
            >
              <item.icon size={11} strokeWidth={item.active ? 2.2 : 1.8} />
              <span className="text-[10.5px] font-medium">{item.label}</span>
            </div>
          ))}

          {/* Activity feed at bottom of sidebar */}
          <div className="mt-auto px-3 pt-3 border-t border-[#e5e7eb] mx-1">
            <p className="text-[8.5px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-2">
              Recent
            </p>
            {recentActivity.map((a) => (
              <div key={a.msg} className="mb-1.5">
                <p className="text-[9px] text-[#374151] leading-tight truncate">{a.msg}</p>
                <p className="text-[8.5px] text-[#9ca3af]">{a.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          {/* Metric cards */}
          <div className="grid grid-cols-4 border-b border-[#e5e7eb]">
            {[
              { icon: Users, label: "Leads", value: "1,284", delta: "+12%", up: true },
              { icon: DollarSign, label: "Revenue", value: "$84K", delta: "+28%", up: true },
              { icon: Zap, label: "Campaigns", value: "8", delta: "Active", up: true },
              { icon: TrendingUp, label: "Retention", value: "94%", delta: "+3%", up: true },
            ].map((m, i) => (
              <div
                key={m.label}
                className={`px-3 py-2.5 ${i < 3 ? "border-r border-[#e5e7eb]" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8.5px] text-[#9ca3af] font-medium uppercase tracking-wider">
                    {m.label}
                  </span>
                  <m.icon size={9} className="text-[#d1d5db]" />
                </div>
                <p className="text-[15px] font-bold text-[#111111] leading-none mb-0.5 tracking-tight">
                  {m.value}
                </p>
                <span className="inline-flex items-center gap-0.5 text-[8.5px] font-semibold text-emerald-600">
                  <TrendingUp size={8} />
                  {m.delta}
                </span>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left: chart + table */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-[#e5e7eb]">
              {/* Line chart */}
              <div className="px-3 pt-2.5 pb-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-semibold text-[#111111]">Lead Volume</p>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[8.5px] text-[#6b7280]">
                      <span className="w-2 h-[2px] bg-[#4f46e5] rounded inline-block" />
                      Total
                    </span>
                    <span className="flex items-center gap-1 text-[8.5px] text-[#6b7280]">
                      <span className="w-2 h-[2px] bg-emerald-400 rounded inline-block" />
                      Qualified
                    </span>
                  </div>
                </div>
                <svg
                  viewBox="0 0 196 62"
                  className="w-full"
                  style={{ height: 52 }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[0, 20, 40, 60].map((y) => (
                    <line key={y} x1="0" y1={y} x2="196" y2={y} stroke="#f3f4f6" strokeWidth="1" />
                  ))}
                  {/* Fill areas */}
                  <polygon points={toFillPoly(chartPoints, 62)} fill="url(#grad1)" />
                  <polygon points={toFillPoly(qualPoints, 62)} fill="url(#grad2)" />
                  {/* Lines */}
                  <polyline
                    points={toPolyline(chartPoints)}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={toPolyline(qualPoints)}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="3 2"
                  />
                  {/* Last point dot */}
                  <circle cx="196" cy="4" r="2.5" fill="#4f46e5" />
                  <circle cx="196" cy="24" r="2.5" fill="#34d399" />
                </svg>
                <div className="flex justify-between mt-0.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", ""].map((d, i) => (
                    <span key={i} className="text-[7.5px] text-[#9ca3af]">{d}</span>
                  ))}
                </div>
              </div>

              {/* Campaign table */}
              <div className="px-3 flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-semibold text-[#111111]">Campaigns</p>
                  <span className="text-[8.5px] text-[#9ca3af] bg-[#f3f4f6] px-1.5 py-0.5 rounded-full">
                    4 active
                  </span>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 pb-1 border-b border-[#f3f4f6] mb-1">
                  <span className="text-[8.5px] font-semibold text-[#9ca3af] uppercase tracking-wider">Name</span>
                  <span className="text-[8.5px] font-semibold text-[#9ca3af] uppercase tracking-wider">Leads</span>
                  <span className="text-[8.5px] font-semibold text-[#9ca3af] uppercase tracking-wider">Conv.</span>
                </div>

                {campaigns.map((c) => (
                  <div
                    key={c.name}
                    className="grid grid-cols-[1fr_auto_auto] gap-2 py-1.5 border-b border-[#f9fafb] last:border-0 items-center"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          c.status === "active" ? "bg-emerald-500" : "bg-[#d1d5db]"
                        }`}
                      />
                      <span className="text-[9.5px] text-[#374151] font-medium truncate">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-[#6b7280] text-right">{c.leads}</span>
                    <span
                      className={`text-[9.5px] font-semibold text-right ${
                        c.trend === "up" ? "text-emerald-600" : "text-[#9ca3af]"
                      }`}
                    >
                      {c.conv}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Pipeline + content */}
            <div className="w-[128px] px-3 pt-2.5 shrink-0 flex flex-col">
              <p className="text-[10px] font-semibold text-[#111111] mb-2">
                Pipeline
              </p>
              <div className="space-y-1.5 mb-4">
                {pipeline.map((step) => (
                  <div key={step.label} className="flex items-center gap-1.5">
                    {step.done ? (
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                    ) : step.current ? (
                      <Clock3 size={11} className="text-[#4f46e5] shrink-0" strokeWidth={2.5} />
                    ) : (
                      <Circle size={11} className="text-[#d1d5db] shrink-0" strokeWidth={2} />
                    )}
                    <span
                      className={`text-[9px] leading-tight ${
                        step.done
                          ? "text-[#9ca3af] line-through"
                          : step.current
                          ? "text-[#111111] font-semibold"
                          : "text-[#9ca3af]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e5e7eb] pt-2.5">
                <p className="text-[8.5px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
                  Content
                </p>
                {[
                  { label: "Case Study #4", tag: "Draft", color: "text-[#9ca3af] bg-[#f3f4f6]" },
                  { label: "LinkedIn Seq.", tag: "Review", color: "text-amber-600 bg-amber-50" },
                  { label: "Email Seq. #7", tag: "Live", color: "text-emerald-600 bg-emerald-50" },
                  { label: "Webinar Script", tag: "Live", color: "text-emerald-600 bg-emerald-50" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-1 border-b border-[#f9fafb] last:border-0"
                  >
                    <span className="text-[9px] text-[#374151] truncate max-w-[72px]">
                      {item.label}
                    </span>
                    <span className={`text-[7.5px] font-semibold px-1 py-0.5 rounded ${item.color}`}>
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mini revenue bar */}
              <div className="mt-auto pt-2.5 border-t border-[#e5e7eb]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[8.5px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                    MRR
                  </p>
                  <span className="text-[9px] font-bold text-[#111111]">$84K</span>
                </div>
                <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4f46e5] rounded-full" style={{ width: "78%" }} />
                </div>
                <p className="text-[8px] text-[#9ca3af] mt-0.5">78% of target</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
