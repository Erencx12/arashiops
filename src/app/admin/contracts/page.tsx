import { FileCheck } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import { getContracts } from "@/lib/queries";

export const metadata = { title: "Contracts" };

export default async function ContractsPage() {
  const contracts = await getContracts();
  const totalValue = contracts.reduce((s, c) => s + c.monthly_value, 0);
  const active     = contracts.filter((c) => c.status === "Active").length;

  return (
    <div className="px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Contracts</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{active} active · ${totalValue.toLocaleString()}/mo combined</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#9ca3af] bg-[#fafafa] border border-[#e5e7eb] rounded-lg px-3 py-2">
          <FileCheck size={13} />
          E-signature coming in Phase 4
        </div>
      </div>

      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Client", "Type", "Tier", "Status", "Signed", "Start Date", "End Date", "Monthly Value"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {contracts.map((c) => (
              <tr key={c.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3.5">
                  <p className="text-[13px] font-medium text-[#111111]">{c.client_name}</p>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{c.type}</td>
                <td className="px-4 py-3.5"><Badge label={c.tier} /></td>
                <td className="px-4 py-3.5"><Badge label={c.status} /></td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{c.signed_date ?? "—"}</td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{c.start_date}</td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{c.end_date}</td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-[#111111]">
                  ${c.monthly_value.toLocaleString()}/mo
                </td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[#9ca3af]">No contracts.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border border-[#e5e7eb] rounded-xl p-6 bg-[#fafafa]">
        <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-widest mb-2">Phase 4 Roadmap</p>
        <p className="text-[13.5px] font-medium text-[#374151] mb-1">Automated contract generation and e-signature</p>
        <p className="text-[13px] text-[#9ca3af] leading-relaxed">
          Future phases will include proposal-to-contract generation from templates, DocuSign / PandaDoc integration, and automated renewal workflows triggered by contract end dates.
        </p>
      </div>
    </div>
  );
}
