/**
 * Development seed script — mirrors the original mock data from dashboard-data.ts.
 * Run: npx tsx scripts/seed.ts
 * Safe to re-run (uses ON CONFLICT DO NOTHING where possible, truncates others).
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function seed() {
  console.log("Seeding Meridian database...");

  // ── Users ────────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO users (name, email, role) VALUES
      ('Soham Das', 'yo.gamegenesis@gmail.com', 'owner')
    ON CONFLICT (email) DO NOTHING
  `;

  // ── Clients ──────────────────────────────────────────────────────────────
  await sql`TRUNCATE clients CASCADE`;
  const clientRows = await sql`
    INSERT INTO clients (company_name, contact_name, email, tier, status, monthly_value, industry, owner, health_score, renewal_date, start_date) VALUES
      ('Axiom Capital',    'Ops Team',   'ops@axiomcapital.io',     'Platinum', 'Active', 7500, 'Financial Services', 'Soham Das', 92, '2027-01-05', '2026-01-05'),
      ('Relay Software',   'Growth Team','growth@relaysoftware.com','Gold',     'Active', 4500, 'B2B SaaS',           'Soham Das', 88, '2027-02-05', '2026-02-05'),
      ('Compound Studio',  'Hello Team', 'hello@compoundstudio.co', 'Silver',   'Active', 1500, 'Creative Services',  'Soham Das', 75, '2027-03-07', '2026-03-07'),
      ('Threshold AI',     'Dev Team',   'team@thresholdai.com',    'Gold',     'Review', 4500, 'AI / ML',            'Soham Das', 62, '2026-12-05', '2025-12-05'),
      ('Vantage Commerce', 'Ops Team',   'ops@vantagecommerce.co',  'Silver',   'Active', 1500, 'E-Commerce',         'Soham Das', 81, '2027-04-10', '2026-04-10')
    RETURNING id, company_name
  `;
  const cid = Object.fromEntries(clientRows.map((r: any) => [r.company_name, r.id]));
  console.log("Clients seeded:", Object.keys(cid));

  // ── Projects ─────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO projects (client_id, title, status, progress, deadline, agent) VALUES
      (${cid["Axiom Capital"]},    'Q2 Outbound System',        'Active',    72, '2026-06-30', 'Claude CMO'),
      (${cid["Relay Software"]},   'CRM Architecture',          'Active',    45, '2026-07-15', 'Claude CEO'),
      (${cid["Compound Studio"]},  'Content Engine Setup',      'Review',    88, '2026-06-20', 'Claude CMO'),
      (${cid["Axiom Capital"]},    'Revenue Attribution Model', 'Active',    30, '2026-07-01', 'Claude CFO'),
      (${cid["Threshold AI"]},     'ICP Definition Sprint',     'Completed',100, '2026-06-10', 'Claude CEO'),
      (${cid["Vantage Commerce"]}, 'Email Sequence Build',      'Pending',   15, '2026-07-10', 'Claude CMO'),
      (${cid["Vantage Commerce"]}, 'Referral Programme Design', 'Pending',    0, '2026-07-20', 'Claude CEO'),
      (${cid["Threshold AI"]},     'Pipeline Review',           'Paused',    40, '2026-06-28', 'Claude CFO')
  `;

  // ── Agent Tasks ──────────────────────────────────────────────────────────
  await sql`
    INSERT INTO agent_tasks (agent, task, status, output, created_at, completed_at, reviewed, approved) VALUES
      ('Claude CEO', 'ICP Analysis — Axiom Capital',          'Completed', '12-page ICP playbook with 3 buyer segments identified', '2026-06-01', '2026-06-03', TRUE,  TRUE),
      ('Claude CMO', 'Email Sequence Draft — Relay Software', 'Review',    '7-touch email sequence across 42 email variants',      '2026-06-04', '2026-06-05', FALSE, FALSE),
      ('Claude CFO', 'Revenue Attribution Report — Q2',       'Completed', 'Pipeline analysis and multi-touch attribution model',  '2026-06-02', '2026-06-04', TRUE,  TRUE),
      ('Claude CMO', 'LinkedIn Content Calendar — Compound Studio', 'Active', NULL, '2026-06-05', NULL, FALSE, FALSE),
      ('Claude CEO', 'Onboarding Brief — Vantage Commerce',   'Active',    NULL,                                                    '2026-06-05', NULL, FALSE, FALSE),
      ('Claude CFO', 'Financial Baseline — Threshold AI',     'Review',    'Current state financials and growth gap analysis',     '2026-06-03', '2026-06-05', FALSE, FALSE),
      ('Claude CMO', 'Campaign Brief — Axiom Capital Q3',     'Pending',   NULL,                                                    '2026-06-06', NULL, FALSE, FALSE)
  `;

  // ── Approvals ────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO approvals (type, title, client_id, agent, status, created_at) VALUES
      ('Script',   'Discovery Call Script v2 — Relay Software',    ${cid["Relay Software"]},   'Claude CMO', 'Pending',  '2026-06-05'),
      ('Report',   'Monthly Performance Report — May 2026',        ${cid["Axiom Capital"]},    'Claude CFO', 'Pending',  '2026-06-04'),
      ('Asset',    'LinkedIn Banner Set — Compound Studio',        ${cid["Compound Studio"]},  'Claude CMO', 'Approved', '2026-06-02'),
      ('Video',    'Explainer Script Draft — Vantage Commerce',    ${cid["Vantage Commerce"]}, 'Claude CMO', 'Revision Requested', '2026-06-01'),
      ('Research', 'Competitor Analysis — Threshold AI',           ${cid["Threshold AI"]},     'Claude CEO', 'Approved', '2026-05-30'),
      ('Report',   'Financial Gap Analysis — Threshold AI',        ${cid["Threshold AI"]},     'Claude CFO', 'Pending',  '2026-06-05')
  `;

  // ── Content Items ────────────────────────────────────────────────────────
  await sql`
    INSERT INTO content_items (client_id, type, title, size_label, tags, created_at) VALUES
      (${cid["Axiom Capital"]},    'Script',   'Cold Email Sequence — Financial Services ICP',  '24 KB',   ARRAY['outbound','email'],     '2026-06-03'),
      (${cid["Axiom Capital"]},    'Report',   'Q1 2026 Revenue Attribution Report',           '1.2 MB',  ARRAY['finance','analytics'],  '2026-06-04'),
      (${cid["Compound Studio"]},  'Asset',    'LinkedIn Profile Banners — Partner Set',       '3.4 MB',  ARRAY['design','linkedin'],    '2026-06-02'),
      (${cid["Relay Software"]},   'Video',    'Product Demo Script — SaaS Buyer Persona',     '18 KB',   ARRAY['video','demo'],         '2026-06-01'),
      (${cid["Axiom Capital"]},    'Campaign', 'Q2 Outbound Campaign Package',                 '890 KB',  ARRAY['campaign','outbound'],  '2026-05-28'),
      (${cid["Relay Software"]},   'Script',   'LinkedIn DM Sequence — Decision Makers',       '16 KB',   ARRAY['linkedin','outbound'],  '2026-05-25'),
      (${cid["Relay Software"]},   'Report',   'ICP Playbook — 3 Buyer Segments',              '2.1 MB',  ARRAY['strategy','icp'],       '2026-05-20'),
      (${cid["Vantage Commerce"]}, 'Asset',    'Email Signature Templates',                    '240 KB',  ARRAY['design','email'],       '2026-05-18')
  `;

  // ── Meetings ─────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO meetings (client_id, title, type, meeting_date, meeting_time, status, notes, duration) VALUES
      (${cid["Axiom Capital"]},    'Monthly Review — Axiom Capital',   'Monthly Review',   '2026-06-10', '2:00 PM',  'Upcoming',  NULL, '60 min'),
      (${cid["Relay Software"]},   'Strategy Session — Relay Software','Strategy',         '2026-06-12', '10:00 AM', 'Upcoming',  NULL, '45 min'),
      (${cid["Vantage Commerce"]}, 'Onboarding — Vantage Commerce',    'Onboarding',       '2026-06-08', '3:00 PM',  'Upcoming',  NULL, '45 min'),
      (${cid["Threshold AI"]},     'Quarterly Review — Threshold AI',  'Quarterly Review', '2026-05-28', '11:00 AM', 'Completed', 'Discussed ICP refinement and new target verticals. Agreed to pause pipeline work pending new direction.', '60 min'),
      (${cid["Compound Studio"]},  'Check-in — Compound Studio',       'Check-in',         '2026-05-22', '4:00 PM',  'Completed', 'Content calendar approved. Start date confirmed for Jun 1.', '30 min'),
      (NULL,                        'Discovery — Inbound Lead',         'Discovery',        '2026-06-14', '1:00 PM',  'Upcoming',  NULL, '45 min')
  `;

  // ── Contracts ────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO contracts (client_id, type, tier, status, signed_date, start_date, end_date, monthly_value) VALUES
      (${cid["Axiom Capital"]},    'Platinum Engagement', 'Platinum', 'Active', '2026-01-03', '2026-01-05', '2027-01-05', 7500),
      (${cid["Relay Software"]},   'Gold Engagement',     'Gold',     'Active', '2026-02-02', '2026-02-05', '2027-02-05', 4500),
      (${cid["Compound Studio"]},  'Silver Engagement',   'Silver',   'Active', '2026-03-04', '2026-03-07', '2027-03-07', 1500),
      (${cid["Threshold AI"]},     'Gold Engagement',     'Gold',     'Active', '2025-12-01', '2025-12-05', '2026-12-05', 4500),
      (${cid["Vantage Commerce"]}, 'Silver Engagement',   'Silver',   'Active', '2026-04-07', '2026-04-10', '2027-04-10', 1500)
  `;

  // ── Invoices ─────────────────────────────────────────────────────────────
  await sql`
    INSERT INTO invoices (invoice_number, client_id, amount, status, issue_date, due_date, paid_date) VALUES
      ('INV-0012', ${cid["Axiom Capital"]},    7500, 'Paid',    '2026-06-01', '2026-06-07', '2026-06-03'),
      ('INV-0011', ${cid["Relay Software"]},   4500, 'Paid',    '2026-06-01', '2026-06-07', '2026-06-05'),
      ('INV-0010', ${cid["Compound Studio"]},  1500, 'Pending', '2026-06-01', '2026-06-08', NULL),
      ('INV-0009', ${cid["Threshold AI"]},     4500, 'Overdue', '2026-06-01', '2026-06-07', NULL),
      ('INV-0008', ${cid["Vantage Commerce"]}, 1500, 'Pending', '2026-06-01', '2026-06-08', NULL),
      ('INV-0007', ${cid["Axiom Capital"]},    7500, 'Paid',    '2026-05-01', '2026-05-07', '2026-05-04'),
      ('INV-0006', ${cid["Relay Software"]},   4500, 'Paid',    '2026-05-01', '2026-05-07', '2026-05-06')
  `;

  // ── Leads (for Relay Software / Gold demo client) ─────────────────────────
  await sql`
    INSERT INTO leads (client_id, name, company, source, status, estimated_value, created_at) VALUES
      (${cid["Relay Software"]}, 'James Whitfield', 'Axiom Ventures',  'LinkedIn', 'Meeting Booked', '$4,500/mo', '2026-06-05'),
      (${cid["Relay Software"]}, 'Sarah Park',      'NovaBridge Inc',  'Email',    'Responded',      NULL,        '2026-06-04'),
      (${cid["Relay Software"]}, 'Marcus Chen',     'Frontier SaaS',   'Referral', 'Qualified',      '$4,500/mo', '2026-06-03'),
      (${cid["Relay Software"]}, 'Priya Nair',      'Lumina Health',   'LinkedIn', 'Contacted',      NULL,        '2026-06-02'),
      (${cid["Relay Software"]}, 'Tom Rashford',    'Strata Capital',  'Inbound',  'Not Qualified',  NULL,        '2026-05-30'),
      (${cid["Relay Software"]}, 'Elena Vasquez',   'Orbit Commerce',  'Email',    'Closed Won',     '$1,500/mo', '2026-05-28'),
      (${cid["Relay Software"]}, 'David Osei',      'Clearfield Tech', 'LinkedIn', 'Contacted',      NULL,        '2026-06-06')
  `;

  // ── MRR History ──────────────────────────────────────────────────────────
  await sql`
    INSERT INTO mrr_history (month_label, month_year, value) VALUES
      ('Jan', '2026-01', 8500),
      ('Feb', '2026-02', 12000),
      ('Mar', '2026-03', 13500),
      ('Apr', '2026-04', 16000),
      ('May', '2026-05', 18000),
      ('Jun', '2026-06', 19500)
    ON CONFLICT (month_year) DO NOTHING
  `;

  // ── Sales Funnel ─────────────────────────────────────────────────────────
  await sql`
    INSERT INTO sales_funnel (stage, count, prev_count, sort_order) VALUES
      ('Discovery Calls', 14, 9, 1),
      ('Proposals Sent',   8, 5, 2),
      ('Deals Won',        5, 3, 3),
      ('Deals Lost',       3, 2, 4)
    ON CONFLICT (stage) DO UPDATE
      SET count = EXCLUDED.count, prev_count = EXCLUDED.prev_count
  `;

  // ── Activity Log ─────────────────────────────────────────────────────────
  await sql`TRUNCATE activity_log`;
  await sql`
    INSERT INTO activity_log (type, description, created_at) VALUES
      ('approval', 'Monthly Performance Report approved — Axiom Capital',         NOW() - INTERVAL '2 hours'),
      ('agent',    'Claude CMO completed Email Sequence Draft for Relay Software', NOW() - INTERVAL '4 hours'),
      ('meeting',  'Onboarding call scheduled with Vantage Commerce',             NOW() - INTERVAL '5 hours'),
      ('client',   'Vantage Commerce onboarded as Silver client',                 NOW() - INTERVAL '1 day'),
      ('upload',   'ICP Playbook uploaded to Relay Software content library',     NOW() - INTERVAL '1 day'),
      ('project',  'ICP Definition Sprint marked complete — Threshold AI',        NOW() - INTERVAL '2 days'),
      ('approval', 'LinkedIn Banner Set approved — Compound Studio',              NOW() - INTERVAL '4 days'),
      ('agent',    'Claude CFO delivered Revenue Attribution Report',             NOW() - INTERVAL '2 days')
  `;

  console.log("Seed complete.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
