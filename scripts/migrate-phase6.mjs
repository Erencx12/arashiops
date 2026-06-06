import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function run(label, fn) {
  try {
    await fn();
    console.log(`✓ ${label}`);
  } catch (e) {
    if (
      e.message?.includes("already exists") ||
      e.message?.includes("duplicate column") ||
      e.message?.includes("does not exist")
    ) {
      console.log(`~ ${label} (skipped: ${e.message.split("\n")[0]})`);
    } else {
      console.error(`✗ ${label}: ${e.message}`);
    }
  }
}

// ── deals ─────────────────────────────────────────────────────────────────────
await run("deals table", () => sql`
  CREATE TABLE IF NOT EXISTS deals (
    id                  SERIAL PRIMARY KEY,
    company             TEXT NOT NULL,
    contact_name        TEXT NOT NULL,
    contact_email       TEXT,
    deal_value          NUMERIC(12,2) NOT NULL DEFAULT 0,
    stage               TEXT NOT NULL DEFAULT 'Lead',
    owner               TEXT NOT NULL DEFAULT 'Soham Das',
    expected_close_date DATE,
    notes               TEXT,
    client_id           INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── discovery_calls ───────────────────────────────────────────────────────────
await run("discovery_calls table", () => sql`
  CREATE TABLE IF NOT EXISTS discovery_calls (
    id                SERIAL PRIMARY KEY,
    deal_id           INTEGER REFERENCES deals(id) ON DELETE SET NULL,
    company           TEXT NOT NULL,
    contact_name      TEXT NOT NULL,
    call_date         DATE,
    meeting_notes     TEXT,
    pain_points       TEXT,
    requirements      TEXT,
    budget            TEXT,
    decision_timeline TEXT,
    next_action       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── proposals ─────────────────────────────────────────────────────────────────
await run("proposals table", () => sql`
  CREATE TABLE IF NOT EXISTS proposals (
    id            SERIAL PRIMARY KEY,
    deal_id       INTEGER REFERENCES deals(id) ON DELETE SET NULL,
    client_id     INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    title         TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'Draft',
    package       TEXT NOT NULL DEFAULT 'Silver',
    monthly_value NUMERIC(12,2) NOT NULL DEFAULT 0,
    setup_fee     NUMERIC(12,2) NOT NULL DEFAULT 0,
    deliverables  TEXT,
    terms         TEXT,
    timeline      TEXT,
    notes         TEXT,
    version       INTEGER NOT NULL DEFAULT 1,
    sent_at       TIMESTAMPTZ,
    accepted_at   TIMESTAMPTZ,
    expires_at    DATE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── payments ──────────────────────────────────────────────────────────────────
await run("payments table", () => sql`
  CREATE TABLE IF NOT EXISTS payments (
    id           SERIAL PRIMARY KEY,
    invoice_id   INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
    client_id    INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    amount       NUMERIC(12,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    method       TEXT NOT NULL DEFAULT 'Bank Transfer',
    reference    TEXT,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── renewals ──────────────────────────────────────────────────────────────────
await run("renewals table", () => sql`
  CREATE TABLE IF NOT EXISTS renewals (
    id            SERIAL PRIMARY KEY,
    client_id     INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contract_id   INTEGER REFERENCES contracts(id) ON DELETE SET NULL,
    renewal_date  DATE,
    status        TEXT NOT NULL DEFAULT 'Upcoming',
    monthly_value NUMERIC(12,2),
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── extend contracts ──────────────────────────────────────────────────────────
await run("contracts.deal_id",         () => sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL`);
await run("contracts.proposal_id",     () => sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS proposal_id INTEGER REFERENCES proposals(id) ON DELETE SET NULL`);
await run("contracts.contract_number", () => sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_number TEXT`);
await run("contracts status drop",     () => sql`ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_status_check`);
await run("contracts status add",      () => sql`ALTER TABLE contracts ADD CONSTRAINT contracts_status_check CHECK (status IN ('Draft','Sent','Signed','Active','Expired','Cancelled','Pending Signature'))`);

// ── extend invoices ───────────────────────────────────────────────────────────
await run("invoices.deal_id",     () => sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL`);
await run("invoices.proposal_id", () => sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS proposal_id INTEGER REFERENCES proposals(id) ON DELETE SET NULL`);
await run("invoices.description", () => sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS description TEXT`);
await run("invoices status drop",       () => sql`ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check`);
await run("invoices pending → sent",   () => sql`UPDATE invoices SET status = 'Sent' WHERE status = 'Pending'`);
await run("invoices status add",       () => sql`ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('Draft','Sent','Paid','Partially Paid','Overdue','Cancelled'))`);

// ── activity_log type constraint ──────────────────────────────────────────────
await run("activity_log type drop", () => sql`ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_type_check`);

console.log("\nPhase 6 migration complete.");
