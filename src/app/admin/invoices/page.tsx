import { Receipt, TrendingUp } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { getInvoices } from "@/lib/queries";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const paid    = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Invoices</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{invoices.length} invoices · last 2 billing cycles</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#9ca3af] bg-[#fafafa] border border-[#e5e7eb] rounded-lg px-3 py-2">
          <Receipt size={13} />
          Stripe billing coming in Phase 4
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border border-emerald-100 rounded-xl p-4 bg-emerald-50">
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-emerald-600 mb-2">Collected</p>
          <p className="text-[24px] font-bold text-emerald-800 tracking-tight">${paid.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={11} className="text-emerald-500" />
            <p className="text-[11.5px] text-emerald-600">{invoices.filter((i) => i.status === "Paid").length} invoices paid</p>
          </div>
        </div>
        <div className="border border-amber-100 rounded-xl p-4 bg-amber-50">
          <p className="text-[10.5px] font-semibold uppercase tracking-widest text-amber-600 mb-2">Pending</p>
          <p className="text-[24px] font-bold text-amber-800 tracking-tight">${pending.toLocaleString()}</p>
          <p className="text-[11.5px] text-amber-600 mt-1">{invoices.filter((i) => i.status === "Pending").length} awaiting payment</p>
        </div>
        <div className={`border rounded-xl p-4 ${overdue > 0 ? "border-red-100 bg-red-50" : "border-[#e5e7eb] bg-[#fafafa]"}`}>
          <p className={`text-[10.5px] font-semibold uppercase tracking-widest mb-2 ${overdue > 0 ? "text-red-600" : "text-[#9ca3af]"}`}>Overdue</p>
          <p className={`text-[24px] font-bold tracking-tight ${overdue > 0 ? "text-red-800" : "text-[#d1d5db]"}`}>${overdue.toLocaleString()}</p>
          <p className={`text-[11.5px] mt-1 ${overdue > 0 ? "text-red-600" : "text-[#9ca3af]"}`}>
            {invoices.filter((i) => i.status === "Overdue").length} overdue
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Invoice", "Client", "Tier", "Amount", "Status", "Issue Date", "Due Date", "Paid Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3.5 text-[12.5px] font-mono text-[#6b7280]">{inv.invoice_number}</td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-[#111111]">{inv.client_name}</td>
                <td className="px-4 py-3.5"><Badge label={inv.tier} /></td>
                <td className="px-4 py-3.5 text-[13px] font-semibold text-[#111111]">${inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3.5"><Badge label={inv.status} /></td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{inv.issue_date}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{inv.due_date}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{inv.paid_date ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border border-[#e5e7eb] rounded-xl p-6 bg-[#fafafa]">
        <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-2">Phase 4 Roadmap</p>
        <p className="text-[13.5px] font-medium text-[#374151] mb-1">Automated billing and Stripe integration</p>
        <p className="text-[13px] text-[#9ca3af] leading-relaxed">
          Future phases will include Stripe-connected billing, automatic invoice generation on each billing cycle, payment tracking, and overdue reminders sent to clients automatically.
        </p>
      </div>
    </div>
  );
}
