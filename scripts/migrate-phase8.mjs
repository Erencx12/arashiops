import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not set"); process.exit(1); }

const sql = neon(DATABASE_URL);

async function run(label, fn) {
  try {
    await fn();
    console.log(`✓ ${label}`);
  } catch (e) {
    if (e.message?.includes("already exists") || e.message?.includes("duplicate column") || e.message?.includes("already exists")) {
      console.log(`~ ${label} (skipped)`);
    } else {
      console.error(`✗ ${label}: ${e.message}`);
    }
  }
}

// ── integration_credentials: add key_value column ─────────────────────────────
await run("integration_credentials.key_value column", () => sql`
  ALTER TABLE integration_credentials ADD COLUMN key_value TEXT
`);

// ── email_config ──────────────────────────────────────────────────────────────
await run("email_config table", () => sql`
  CREATE TABLE IF NOT EXISTS email_config (
    id                SERIAL PRIMARY KEY,
    provider          TEXT NOT NULL DEFAULT 'smtp',
    integration_id    INTEGER REFERENCES integrations(id) ON DELETE SET NULL,
    smtp_host         TEXT,
    smtp_port         INTEGER NOT NULL DEFAULT 587,
    smtp_secure       BOOLEAN NOT NULL DEFAULT FALSE,
    smtp_user         TEXT,
    from_name         TEXT NOT NULL DEFAULT 'Arashi OPS',
    from_email        TEXT NOT NULL DEFAULT 'noreply@arashi.io',
    is_active         BOOLEAN NOT NULL DEFAULT FALSE,
    last_test_at      TIMESTAMPTZ,
    last_test_success BOOLEAN,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── email_logs ────────────────────────────────────────────────────────────────
await run("email_logs table", () => sql`
  CREATE TABLE IF NOT EXISTS email_logs (
    id            SERIAL PRIMARY KEY,
    recipient     TEXT NOT NULL,
    subject       TEXT NOT NULL,
    template      TEXT,
    status        TEXT NOT NULL DEFAULT 'Sent',
    provider      TEXT,
    error_message TEXT,
    metadata      TEXT,
    sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── apollo_leads ──────────────────────────────────────────────────────────────
await run("apollo_leads table", () => sql`
  CREATE TABLE IF NOT EXISTS apollo_leads (
    id           SERIAL PRIMARY KEY,
    client_id    INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    name         TEXT NOT NULL,
    company      TEXT,
    title        TEXT,
    email        TEXT,
    linkedin_url TEXT,
    industry     TEXT,
    company_size TEXT,
    location     TEXT,
    source       TEXT NOT NULL DEFAULT 'apollo',
    apollo_id    TEXT UNIQUE,
    import_date  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    job_id       INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── instantly_campaigns ───────────────────────────────────────────────────────
await run("instantly_campaigns table", () => sql`
  CREATE TABLE IF NOT EXISTS instantly_campaigns (
    id               SERIAL PRIMARY KEY,
    campaign_id      TEXT UNIQUE NOT NULL,
    name             TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'Active',
    sent             INTEGER NOT NULL DEFAULT 0,
    opened           INTEGER NOT NULL DEFAULT 0,
    replied          INTEGER NOT NULL DEFAULT 0,
    positive_replies INTEGER NOT NULL DEFAULT 0,
    meetings_booked  INTEGER NOT NULL DEFAULT 0,
    last_sync        TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── crm_contacts ──────────────────────────────────────────────────────────────
await run("crm_contacts table", () => sql`
  CREATE TABLE IF NOT EXISTS crm_contacts (
    id          SERIAL PRIMARY KEY,
    source      TEXT NOT NULL,
    external_id TEXT NOT NULL,
    name        TEXT,
    email       TEXT,
    company     TEXT,
    title       TEXT,
    phone       TEXT,
    client_id   INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    deal_id     INTEGER REFERENCES deals(id) ON DELETE SET NULL,
    last_sync   TIMESTAMPTZ,
    metadata    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source, external_id)
  )
`);

// ── crm_deals ─────────────────────────────────────────────────────────────────
await run("crm_deals table", () => sql`
  CREATE TABLE IF NOT EXISTS crm_deals (
    id          SERIAL PRIMARY KEY,
    source      TEXT NOT NULL,
    external_id TEXT NOT NULL,
    title       TEXT,
    value       DECIMAL(12,2),
    stage       TEXT,
    status      TEXT,
    contact_name TEXT,
    company     TEXT,
    client_id   INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    deal_id     INTEGER REFERENCES deals(id) ON DELETE SET NULL,
    last_sync   TIMESTAMPTZ,
    metadata    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source, external_id)
  )
`);

// ── sync_history ──────────────────────────────────────────────────────────────
await run("sync_history table", () => sql`
  CREATE TABLE IF NOT EXISTS sync_history (
    id                SERIAL PRIMARY KEY,
    integration_id    INTEGER REFERENCES integrations(id) ON DELETE CASCADE,
    operation         TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'Running',
    records_processed INTEGER NOT NULL DEFAULT 0,
    records_created   INTEGER NOT NULL DEFAULT 0,
    records_updated   INTEGER NOT NULL DEFAULT 0,
    error_message     TEXT,
    duration_ms       INTEGER,
    job_id            INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at      TIMESTAMPTZ
  )
`);

// ── integrations: add category column ─────────────────────────────────────────
await run("integrations.category column", () => sql`
  ALTER TABLE integrations ADD COLUMN category TEXT NOT NULL DEFAULT 'other'
`);

await run("set integration categories", () => sql`
  UPDATE integrations SET category = CASE slug
    WHEN 'gmail'     THEN 'email'
    WHEN 'outlook'   THEN 'email'
    WHEN 'hubspot'   THEN 'crm'
    WHEN 'pipedrive' THEN 'crm'
    WHEN 'apollo'    THEN 'prospecting'
    WHEN 'instantly' THEN 'outreach'
    WHEN 'make'      THEN 'automation'
    WHEN 'n8n'       THEN 'automation'
    WHEN 'claude'    THEN 'ai'
    ELSE 'other'
  END
`);

// ── Add SMTP integration ───────────────────────────────────────────────────────
await run("seed smtp integration", () => sql`
  INSERT INTO integrations (name, slug, category) VALUES ('SMTP', 'smtp', 'email')
  ON CONFLICT (slug) DO NOTHING
`);

console.log("\nPhase 8 migration complete.");
