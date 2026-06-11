import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { sql } from "@/lib/db";

async function verifyOwner() {
  const jar = await cookies();
  const token = jar.get("arashi_session")?.value;
  const session = await decrypt(token);
  if (!session || session.role !== "owner") return null;
  return session;
}

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(",")),
  ].join("\n");
}

const EXPORTERS: Record<string, () => Promise<Record<string, unknown>[]>> = {
  clients: async () =>
    (await sql`
      SELECT id, company_name, contact_name, email, tier, status,
             monthly_value, industry, owner, health_score,
             start_date::text, renewal_date::text, created_at::text
      FROM clients ORDER BY company_name
    `) as Record<string, unknown>[],

  invoices: async () =>
    (await sql`
      SELECT i.id, i.invoice_number, c.company_name AS client,
             i.amount, i.status, i.issue_date::text, i.due_date::text,
             i.paid_date::text, i.description
      FROM invoices i LEFT JOIN clients c ON c.id = i.client_id
      ORDER BY i.created_at DESC
    `) as Record<string, unknown>[],

  payments: async () =>
    (await sql`
      SELECT p.id, c.company_name AS client, p.amount,
             p.payment_date::text, p.method, p.reference, p.notes,
             p.billing_status, p.created_at::text
      FROM payments p LEFT JOIN clients c ON c.id = p.client_id
      ORDER BY p.payment_date DESC
    `) as Record<string, unknown>[],

  leads: async () =>
    (await sql`
      SELECT al.id, c.company_name AS client, al.name, al.company,
             al.title, al.email, al.industry, al.location,
             al.source, al.import_date::text,
             ls.score, ls.confidence
      FROM apollo_leads al
      LEFT JOIN clients c ON c.id = al.client_id
      LEFT JOIN lead_scores ls ON ls.apollo_lead_id = al.id
      ORDER BY al.import_date DESC
    `) as Record<string, unknown>[],

  audit_logs: async () =>
    (await sql`
      SELECT id, action, actor_email, actor_role,
             target_type, target_id, ip_address,
             created_at::text
      FROM audit_logs ORDER BY created_at DESC LIMIT 1000
    `) as Record<string, unknown>[],

  support_tickets: async () =>
    (await sql`
      SELECT t.id, t.title, t.status, t.priority,
             c.company_name AS client, t.assigned_to,
             t.resolution_notes, t.created_at::text, t.resolved_at::text
      FROM support_tickets t
      LEFT JOIN clients c ON c.id = t.client_id
      ORDER BY t.created_at DESC
    `) as Record<string, unknown>[],
};

export async function GET(req: NextRequest) {
  const session = await verifyOwner();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") ?? "";
  const exporter = EXPORTERS[type];
  if (!exporter) {
    return NextResponse.json(
      { error: `Unknown export type. Valid: ${Object.keys(EXPORTERS).join(", ")}` },
      { status: 400 }
    );
  }

  const rows = await exporter();
  const csv  = toCSV(rows);
  const filename = `arashi-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
