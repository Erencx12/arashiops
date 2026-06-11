import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function run(label, fn) {
  try {
    await fn();
    console.log("✓", label);
  } catch (e) {
    console.error("✗", label, e.message);
  }
}

async function migrate() {
  console.log("Phase 12 migration starting...\n");

  // ─── Tables ──────────────────────────────────────────────────────────────────

  await run("Create sops", () => sql.query(`
    CREATE TABLE IF NOT EXISTS sops (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      category    VARCHAR(100) NOT NULL,
      content     TEXT,
      status      VARCHAR(50)  DEFAULT 'Active',
      version     INTEGER      DEFAULT 1,
      created_by  VARCHAR(255),
      created_at  TIMESTAMPTZ  DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  DEFAULT NOW()
    )
  `));

  await run("Create docs_pages", () => sql.query(`
    CREATE TABLE IF NOT EXISTS docs_pages (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      category    VARCHAR(100) NOT NULL,
      content     TEXT,
      status      VARCHAR(50)  DEFAULT 'Active',
      created_by  VARCHAR(255),
      created_at  TIMESTAMPTZ  DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  DEFAULT NOW()
    )
  `));

  await run("Create test_cases", () => sql.query(`
    CREATE TABLE IF NOT EXISTS test_cases (
      id             SERIAL PRIMARY KEY,
      feature        VARCHAR(255) NOT NULL,
      description    TEXT,
      category       VARCHAR(100),
      status         VARCHAR(50)  DEFAULT 'Needs Review',
      owner          VARCHAR(255),
      notes          TEXT,
      last_tested_at TIMESTAMPTZ,
      created_at     TIMESTAMPTZ  DEFAULT NOW(),
      updated_at     TIMESTAMPTZ  DEFAULT NOW()
    )
  `));

  await run("Create support_tickets", () => sql.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id               SERIAL PRIMARY KEY,
      title            VARCHAR(255) NOT NULL,
      description      TEXT,
      status           VARCHAR(50)  DEFAULT 'Open',
      priority         VARCHAR(50)  DEFAULT 'Medium',
      client_id        INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      assigned_to      VARCHAR(255),
      resolution_notes TEXT,
      resolved_at      TIMESTAMPTZ,
      created_at       TIMESTAMPTZ  DEFAULT NOW(),
      updated_at       TIMESTAMPTZ  DEFAULT NOW()
    )
  `));

  await run("Create offboarding_records", () => sql.query(`
    CREATE TABLE IF NOT EXISTS offboarding_records (
      id               SERIAL PRIMARY KEY,
      client_id        INTEGER NOT NULL,
      client_name      VARCHAR(255),
      reason           TEXT,
      offboarding_date DATE,
      data_exported    BOOLEAN DEFAULT FALSE,
      access_disabled  BOOLEAN DEFAULT FALSE,
      archived         BOOLEAN DEFAULT FALSE,
      notes            TEXT,
      created_by       VARCHAR(255),
      created_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `));

  await run("Create client_templates", () => sql.query(`
    CREATE TABLE IF NOT EXISTS client_templates (
      id              SERIAL PRIMARY KEY,
      name            VARCHAR(255) NOT NULL,
      tier            VARCHAR(50)  NOT NULL,
      description     TEXT,
      default_status  VARCHAR(50)  DEFAULT 'Active',
      features        TEXT[],
      is_default      BOOLEAN      DEFAULT FALSE,
      created_at      TIMESTAMPTZ  DEFAULT NOW(),
      updated_at      TIMESTAMPTZ  DEFAULT NOW()
    )
  `));

  // ─── Indexes ─────────────────────────────────────────────────────────────────

  await run("Index sops.category",             () => sql.query(`CREATE INDEX IF NOT EXISTS idx_sops_category ON sops(category)`));
  await run("Index sops.status",               () => sql.query(`CREATE INDEX IF NOT EXISTS idx_sops_status ON sops(status)`));
  await run("Index docs_pages.category",       () => sql.query(`CREATE INDEX IF NOT EXISTS idx_docs_category ON docs_pages(category)`));
  await run("Index test_cases.status",         () => sql.query(`CREATE INDEX IF NOT EXISTS idx_test_cases_status ON test_cases(status)`));
  await run("Index test_cases.category",       () => sql.query(`CREATE INDEX IF NOT EXISTS idx_test_cases_category ON test_cases(category)`));
  await run("Index support_tickets.status",    () => sql.query(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status)`));
  await run("Index support_tickets.client_id", () => sql.query(`CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON support_tickets(client_id)`));
  await run("Index offboarding.client_id",     () => sql.query(`CREATE INDEX IF NOT EXISTS idx_offboarding_client_id ON offboarding_records(client_id)`));

  // ─── Seed SOPs ───────────────────────────────────────────────────────────────

  const sopRows = await sql.query(`SELECT COUNT(*) AS cnt FROM sops`);
  if (Number(sopRows[0].cnt) === 0) {
    await run("Seed SOPs", () => sql.query(`
      INSERT INTO sops (title, category, content, created_by) VALUES
      ('Sales Outreach Process',       'Sales',       'Standard operating procedure for qualifying and converting prospects. Covers ICP identification, initial outreach, follow-up cadences, and handoff to onboarding.', 'Soham Das'),
      ('New Client Onboarding',        'Onboarding',  'Step-by-step process from signed contract to active client. Covers kickoff scheduling, onboarding form, ICP setup, first deliverable, and 30-day check-in.', 'Soham Das'),
      ('Lead Qualification Framework', 'Sales',       'ICP criteria and scoring methodology for qualifying inbound and outbound leads. Covers BANT framework, disqualification triggers, and routing logic.', 'Soham Das'),
      ('Proposal Creation & Delivery', 'Sales',       'Process for building, reviewing, and delivering proposals. Covers discovery insights, package selection, pricing, approval, and follow-up sequence.', 'Soham Das'),
      ('Contract Management',          'Legal',       'Workflow for contract creation, review, signing, and storage. Covers template selection, negotiation bounds, e-signature process, and storage.', 'Soham Das'),
      ('Billing & Invoicing',          'Finance',     'Monthly billing cycle, invoice creation, payment tracking, and escalation. Covers billing dates, payment methods, overdue escalation, and refunds.', 'Soham Das'),
      ('Client Support & Response',    'Support',     'SLA definitions, response time standards, and escalation paths. P1 critical: 2h, P2 high: 8h, P3 medium: 24h, P4 low: 72h.', 'Soham Das'),
      ('Client Offboarding',           'Operations',  'Process for cancelling access, exporting data, and closing accounts. Covers cancellation notice, data export, access revocation, and exit survey.', 'Soham Das'),
      ('AI Workflow Guidelines',       'AI',          'Usage guidelines for AI features. Covers lead scoring cadence, research triggers, analysis review process, and cost monitoring.', 'Soham Das'),
      ('Integration Setup & Maintenance', 'Technical','Connecting, configuring, and maintaining third-party integrations. Covers Apollo, Instantly, HubSpot setup and monthly health checks.', 'Soham Das')
    `));
  }

  // ─── Seed Test Cases ─────────────────────────────────────────────────────────

  const testRows = await sql.query(`SELECT COUNT(*) AS cnt FROM test_cases`);
  if (Number(testRows[0].cnt) === 0) {
    await run("Seed test cases", () => sql.query(`
      INSERT INTO test_cases (feature, description, category, owner) VALUES
      ('Login & Auth',              'Email/password login, session persistence, logout', 'Auth', 'Soham Das'),
      ('Client Creation',           'Create client with all fields, invite email flow', 'Clients', 'Soham Das'),
      ('Client Portal Access',      'Client logs in, views dashboard, accesses pages', 'Portal', 'Soham Das'),
      ('Onboarding Flow',           'Client completes onboarding form, progress tracked', 'Onboarding', 'Soham Das'),
      ('Proposal Creation',         'Create proposal, send to client, acceptance flow', 'Commercial', 'Soham Das'),
      ('Invoice Creation',          'Create invoice, mark paid, view payment history', 'Finance', 'Soham Das'),
      ('Subscription Billing',      'Create subscription, plan change, cancellation', 'Billing', 'Soham Das'),
      ('Stripe Checkout',           'Checkout session, success/cancel redirects', 'Billing', 'Soham Das'),
      ('Lead Scoring (AI)',         'Score a lead via Claude, result saved to DB', 'AI', 'Soham Das'),
      ('Prospect Research (AI)',    'Research a contact, verify report generated', 'AI', 'Soham Das'),
      ('Apollo Lead Import',        'Sync leads from Apollo, verify lead records', 'Integrations', 'Soham Das'),
      ('Instantly Campaign Sync',   'Sync campaigns from Instantly, verify stats', 'Integrations', 'Soham Das'),
      ('Email Delivery',            'Invite email + reset password email via SMTP', 'Email', 'Soham Das'),
      ('Webhook Processing',        'Stripe webhook received and processed correctly', 'Webhooks', 'Soham Das'),
      ('Health Endpoint',           '/api/health returns correct service statuses', 'Monitoring', 'Soham Das'),
      ('Audit Logging',             'Sensitive actions produce audit log entries', 'Security', 'Soham Das'),
      ('Rate Limiting',             'Login attempts rate limited after threshold', 'Security', 'Soham Das'),
      ('CSV Export',                'Client, invoice, payment exports produce valid CSV', 'Exports', 'Soham Das'),
      ('Role Access Control',       'Clients cannot access admin routes', 'Security', 'Soham Das'),
      ('Support Ticket Flow',       'Create ticket, update status, resolve', 'Support', 'Soham Das')
    `));
  }

  // ─── Seed Docs ───────────────────────────────────────────────────────────────

  const docRows = await sql.query(`SELECT COUNT(*) AS cnt FROM docs_pages`);
  if (Number(docRows[0].cnt) === 0) {
    await run("Seed docs", () => sql.query(`
      INSERT INTO docs_pages (title, category, content, created_by) VALUES
      ('Deployment Guide',         'Deployment',    'Arashi Ops runs on Vercel + Neon PostgreSQL.\n\nSteps:\n1. Configure all environment variables in Vercel project settings\n2. Push to main branch — auto-deploys\n3. Visit /api/setup?secret=SETUP_SECRET to initialize database\n4. Verify /api/health endpoint returns healthy\n5. Create owner account and test login', 'Soham Das'),
      ('Environment Variables',    'Technical',     'REQUIRED:\n- DATABASE_URL — Neon PostgreSQL connection string\n- SESSION_SECRET — Random 32+ character string for JWT signing\n\nOPTIONAL:\n- ANTHROPIC_API_KEY — Claude AI features\n- STRIPE_SECRET_KEY — Payment processing\n- STRIPE_PUBLISHABLE_KEY — Stripe frontend\n- STRIPE_WEBHOOK_SECRET — Stripe webhook verification\n- SMTP_HOST / SMTP_USER / SMTP_PASSWORD — Email delivery\n- SMTP_FROM_EMAIL — Sender address\n- NEXT_PUBLIC_APP_URL — Production domain', 'Soham Das'),
      ('API Reference',            'Technical',     'ENDPOINTS:\n\nGET /api/health\nReturns: { status, services, timestamp }\nChecks: database, claude, stripe, smtp, apollo\n\nPOST /api/webhooks/stripe\nStripe webhook endpoint\nRequires: STRIPE_WEBHOOK_SECRET env var\nHandles: checkout.session.completed, invoice.paid, customer.subscription.*', 'Soham Das'),
      ('Integration Setup',        'Integrations',  'APOLLO.IO:\n1. Get API key from apollo.io/settings/integrations\n2. Add APOLLO_API_KEY to environment variables\n3. Or add via API Vault at /admin/integrations\n4. Test: run Sync in /admin/integrations\n\nINSTANTLY.AI:\n1. Get API key from app.instantly.ai/settings\n2. Add via API Vault at /admin/integrations\n3. Test: run Campaign Sync\n\nHUBSPOT:\n1. Get API key from HubSpot developer portal\n2. Add HUBSPOT_API_KEY to environment\n3. Sync contacts via /admin/integrations', 'Soham Das'),
      ('Troubleshooting',          'Support',       'LOGIN NOT WORKING:\n- Check SESSION_SECRET is set and consistent\n- Verify user exists in database (/api/setup)\n- Check browser cookies are enabled\n\nEMAILS NOT SENDING:\n- Verify SMTP_HOST, SMTP_USER, SMTP_PASSWORD are set\n- Check SMTP port (usually 587 for TLS, 465 for SSL)\n- Check spam folder for test emails\n\nAI FEATURES NOT WORKING:\n- Verify ANTHROPIC_API_KEY is set\n- Check /api/health for Claude service status\n- Check AI usage limits in /admin/ai', 'Soham Das')
    `));
  }

  // ─── Seed Client Templates ────────────────────────────────────────────────────

  const tmplRows = await sql.query(`SELECT COUNT(*) AS cnt FROM client_templates`);
  if (Number(tmplRows[0].cnt) === 0) {
    await run("Seed client templates", () => sql.query(`
      INSERT INTO client_templates (name, tier, description, default_status, features) VALUES
      ('Silver Client',    'Silver',     '$1,500/month — 3 deliverables/month, standard support, monthly reporting', 'Active', ARRAY['Lead List', 'Monthly Report', 'Email Campaign']),
      ('Gold Client',      'Gold',       '$4,500/month — 10 deliverables/month, priority support, bi-weekly calls', 'Active', ARRAY['Lead List', 'Monthly Report', 'Email Campaign', 'CRM Setup', 'Analytics Dashboard', 'Dedicated Slack']),
      ('Platinum Client',  'Platinum',   '$7,500/month — 20 deliverables/month, priority support, weekly strategy', 'Active', ARRAY['All Gold Features', 'Weekly Strategy Call', 'Custom Playbooks', 'AI Lead Scoring', 'Dedicated Account Manager']),
      ('Enterprise Client','Enterprise', '$9,000+/month — unlimited deliverables, dedicated team, custom SLA', 'Active', ARRAY['All Platinum Features', 'Dedicated Ops Team', 'Custom AI Models', 'White-label Portal', 'Custom Integrations'])
    `));
  }

  console.log("\nPhase 12 migration complete!");
}

migrate().catch(console.error);
