import Link from "next/link";
import { CheckSquare, Package, ArrowRight, Activity } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import {
  getClientByName,
  getProjectsByClient,
  getApprovalsByClient,
  getContentItemsByClient,
  getRecentActivity,
} from "@/lib/queries";

export const metadata = { title: "Client Overview" };

// Demo client: Relay Software — swap when auth is wired
const DEMO_CLIENT = "Relay Software";

export default async function ClientOverview() {
  const client = await getClientByName(DEMO_CLIENT);

  if (!client) {
    return (
      <div className="px-8 py-8">
        <p className="text-[13px] text-[#9ca3af]">Client not found.</p>
      </div>
    );
  }

  const [projects, approvals, contentItems, activity] = await Promise.all([
    getProjectsByClient(client.id),
    getApprovalsByClient(client.id),
    getContentItemsByClient(client.id),
    getRecentActivity(5),
  ]);

  const pendingApprovals = approvals.filter((a) => a.status === "Pending");
  const recentFiles = contentItems.slice(0, 3);

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">
            Welcome back, {client.company_name}
          </h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">
            Your Meridian portal · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Badge label={client.tier} />
      </div>

      {/* Package card */}
      <div className="border border-[#e5e7eb] rounded-xl p-6 bg-white mb-6">
        <div className="grid md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#f3f4f6]">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1.5">Package</p>
            <p className="text-[15px] font-bold text-[#111111]">{client.tier} Engagement</p>
            <p className="text-[12px] text-[#9ca3af]">${client.monthly_value.toLocaleString()}/mo</p>
          </div>
          <div className="md:pl-6 pt-4 md:pt-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1.5">Engagement Lead</p>
            <p className="text-[14px] font-semibold text-[#111111]">{client.owner}</p>
            <p className="text-[12px] text-[#9ca3af]">yo.gamegenesis@gmail.com</p>
          </div>
          <div className="md:pl-6 pt-4 md:pt-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1.5">Start Date</p>
            <p className="text-[14px] font-semibold text-[#111111]">{client.start_date}</p>
            <p className="text-[12px] text-[#9ca3af]">Renewal: {client.renewal_date}</p>
          </div>
          <div className="md:pl-6 pt-4 md:pt-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1.5">Active Projects</p>
            <p className="text-[24px] font-bold text-[#111111] tracking-tight">
              {projects.filter((p) => p.status === "Active").length}
            </p>
            <p className="text-[12px] text-[#9ca3af]">{projects.length} total</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">

          {/* Projects */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <p className="text-[13px] font-semibold text-[#111111]">Your Projects</p>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {projects.map((p) => (
                <div key={p.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[13.5px] font-medium text-[#111111]">{p.title}</p>
                    <Badge label={p.status} />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-[12px] text-[#6b7280] shrink-0">{p.progress}%</span>
                    <span className="text-[11.5px] text-[#9ca3af] shrink-0">Due {p.deadline}</span>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="px-5 py-8 text-center text-[13px] text-[#9ca3af]">No active projects.</div>
              )}
            </div>
          </div>

          {/* Recent files */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
              <p className="text-[13px] font-semibold text-[#111111]">Recent Deliverables</p>
              <Link href="/client/deliverables" className="text-[12px] text-[#6b7280] hover:text-[#111111] transition-colors flex items-center gap-1">
                All <ArrowRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {recentFiles.map((f) => (
                <div key={f.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                      <Package size={12} className="text-[#6b7280]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#111111]">{f.title}</p>
                      <p className="text-[11px] text-[#9ca3af]">{f.type} · {f.created_at}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#9ca3af]">{f.size_label}</span>
                </div>
              ))}
              {recentFiles.length === 0 && (
                <div className="px-5 py-6 text-center text-[13px] text-[#9ca3af]">No deliverables yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">

          {/* Pending approvals */}
          {pendingApprovals.length > 0 && (
            <div className="border border-amber-100 rounded-xl overflow-hidden bg-amber-50">
              <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare size={14} className="text-amber-600" />
                  <p className="text-[13px] font-semibold text-amber-800">
                    {pendingApprovals.length} Awaiting Approval
                  </p>
                </div>
                <Link href="/client/approvals" className="text-[12px] text-amber-700 hover:text-amber-900 transition-colors">
                  Review
                </Link>
              </div>
              <div className="divide-y divide-amber-100">
                {pendingApprovals.map((a) => (
                  <div key={a.id} className="px-5 py-3.5">
                    <p className="text-[12.5px] font-medium text-amber-900 leading-snug">{a.title}</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">{a.type} · {a.created_at}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <p className="text-[13px] font-semibold text-[#111111]">Recent Activity</p>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {activity.map((a) => (
                <div key={a.id} className="px-5 py-3 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#f3f4f6] flex items-center justify-center mt-0.5 shrink-0">
                    <Activity size={10} className="text-[#6b7280]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#374151] leading-snug">{a.description}</p>
                    <p className="text-[11px] text-[#9ca3af] mt-0.5">{a.created_at}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade prompt */}
          {client.tier !== "Platinum" && (
            <div className="border border-[#e5e7eb] rounded-xl p-5 bg-white">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-2">
                Upgrade to Platinum
              </p>
              <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
                Unlock paid media management, a dedicated revenue dashboard, and executive reporting.
              </p>
              <Link
                href="/book"
                className="flex items-center justify-center gap-2 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
              >
                Talk to us
                <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
