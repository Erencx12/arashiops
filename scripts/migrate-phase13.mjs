import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function run(label, fn) {
  try {
    await fn();
    console.log("✓", label);
  } catch (e) {
    if (e.message.includes("already exists") || e.message.includes("duplicate column")) {
      console.log("~", label, "(already exists)");
    } else {
      console.error("✗", label, e.message);
    }
  }
}

async function migrate() {
  console.log("Phase 13 migration starting...\n");

  // ─── payment_providers table ─────────────────────────────────────────────────

  await run("Create payment_providers", () => sql.query(`
    CREATE TABLE IF NOT EXISTS payment_providers (
      id             SERIAL PRIMARY KEY,
      name           TEXT NOT NULL UNIQUE,
      display_name   TEXT NOT NULL,
      status         TEXT NOT NULL DEFAULT 'active',
      enabled        BOOLEAN NOT NULL DEFAULT false,
      sandbox_mode   BOOLEAN NOT NULL DEFAULT false,
      api_configured BOOLEAN NOT NULL DEFAULT false,
      is_default     BOOLEAN NOT NULL DEFAULT false,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `));

  // ─── provider columns on billing tables ──────────────────────────────────────

  await run("Add provider to subscriptions", () => sql.query(`
    ALTER TABLE subscriptions
      ADD COLUMN IF NOT EXISTS provider           TEXT DEFAULT 'stripe',
      ADD COLUMN IF NOT EXISTS provider_reference TEXT,
      ADD COLUMN IF NOT EXISTS provider_status    TEXT
  `));

  await run("Add provider to payments", () => sql.query(`
    ALTER TABLE payments
      ADD COLUMN IF NOT EXISTS provider           TEXT DEFAULT 'stripe',
      ADD COLUMN IF NOT EXISTS provider_reference TEXT,
      ADD COLUMN IF NOT EXISTS provider_status    TEXT
  `));

  await run("Add provider to refunds", () => sql.query(`
    ALTER TABLE refunds
      ADD COLUMN IF NOT EXISTS provider           TEXT DEFAULT 'stripe',
      ADD COLUMN IF NOT EXISTS provider_reference TEXT,
      ADD COLUMN IF NOT EXISTS provider_status    TEXT
  `));

  // ─── seed providers ───────────────────────────────────────────────────────────

  const rows = await sql.query(`SELECT COUNT(*) AS cnt FROM payment_providers`);
  if (Number(rows[0].cnt) === 0) {
    await run("Seed payment providers", () => sql.query(`
      INSERT INTO payment_providers (name, display_name, status, enabled, is_default) VALUES
      ('stripe',  'Stripe',          'active',       true,  true),
      ('manual',  'Manual Invoice',  'active',       true,  false),
      ('razorpay','Razorpay',        'coming_soon',  false, false),
      ('paypal',  'PayPal',          'coming_soon',  false, false),
      ('wise',    'Wise',            'coming_soon',  false, false)
    `));
  } else {
    console.log("~ Seed payment providers (already seeded)");
  }

  console.log("\nPhase 13 migration complete!");
}

migrate().catch(console.error);
