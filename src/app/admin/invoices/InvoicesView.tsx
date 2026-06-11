"use client";

import { useState, useTransition, useActionState } from "react";
import { Plus, TrendingUp, CreditCard, Printer } from "lucide-react";
import { Badge } from "@/components/dashboard/Badge";
import type { DbClient, DbInvoice, InvoiceStatus } from "@/lib/db-types";
import { createInvoiceAction, logPaymentAction, updateInvoiceStatusAction } from "@/lib/payment-actions";

const STATUSES: InvoiceStatus[] = ["Draft", "Sent", "Partially Paid", "Paid", "Overdue", "Cancelled"];

const inputCls = "w-full border border-[#e5e7eb] rounded-lg px-3.5 py-2.5 text-[13px] text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#111111] transition-colors";
const labelCls = "block text-[12.5px] font-medium text-[#374151] mb-1.5";

type Props = { invoices: DbInvoice[]; clients: DbClient[] };

type Modal = "invoice" | "payment" | null;

export function InvoicesView({ invoices, clients }: Props) {
  const [modal, setModal] = useState<Modal>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<DbInvoice | null>(null);
  const [isPending, startTransition] = useTransition();

  const [invoiceState, invoiceAction, invoicePending] = useActionState(createInvoiceAction, null);
  const [paymentState, paymentAction, paymentPending] = useActionState(logPaymentAction, null);

  const paid    = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === "Sent" || i.status === "Draft").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);

  function handleStatus(id: number, status: string) {
    startTransition(async () => { await updateInvoiceStatusAction(id, status); });
  }

  function openPayment(inv: DbInvoice) {
    setSelectedInvoice(inv);
    setModal("payment");
  }

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#111111]">Invoices</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">{invoices.length} invoices total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModal("invoice")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white text-[12.5px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
          >
            <Plus size={13} /> New Invoice
          </button>
          <button
            onClick={() => { setSelectedInvoice(null); setModal("payment"); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-medium text-[#374151] border border-[#e5e7eb] rounded-md hover:bg-[#f3f4f6] transition-colors"
          >
            <CreditCard size={13} /> Log Payment
          </button>
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
          <p className="text-[11.5px] text-amber-600 mt-1">{invoices.filter((i) => i.status === "Sent" || i.status === "Draft").length} awaiting payment</p>
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
      <div className="border border-[#e5e7eb] rounded-xl overflow-hidden bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e5e7eb] bg-[#fafafa]">
              {["Invoice", "Client", "Tier", "Amount", "Status", "Issued", "Due", "Paid", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-semibold uppercase tracking-widest text-[#9ca3af]">{h}</th>
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
                <td className="px-4 py-3.5">
                  <select
                    value={inv.status}
                    onChange={(e) => handleStatus(inv.id, e.target.value)}
                    disabled={isPending}
                    className="text-[12px] border border-[#e5e7eb] rounded-md px-2 py-1 bg-white outline-none cursor-pointer hover:border-[#111111] transition-colors"
                  >
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{inv.issue_date}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{inv.due_date}</td>
                <td className="px-4 py-3.5 text-[12.5px] text-[#6b7280]">{inv.paid_date ?? "—"}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <a
                      href={`/admin/invoices/${inv.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11.5px] text-[#6b7280] hover:text-[#111111] transition-colors"
                      title="View / Print invoice"
                    >
                      <Printer size={12} /> Print
                    </a>
                    {inv.status !== "Paid" && inv.status !== "Cancelled" && (
                      <button onClick={() => openPayment(inv)}
                        className="text-[11.5px] text-[#6b7280] hover:text-[#111111] underline transition-colors">
                        Log Payment
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="px-5 py-12 text-center text-[13px] text-[#9ca3af]">No invoices yet.</div>
        )}
      </div>

      {/* Modal backdrop */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl border border-[#e5e7eb] w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            {modal === "invoice" ? (
              <form action={invoiceAction} className="p-6 space-y-4">
                <h2 className="text-[16px] font-bold text-[#111111] mb-2">New Invoice</h2>
                {invoiceState?.error && <p className="text-[12.5px] text-red-600">{invoiceState.error}</p>}
                {invoiceState?.success && (
                  <p className="text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">
                    Invoice created. <button type="button" onClick={() => setModal(null)} className="underline">Close</button>
                  </p>
                )}
                <div>
                  <label className={labelCls}>Client *</label>
                  <select name="clientId" required className={`${inputCls} bg-white`}>
                    <option value="">Select client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <input name="description" placeholder="e.g. Monthly retainer — July 2026" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Amount ($) *</label>
                    <input name="amount" type="number" min="0" required placeholder="4500" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Tier *</label>
                    <select name="tier" defaultValue="Gold" className={`${inputCls} bg-white`}>
                      <option>Silver</option>
                      <option>Gold</option>
                      <option>Enterprise</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Issue Date *</label>
                    <input name="issueDate" type="date" required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Due Date *</label>
                    <input name="dueDate" type="date" required className={inputCls} />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)}
                    className="px-4 py-2.5 text-[13px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={invoicePending}
                    className="flex-1 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                    {invoicePending ? "Creating…" : "Create Invoice"}
                  </button>
                </div>
              </form>
            ) : (
              <form action={paymentAction} className="p-6 space-y-4">
                <h2 className="text-[16px] font-bold text-[#111111] mb-2">Log Payment</h2>
                {paymentState?.error && <p className="text-[12.5px] text-red-600">{paymentState.error}</p>}
                {paymentState?.success && (
                  <p className="text-[12.5px] text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">
                    Payment logged. <button type="button" onClick={() => setModal(null)} className="underline">Close</button>
                  </p>
                )}
                <div>
                  <label className={labelCls}>Invoice</label>
                  <select name="invoiceId" defaultValue={selectedInvoice?.id ?? ""} className={`${inputCls} bg-white`}>
                    <option value="">No invoice linked</option>
                    {invoices.filter(i => i.status !== "Paid" && i.status !== "Cancelled").map(i => (
                      <option key={i.id} value={i.id}>{i.invoice_number} — {i.client_name} (${i.amount.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Client *</label>
                  <select name="clientId" required className={`${inputCls} bg-white`}>
                    <option value="">Select client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Amount ($) *</label>
                    <input name="amount" type="number" min="0" required
                      defaultValue={selectedInvoice?.amount ?? ""}
                      placeholder="4500" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Payment Date *</label>
                    <input name="paymentDate" type="date" required className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Method *</label>
                    <select name="method" defaultValue="Bank Transfer" className={`${inputCls} bg-white`}>
                      <option>Bank Transfer</option>
                      <option>Card</option>
                      <option>Stripe</option>
                      <option>Cash</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Reference</label>
                    <input name="reference" placeholder="TXN-001" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Notes</label>
                  <input name="notes" placeholder="Optional notes…" className={inputCls} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal(null)}
                    className="px-4 py-2.5 text-[13px] text-[#6b7280] hover:text-[#111111] rounded-md hover:bg-[#f3f4f6] transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={paymentPending}
                    className="flex-1 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                    {paymentPending ? "Logging…" : "Log Payment"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
