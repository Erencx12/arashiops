"use client";

import { useEffect } from "react";
import type { DbInvoice } from "@/lib/db-types";

// Arashi OPS default sender details
const SENDER = {
  name:    "Arashi OPS",
  owner:   "Soham Das",
  email:   "ellisongod@gmail.com",
  address: "India",
  bank:    "ICICI Bank",
  account: "Contact for bank details",
};

type Invoice = DbInvoice & { contact_name: string; client_email: string };

function fmt(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function InvoicePrint({ invoice }: { invoice: Invoice }) {
  const description = invoice.description || `${invoice.tier} Engagement — Monthly Retainer`;
  const subtotal    = invoice.amount;
  const tax         = 0;
  const total       = subtotal + tax;

  useEffect(() => {
    document.title = `Invoice ${invoice.invoice_number}`;
  }, [invoice.invoice_number]);

  return (
    <>
      {/* Print controls — hidden when printing */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-[#111111] text-white text-[13px] font-medium rounded-md hover:bg-[#1a1a1a] transition-colors"
        >
          Print / Save PDF
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-[#e5e7eb] text-[#374151] text-[13px] font-medium rounded-md hover:bg-[#f3f4f6] transition-colors"
        >
          ← Back
        </button>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      {/* Invoice document */}
      <div className="invoice-page bg-white min-h-screen font-sans" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
        <div className="max-w-[794px] mx-auto px-[60px] py-[60px] print:px-[48px] print:py-[48px]">

          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <h1 style={{ fontSize: "72px", fontWeight: 900, lineHeight: 1, letterSpacing: "-2px", color: "#111111" }}>
              Invoice
            </h1>
            <div className="text-right mt-4">
              <p style={{ fontSize: "13px", color: "#374151" }}>{invoice.issue_date}</p>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>Invoice No. {invoice.invoice_number}</p>
            </div>
          </div>

          <hr style={{ borderColor: "#111111", borderTopWidth: "1px", marginBottom: "32px" }} />

          {/* Billed to */}
          <div className="mb-10">
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Billed to:</p>
            <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.7" }}>
              {invoice.contact_name || invoice.client_name}<br />
              {invoice.client_email}<br />
              {invoice.client_name}
            </p>
          </div>

          {/* Line items table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #111111" }}>
                {["Description", "Service Period", "Qty", "Amount"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#111111",
                      paddingBottom: "10px",
                      textAlign: i === 0 ? "left" : "right",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ fontSize: "13px", color: "#374151", padding: "14px 0" }}>{description}</td>
                <td style={{ fontSize: "13px", color: "#374151", padding: "14px 0", textAlign: "right" }}>Monthly</td>
                <td style={{ fontSize: "13px", color: "#374151", padding: "14px 0", textAlign: "right" }}>1</td>
                <td style={{ fontSize: "13px", color: "#374151", padding: "14px 0", textAlign: "right" }}>{fmt(invoice.amount)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "80px" }}>
            <div style={{ minWidth: "240px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "13px", color: "#374151" }}>Subtotal</span>
                <span style={{ fontSize: "13px", color: "#374151" }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "13px", color: "#374151" }}>Tax (0%)</span>
                <span style={{ fontSize: "13px", color: "#374151" }}>{fmt(tax)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>Total</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111111" }}>{fmt(total)}</span>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: "#d1d5db", borderTopWidth: "1px", marginBottom: "28px" }} />

          {/* Footer: Payment info + Sender contact */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "40px" }}>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>Payment Information</p>
              <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.8" }}>
                {SENDER.name}<br />
                Bank: {SENDER.bank}<br />
                Account: {SENDER.account}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>{SENDER.owner}</p>
              <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.8" }}>
                {SENDER.address}<br />
                {SENDER.email}
              </p>
            </div>
          </div>

          <hr style={{ borderColor: "#d1d5db", borderTopWidth: "1px", marginTop: "28px" }} />

        </div>
      </div>
    </>
  );
}
