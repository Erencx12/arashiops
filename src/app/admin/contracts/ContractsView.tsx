"use client";

import { useState, useTransition } from "react";
import { Plus, FileCheck } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbClient, DbContract, ContractStatus } from "@/lib/db-types";
import { createContractAction, updateContractStatusAction } from "@/lib/payment-actions";
import { useActionState } from "react";

const STATUSES: ContractStatus[] = ["Draft", "Sent", "Pending Signature", "Signed", "Active", "Expired", "Cancelled"];

const inputCls = "w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors";
const labelCls = "block text-[12.5px] font-medium text-[#374151] mb-1.5";

type Props = { contracts: DbContract[]; clients: DbClient[] };

export function ContractsView({ contracts, clients }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formState, formAction, formPending] = useActionState(createContractAction, null);

  const totalValue = contracts.reduce((s, c) => s + c.monthly_value, 0);
  const active = contracts.filter((c) => c.status === "Active").length;

  function handleStatus(id: number, status: string) {
    startTransition(async () => { await updateContractStatusAction(id, status); });
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Contracts</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{active} active · ${totalValue.toLocaleString()}/mo combined</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          <Plus size={13} /> New Contract
        </button>
      </div>

      {/* New contract form */}
      {showForm && (
        <form action={formAction} className="border border-[#e5e7eb] rounded-xl bg-white p-6 mb-6 space-y-5">
          {formState?.error && <p className="text-[12.5px] text-red-600">{formState.error}</p>}
          {formState?.success && (
            <p className="text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">
              Contract created. <button type="button" onClick={() => setShowForm(false)} className="underline">Close</button>
            </p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Client *</label>
              <select name="clientId" required className={`${inputCls} bg-white`}>
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Contract Type *</label>
              <select name="type" defaultValue="Retainer" className={`${inputCls} bg-white`}>
                <option>Retainer</option>
                <option>Project</option>
                <option>One-time</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Tier *</label>
              <select name="tier" defaultValue="Gold" className={`${inputCls} bg-white`}>
                <option>Silver</option>
                <option>Gold</option>
                <option>Platinum</option>
                <option>Enterprise</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Monthly Value ($) *</label>
              <input name="monthlyValue" type="number" min="0" required placeholder="4500" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select name="status" defaultValue="Draft" className={`${inputCls} bg-white`}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Start Date *</label>
              <input name="startDate" type="date" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date *</label>
              <input name="endDate" type="date" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Signed Date</label>
              <input name="signedDate" type="date" className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2.5 text-[13px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={formPending}
              className="flex-1 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
              {formPending ? "Creating…" : "Create Contract"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Contract #", "Client", "Type", "Tier", "Status", "Signed", "Start", "End", "Monthly"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {contracts.map((c) => (
              <tr key={c.id} className="hover:bg-[#fafafa] transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#f3f4f6] flex items-center justify-center shrink-0">
                      <FileCheck size={12} className="text-[#6b7280]" />
                    </div>
                    <span className="text-[12px] font-mono text-[#6b7280]">{c.contract_number ?? `CTR-${c.id}`}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-[#111111]">{c.client_name}</td>
                <td className="px-4 py-3.5 text-[13px] text-[#6b7280]">{c.type}</td>
                <td className="px-4 py-3.5"><Badge label={c.tier} /></td>
                <td className="px-4 py-3.5">
                  <select
                    value={c.status}
                    onChange={(e) => handleStatus(c.id, e.target.value)}
                    disabled={isPending}
                    className="text-[12px] border border-[#e5e7eb] rounded-md px-2 py-1 bg-white outline-none cursor-pointer hover:border-[#111111] transition-colors"
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{c.signed_date ?? "—"}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{c.start_date}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{c.end_date}</td>
                <td className="px-4 py-3.5 text-[13px] font-semibold text-[#111111]">${c.monthly_value.toLocaleString()}/mo</td>
              </tr>
            ))}
            {contracts.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-[#9ca3af]">No contracts yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
