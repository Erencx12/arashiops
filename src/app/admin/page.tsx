import Link from "next/link";
import { ArrowRight, CheckSquare, Users, FolderKanban, Video, Activity, Plug, CheckCircle2, XCircle, AlertCircle, Mail, Search, BarChart2 } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/dashboard/Badge";
import {
  getDashboardStats,
  getClients,
  getProjects,
  getApprovals,
  getInvoices,
  getRecentActivity,
  getInfrastructureHealth,
  getEmailStats,
  getApolloLeadCount,
  getInstantlyStats,
  getCrmStats,
  getSyncStats,
} from "@/lib/queries";

export const metadata = { title: "Overview" };

const activityIcons: Record<string, React.ReactNode> = {
  approval: <CheckSquare size={12} className="text-[#6b7280]" />,
  agent:    <Activity size={12} className="text-[#6b7280]" />,
  meeting:  <Video size={12} className="text-[#6b7280]" />,
  client:   <Users size={12} className="text-[#6b7280]" />,
  project:  <FolderKanban size={12} className="text-[#6b7280]" />,
  upload:   <FolderKanban size={12} className="text-[#6b7280]" />,
};

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function AdminOverview() {
  const [stats, clients, projects, approvals, invoices, activity, infraHealth, emailStats, apolloLeadCount, instantlyStats, crmStats, syncStats] = await Promise.all([
    getDashboardStats(),
    getClients(),
    getProjects(),
    getApprovals(),
    getInvoices(),
    getRecentActivity(6),
    getInfrastructureHealth(),
    getEmailStats(),
    getApolloLeadCount(),
    getInstantlyStats(),
    getCrmStats(),
    getSyncStats(),
  ]);

  const overdue = invoices.filter((i) => i.status === "Overdue");
  const pending = approvals.filter((a) => a.status === "Pending");
  const activeOrReview = projects.filter((p) => p.status === "Active" || p.status === "Review").slice(0, 5);

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Overview</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">Arashi OPS OS · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          Add Client
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Stats row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Monthly Revenue"   value={`$${stats.mrr.toLocaleString()}`}        change="+8.3% vs last month" trend="up" />
        <StatCard label="Active Clients"    value={String(stats.activeClients)}              change={`${stats.totalClients} total`} trend="neutral" />
        <StatCard label="Pending Approvals" value={String(stats.pendingApprovals)}           change="Needs review" trend="neutral" />
        <StatCard label="Active Projects"   value={String(stats.activeProjects)}             change="2 due this week" trend="neutral" />
      </div>

      {/* Stats row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="ARR"               value={`$${(stats.mrr * 12).toLocaleString()}`} change="Annualised" trend="neutral" />
        <StatCard label="Avg Health Score"  value={String(stats.avgHealth)}                 change="+4 pts this month" trend="up" />
        <StatCard label="Upcoming Meetings" value={String(stats.upcomingMeetings)}           change="Next 7 days" trend="neutral" />
        <StatCard label="Client Retention"  value="94%"                                      change="Rolling 6 months" trend="up" />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">

        {/* Left col */}
        <div className="space-y-6">

          {/* Active projects */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#111111]">Active Projects</p>
              <Link href="/admin/projects" className="text-[12px] text-[#6b7280] hover:text-[#111111] transition-colors">
                View all
              </Link>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {activeOrReview.map((p) => (
                <div key={p.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111111] truncate">{p.title}</p>
                    <p className="text-[11.5px] text-[#9ca3af]">{p.client_name} · {p.agent}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-[80px]">
                      <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div className="h-full bg-[#111111] rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <p className="text-[10px] text-[#9ca3af] mt-0.5 text-right">{p.progress}%</p>
                    </div>
                    <Badge label={p.status} />
                  </div>
                </div>
              ))}
              {activeOrReview.length === 0 && (
                <div className="px-5 py-8 text-center text-[13px] text-[#9ca3af]">No active projects.</div>
              )}
            </div>
          </div>

          {/* Clients table */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#111111]">Clients</p>
              <Link href="/admin/clients" className="text-[12px] text-[#6b7280] hover:text-[#111111] transition-colors">
                View all
              </Link>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {clients.map((c) => (
                <div key={c.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-semibold text-[#374151]">{c.company_name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#111111] truncate">{c.company_name}</p>
                    <p className="text-[11.5px] text-[#9ca3af]">{c.industry}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge label={c.tier} />
                    <Badge label={c.status} />
                    <span className="text-[12.5px] font-medium text-[#374151] w-16 text-right">
                      ${c.monthly_value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-6">

          {/* Pending approvals */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#111111]">Pending Approvals</p>
              <Link href="/admin/approvals" className="text-[12px] text-[#6b7280] hover:text-[#111111] transition-colors">
                Review
              </Link>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {pending.map((a) => (
                <div key={a.id} className="px-5 py-3.5">
                  <p className="text-[12.5px] font-medium text-[#111111] leading-snug">{a.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] text-[#9ca3af]">{a.client_name}</span>
                    <span className="text-[#e5e7eb]">·</span>
                    <span className="text-[11px] text-[#9ca3af]">{a.type}</span>
                  </div>
                </div>
              ))}
              {pending.length === 0 && (
                <div className="px-5 py-6 text-center text-[12.5px] text-[#9ca3af]">All caught up.</div>
              )}
            </div>
          </div>

          {/* Overdue invoices */}
          {overdue.length > 0 && (
            <div className="border border-red-100 rounded-xl overflow-hidden bg-white">
              <div className="px-5 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-red-700">Overdue Invoices</p>
                <Link href="/admin/invoices" className="text-[12px] text-red-500 hover:text-red-700 transition-colors">
                  View
                </Link>
              </div>
              <div className="divide-y divide-[#f3f4f6]">
                {overdue.map((inv) => (
                  <div key={inv.id} className="px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[12.5px] font-medium text-[#111111]">{inv.client_name}</p>
                      <p className="text-[11px] text-[#9ca3af]">{inv.invoice_number} · Due {inv.due_date}</p>
                    </div>
                    <span className="text-[13px] font-semibold text-red-600">${inv.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integration Health */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plug size={13} className="text-[#9ca3af]" />
                <p className="text-[13px] font-semibold text-[#111111]">Integration Health</p>
              </div>
              <Link href="/admin/integrations" className="text-[12px] text-[#6b7280] hover:text-[#111111] transition-colors">
                Manage
              </Link>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-[12.5px] text-[#6b7280]">Connected</span>
                <div className="flex items-center gap-1.5">
                  {infraHealth.connectedIntegrations > 0
                    ? <CheckCircle2 size={12} className="text-emerald-500" />
                    : <XCircle size={12} className="text-[#d1d5db]" />}
                  <span className="text-[12.5px] font-medium text-[#374151]">{infraHealth.connectedIntegrations}/{infraHealth.totalIntegrations}</span>
                </div>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Mail size={11} className="text-[#9ca3af]" />
                  <span className="text-[12.5px] text-[#6b7280]">Email</span>
                </div>
                <span className="text-[12.5px] font-medium text-[#374151]">{emailStats.sent} sent · {emailStats.failed} failed</span>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Search size={11} className="text-[#9ca3af]" />
                  <span className="text-[12.5px] text-[#6b7280]">Apollo Leads</span>
                </div>
                <span className="text-[12.5px] font-medium text-[#374151]">{apolloLeadCount.toLocaleString()}</span>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Activity size={11} className="text-[#9ca3af]" />
                  <span className="text-[12.5px] text-[#6b7280]">Campaigns</span>
                </div>
                <span className="text-[12.5px] font-medium text-[#374151]">{instantlyStats.campaigns} · {instantlyStats.totalSent.toLocaleString()} sent</span>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BarChart2 size={11} className="text-[#9ca3af]" />
                  <span className="text-[12.5px] text-[#6b7280]">CRM Records</span>
                </div>
                <span className="text-[12.5px] font-medium text-[#374151]">{crmStats.totalContacts} contacts · {crmStats.totalDeals} deals</span>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-[12.5px] text-[#6b7280]">Syncs Today</span>
                <div className="flex items-center gap-1.5">
                  {syncStats.failed > 0 && <AlertCircle size={12} className="text-amber-500" />}
                  <span className={`text-[12.5px] font-medium ${syncStats.failed > 0 ? "text-amber-600" : "text-[#374151]"}`}>
                    {syncStats.today} · {syncStats.failed} failed
                  </span>
                </div>
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <span className="text-[12.5px] text-[#6b7280]">Failed Jobs</span>
                <div className="flex items-center gap-1.5">
                  {infraHealth.failedJobs > 0 && <AlertCircle size={12} className="text-red-500" />}
                  <span className={`text-[12.5px] font-medium ${infraHealth.failedJobs > 0 ? "text-red-600" : "text-[#374151]"}`}>
                    {infraHealth.failedJobs}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <p className="text-[13px] font-semibold text-[#111111]">Recent Activity</p>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {activity.map((a) => (
                <div key={a.id} className="px-5 py-3 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#f3f4f6] flex items-center justify-center mt-0.5 shrink-0">
                    {activityIcons[a.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#374151] leading-snug">{a.description}</p>
                    <p className="text-[11px] text-[#9ca3af] mt-0.5">{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
