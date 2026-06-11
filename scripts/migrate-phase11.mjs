import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const steps = [
  // ─── Audit logs ───────────────────────────────────────────────────────────
  [
    "Create audit_logs table",
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id           SERIAL PRIMARY KEY,
      action       VARCHAR(120) NOT NULL,
      actor_id     INTEGER,
      actor_email  VARCHAR(255),
      actor_role   VARCHAR(50),
      target_type  VARCHAR(100),
      target_id    INTEGER,
      details      JSONB,
      ip_address   VARCHAR(100),
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )`,
  ],

  // ─── Error logs ───────────────────────────────────────────────────────────
  [
    "Create error_logs table",
    `CREATE TABLE IF NOT EXISTS error_logs (
      id           SERIAL PRIMARY KEY,
      error_type   VARCHAR(100) NOT NULL,
      message      TEXT NOT NULL,
      stack        TEXT,
      context      JSONB,
      resolved     BOOLEAN DEFAULT FALSE,
      resolved_at  TIMESTAMPTZ,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )`,
  ],

  // ─── Health check results ─────────────────────────────────────────────────
  [
    "Create health_check_results table",
    `CREATE TABLE IF NOT EXISTS health_check_results (
      id               SERIAL PRIMARY KEY,
      service          VARCHAR(100) NOT NULL,
      status           VARCHAR(50)  NOT NULL,
      message          TEXT,
      response_time_ms INTEGER,
      checked_at       TIMESTAMPTZ DEFAULT NOW()
    )`,
  ],

  // ─── Indexes: existing tables ─────────────────────────────────────────────
  ["Index clients(status)", "CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status)"],
  ["Index clients(tier)", "CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(tier)"],
  ["Index projects(client_id)", "CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id)"],
  ["Index projects(status)", "CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)"],
  ["Index invoices(client_id)", "CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id)"],
  ["Index invoices(status)", "CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)"],
  ["Index payments(client_id)", "CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id)"],
  ["Index payments(payment_date)", "CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date)"],
  ["Index subscriptions(client_id)", "CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id)"],
  ["Index subscriptions(status)", "CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)"],
  ["Index jobs(status)", "CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)"],
  ["Index jobs(created_at)", "CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC)"],
  ["Index system_logs(level)", "CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level)"],
  ["Index system_logs(created_at)", "CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC)"],
  ["Index system_logs(module)", "CREATE INDEX IF NOT EXISTS idx_system_logs_module ON system_logs(module)"],
  ["Index notifications(read_at)", "CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at) WHERE read_at IS NULL"],
  ["Index ai_jobs(status)", "CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status)"],
  ["Index ai_jobs(created_at)", "CREATE INDEX IF NOT EXISTS idx_ai_jobs_created_at ON ai_jobs(created_at DESC)"],

  // ─── Indexes: new tables ──────────────────────────────────────────────────
  ["Index audit_logs(action)", "CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)"],
  ["Index audit_logs(actor_id)", "CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id)"],
  ["Index audit_logs(created_at)", "CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)"],
  ["Index error_logs(error_type)", "CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type)"],
  ["Index error_logs(resolved)", "CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved ON error_logs(resolved) WHERE resolved = FALSE"],
  ["Index error_logs(created_at)", "CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC)"],
  ["Index health_check_results(service)", "CREATE INDEX IF NOT EXISTS idx_health_service ON health_check_results(service, checked_at DESC)"],
];

let pass = 0;
let fail = 0;

for (const [label, query] of steps) {
  try {
    await sql.query(query);
    console.log(`✓ ${label}`);
    pass++;
  } catch (err) {
    console.error(`✗ ${label}: ${err.message}`);
    fail++;
  }
}

console.log(`\n${fail === 0 ? "✅" : "⚠️"} Phase 11 migration complete — ${pass} passed, ${fail} failed.`);
