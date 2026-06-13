"use server";

import { z } from "zod";
import { sql } from "./db";
import { sendEmail } from "./email";

const Schema = z.object({
  full_name:          z.string().min(1),
  email:              z.string().email(),
  company:            z.string().min(1),
  website:            z.string().optional(),
  industry:           z.string().min(1),
  revenue_range:      z.string().optional(),
  primary_challenges: z.string().min(1),
  call_goals:         z.string().min(1),
});

export type DiscoveryFormState = { error?: string; success?: boolean } | null;

export async function submitDiscoveryForm(
  _prev: DiscoveryFormState,
  formData: FormData
): Promise<DiscoveryFormState> {
  const raw = Object.fromEntries(
    Object.keys(Schema.shape).map((k) => [k, formData.get(k)])
  );
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return { error: "Please fill in all required fields." };

  const d = parsed.data;

  await sql`
    CREATE TABLE IF NOT EXISTS discovery_forms (
      id              SERIAL PRIMARY KEY,
      full_name       TEXT NOT NULL,
      email           TEXT NOT NULL,
      company         TEXT NOT NULL,
      website         TEXT,
      industry        TEXT NOT NULL,
      revenue_range   TEXT,
      primary_challenges TEXT NOT NULL,
      call_goals      TEXT NOT NULL,
      submitted_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    INSERT INTO discovery_forms
      (full_name, email, company, website, industry, revenue_range, primary_challenges, call_goals)
    VALUES
      (${d.full_name}, ${d.email}, ${d.company}, ${d.website ?? null},
       ${d.industry}, ${d.revenue_range ?? null}, ${d.primary_challenges}, ${d.call_goals})
  `;

  const ownerEmail = "wrick2297@gmail.com";
  if (ownerEmail) {
    await sendEmail({
      to: ownerEmail,
      subject: `Discovery lead: ${d.full_name} — ${d.company}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff">
          <div style="background:#0a0a0a;padding:24px 32px;border-radius:10px 10px 0 0">
            <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff">Arashi OPS</p>
            <p style="margin:4px 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em">New discovery call lead</p>
          </div>
          <div style="padding:32px;border:1px solid #e5e7eb;border-top:none">
            <p style="margin:0 0 24px;font-size:22px;font-weight:700;color:#111111">${d.full_name} wants a call</p>
            <table style="width:100%;border-collapse:collapse">
              ${[
                ["Company",    d.company],
                ["Email",      d.email],
                ["Website",    d.website ?? "—"],
                ["Industry",   d.industry],
                ["Revenue",    d.revenue_range ?? "—"],
              ].map(([k, v]) => `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;width:36%;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em">${k}</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;color:#111111;font-weight:500">${v}</td>
                </tr>
              `).join("")}
            </table>
            <div style="margin:24px 0;background:#f9fafb;border-radius:8px;padding:18px 20px">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">Primary challenges</p>
              <p style="margin:0;font-size:14px;color:#111111;line-height:1.6">${d.primary_challenges}</p>
            </div>
            <div style="background:#f9fafb;border-radius:8px;padding:18px 20px">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em">What they want from the call</p>
              <p style="margin:0;font-size:14px;color:#111111;line-height:1.6">${d.call_goals}</p>
            </div>
          </div>
          <div style="padding:16px 32px;background:#fafafa;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;text-align:center">
            <p style="margin:0;font-size:11px;color:#9ca3af">Arashi OPS · arashiops.vercel.app</p>
          </div>
        </div>
      `,
      template: "discovery_lead",
    }).catch(() => {});
  }

  return { success: true };
}
