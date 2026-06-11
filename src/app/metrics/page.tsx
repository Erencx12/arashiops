import { TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/dashboard/Badge";
import { getClients, getMrrHistory, getSalesFunnel, getInvoices } from "@/lib/queries";

export const metadata = { title: "Metrics" };

function BarChart({ data }: { data: { month_label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-[100px] w-full">
      {data.map((d) => (
        <div key={d.month_label} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-[#9ca3af] font-medium">
            ${(d.value / 1000).toFixed(0)}k
          </span>
          <div className="w-full flex items-end" style={{ height: "72px" }}>
            <div
              className="w-full bg-[#111111] rounded-sm"
              style={{ height: `${Math.max((d.value / max) * 72, 4)}px` }}
            />
          </div>
          <span className="text-[10px] text-[#9ca3af]">{d.month_label}</span>
        </div>
      ))}
    </div>
  );
}

export default async function MetricsPage() {
  const [clients, mrrHistory, salesFunnel, invoices] = await Promise.all([
    getClients(),
    getMrrHistory(),
    getSalesFunnel(),
    getInvoices(),
  ]);

  const mrr = clients.reduce((s, c) => s + c.monthly_value, 0);
  const arr = mrr * 12;
  const activeClients = clients.filter((c) => c.status === "Active").length;
  const avgHealth = Math.round(clients.reduce((s, c) => s + c.health_score, 0) / (clients.length || 1));

  const collectedThisMonth = invoices
    .filter((i) => i.status === "Paid" && i.issue_date.startsWith("Jun"))
    .reduce((s, i) => s + i.amount, 0);

  const tierDist = (["Enterprise", "Gold", "Silver"] as const).map((tier) => {
    const group = clients.filter((c) => c.tier === tier);
    return {
      tier,
      count: group.length,
      value: group.reduce((s, c) => s + c.monthly_value, 0),
    };
  });

  const discovery = salesFunnel.find((s) => s.stage === "Discovery Calls");
  const won       = salesFunnel.find((s) => s.stage === "Deals Won");
  const closeRate = discovery && won && discovery.count > 0
    ? Math.round((won.count / discovery.count) * 100)
    : 0;

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Metrics</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5">Business intelligence · {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="MRR"            value={`$${mrr.toLocaleString()}`}           change="+8.3% MoM" trend="up" />
        <StatCard label="ARR"            value={`$${(arr / 1000).toFixed(0)}k`}       change="Annualised" trend="neutral" />
        <StatCard label="Active Clients" value={String(activeClients)}                change={`${clients.length} total`} trend="neutral" />
        <StatCard label="Revenue Growth" value="8.3%"                                  change={`vs prev month`} trend="up" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Retention"          value="94%"                                             change="Rolling 6 months" trend="up" />
        <StatCard label="Churn Rate"         value="0%"                                              change="No churns this period" trend="up" />
        <StatCard label="Avg Contract Value" value={`$${activeClients ? Math.round(mrr / activeClients).toLocaleString() : 0}`} change="Per active client" trend="neutral" />
        <StatCard label="Lead Close Rate"    value={`${closeRate}%`}                                 change="Deals won / calls" trend="up" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 mb-6">

        {/* MRR Trend */}
        <div className="border border-[#e5e7eb] rounded-xl p-6 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">MRR Trend</p>
              <p className="text-[22px] font-bold text-[#111111] tracking-tight">${mrr.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-1 text-[12px] text-emerald-600">
              <TrendingUp size={13} />
              +129% since Jan
            </div>
          </div>
          {mrrHistory.length > 0 ? <BarChart data={mrrHistory} /> : (
            <div className="h-[100px] flex items-center justify-center text-[12px] text-[#9ca3af]">No data yet.</div>
          )}
        </div>

        {/* Tier distribution */}
        <div className="border border-[#e5e7eb] rounded-xl p-6 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-5">Revenue by Tier</p>
          <div className="space-y-4">
            {tierDist.map((t) => (
              <div key={t.tier}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge label={t.tier} />
                    <span className="text-[12px] text-[#6b7280]">{t.count} client{t.count !== 1 ? "s" : ""}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#111111]">${t.value.toLocaleString()}/mo</span>
                </div>
                <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#111111] rounded-full"
                    style={{ width: mrr > 0 ? `${Math.round((t.value / mrr) * 100)}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-[#f3f4f6]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#9ca3af]">Total MRR</span>
              <span className="text-[14px] font-bold text-[#111111]">${mrr.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Sales funnel */}
        <div className="border border-[#e5e7eb] rounded-xl p-6 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-5">Sales Funnel</p>
          <div className="space-y-3">
            {salesFunnel.map((s, i) => {
              const pct = i === 0 ? 100 : discovery && discovery.count > 0
                ? Math.round((s.count / discovery.count) * 100)
                : 0;
              const change = s.count - s.prev_count;
              return (
                <div key={s.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-[#374151]">{s.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium flex items-center gap-0.5 ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {change >= 0 ? "+" : ""}{change}
                      </span>
                      <span className="text-[13px] font-semibold text-[#111111] w-5 text-right">{s.count}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: i === 0 ? "#111111" : i === 1 ? "#374151" : i === 2 ? "#10b981" : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-5 border-t border-[#f3f4f6] flex items-center justify-between">
            <span className="text-[12px] text-[#9ca3af]">Close rate</span>
            <span className="text-[14px] font-bold text-emerald-600">{closeRate}%</span>
          </div>
        </div>

        {/* Client health */}
        <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
          <div className="px-6 py-5 border-b border-[#e5e7eb]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca3af]">Client Health Overview</p>
          </div>
          <div className="divide-y divide-[#f3f4f6]">
            {clients.map((c) => (
              <div key={c.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-[#374151]">{c.company_name[0]}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#111111]">{c.company_name}</p>
                    <p className="text-[11px] text-[#9ca3af]">{c.tier} · {c.renewal_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-[60px] h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.health_score >= 80 ? "bg-emerald-500" : c.health_score >= 60 ? "bg-amber-400" : "bg-red-400"}`}
                      style={{ width: `${c.health_score}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-medium text-[#374151] w-6">{c.health_score}</span>
                  <span className="text-[12px] text-[#9ca3af] w-16 text-right">${c.monthly_value.toLocaleString()}/mo</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3.5 border-t border-[#f3f4f6] bg-[#fafafa] flex items-center justify-between">
            <span className="text-[12px] text-[#9ca3af]">Avg health score</span>
            <span className="text-[13px] font-semibold text-[#111111]">{avgHealth} / 100</span>
          </div>
        </div>
      </div>

      {/* Renewal forecast */}
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
        <div className="px-6 py-4 border-b border-[#e5e7eb] bg-[#fafafa]">
          <p className="text-[13px] font-semibold text-[#111111]">Renewal Forecast</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Client", "Tier", "Status", "Health", "Monthly Value", "Renewal Date", "Risk"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {clients.map((c) => {
              const risk = c.health_score >= 80 ? "Low" : c.health_score >= 65 ? "Medium" : "High";
              const riskClass = risk === "Low" ? "text-emerald-600" : risk === "Medium" ? "text-amber-600" : "text-red-600";
              return (
                <tr key={c.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3.5 text-[13px] font-medium text-[#111111]">{c.company_name}</td>
                  <td className="px-4 py-3.5"><Badge label={c.tier} /></td>
                  <td className="px-4 py-3.5"><Badge label={c.status} /></td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[12.5px] font-medium ${c.health_score >= 80 ? "text-emerald-600" : c.health_score >= 65 ? "text-amber-600" : "text-red-500"}`}>
                      {c.health_score}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] font-medium text-[#111111]">${c.monthly_value.toLocaleString()}/mo</td>
                  <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{c.renewal_date}</td>
                  <td className="px-4 py-3.5 text-[12.5px] font-medium">
                    <span className={riskClass}>{risk}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
