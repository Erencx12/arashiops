import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    client_id,
    first_name,
    last_name,
    company,
    title,
    email,
    company_summary,
    main_problem,
    opportunity,
    personalized_email,
    subject_line,
    confidence_score,
  } = body;

  if (!first_name || !company) {
    return NextResponse.json({ error: "first_name and company are required" }, { status: 400 });
  }

  const name = `${first_name} ${last_name ?? ""}`.trim();
  const clientId = client_id ? Number(client_id) : null;
  const score = confidence_score ? parseFloat(confidence_score) : null;

  await sql`
    INSERT INTO apollo_leads (name, company, title, email, client_id, company_summary, main_problem, opportunity, personalized_email, subject_line, confidence_score, ai_processed)
    VALUES (${name}, ${company}, ${title ?? null}, ${email ?? null}, ${clientId}, ${company_summary ?? null}, ${main_problem ?? null}, ${opportunity ?? null}, ${personalized_email ?? null}, ${subject_line ?? null}, ${score}, true)
  `;

  return NextResponse.json({ ok: true, name, company });
}
