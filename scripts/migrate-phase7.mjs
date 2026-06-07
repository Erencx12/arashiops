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
    if (e.message?.includes("already exists") || e.message?.includes("duplicate column")) {
      console.log(`~ ${label} (skipped: already exists)`);
    } else {
      console.error(`✗ ${label}: ${e.message}`);
    }
  }
}

// ── integrations ──────────────────────────────────────────────────────────────
await run("integrations table", () => sql`
  CREATE TABLE IF NOT EXISTS integrations (
    id           SERIAL PRIMARY KEY,
    name         TEXT NOT NULL,
    slug         TEXT UNIQUE NOT NULL,
    status       TEXT NOT NULL DEFAULT 'Disconnected',
    enabled      BOOLEAN NOT NULL DEFAULT FALSE,
    last_sync    TIMESTAMPTZ,
    last_error   TEXT,
    health_score INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── seed integration services ─────────────────────────────────────────────────
const services = [
  ["Apollo",    "apollo"],
  ["Instantly", "instantly"],
  ["Claude",    "claude"],
  ["HubSpot",   "hubspot"],
  ["Pipedrive", "pipedrive"],
  ["Gmail",     "gmail"],
  ["Outlook",   "outlook"],
  ["Make.com",  "make"],
  ["n8n",       "n8n"],
];
for (const [name, slug] of services) {
  await run(`seed ${slug}`, () => sql`
    INSERT INTO integrations (name, slug) VALUES (${name}, ${slug})
    ON CONFLICT (slug) DO NOTHING
  `);
}

// ── integration_credentials ───────────────────────────────────────────────────
await run("integration_credentials table", () => sql`
  CREATE TABLE IF NOT EXISTS integration_credentials (
    id             SERIAL PRIMARY KEY,
    integration_id INTEGER REFERENCES integrations(id) ON DELETE CASCADE,
    service        TEXT NOT NULL,
    key_label      TEXT NOT NULL,
    key_masked     TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'active',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── webhooks ──────────────────────────────────────────────────────────────────
await run("webhooks table", () => sql`
  CREATE TABLE IF NOT EXISTS webhooks (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    source        TEXT NOT NULL,
    endpoint      TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'Active',
    secret        TEXT,
    last_trigger  TIMESTAMPTZ,
    trigger_count INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── webhook_logs ──────────────────────────────────────────────────────────────
await run("webhook_logs table", () => sql`
  CREATE TABLE IF NOT EXISTS webhook_logs (
    id              SERIAL PRIMARY KEY,
    webhook_id      INTEGER REFERENCES webhooks(id) ON DELETE SET NULL,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source          TEXT,
    payload_size    INTEGER NOT NULL DEFAULT 0,
    response_status INTEGER,
    success         BOOLEAN NOT NULL DEFAULT TRUE,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    error_message   TEXT
  )
`);

// ── jobs ──────────────────────────────────────────────────────────────────────
await run("jobs table", () => sql`
  CREATE TABLE IF NOT EXISTS jobs (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    source        TEXT,
    client_id     INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    status        TEXT NOT NULL DEFAULT 'Queued',
    queue_type    TEXT NOT NULL DEFAULT 'incoming',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at    TIMESTAMPTZ,
    completed_at  TIMESTAMPTZ,
    duration_ms   INTEGER,
    error_message TEXT,
    retry_count   INTEGER NOT NULL DEFAULT 0,
    max_retries   INTEGER NOT NULL DEFAULT 3,
    payload       TEXT
  )
`);

// ── system_logs ───────────────────────────────────────────────────────────────
await run("system_logs table", () => sql`
  CREATE TABLE IF NOT EXISTS system_logs (
    id          SERIAL PRIMARY KEY,
    event_type  TEXT NOT NULL DEFAULT 'system',
    level       TEXT NOT NULL DEFAULT 'info',
    message     TEXT NOT NULL,
    module      TEXT,
    client_id   INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    job_id      INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    webhook_id  INTEGER REFERENCES webhooks(id) ON DELETE SET NULL,
    metadata    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── queue_items ───────────────────────────────────────────────────────────────
await run("queue_items table", () => sql`
  CREATE TABLE IF NOT EXISTS queue_items (
    id           SERIAL PRIMARY KEY,
    queue_type   TEXT NOT NULL DEFAULT 'incoming',
    job_id       INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    status       TEXT NOT NULL DEFAULT 'pending',
    payload      TEXT,
    scheduled_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

console.log("\nPhase 7 migration complete.");
