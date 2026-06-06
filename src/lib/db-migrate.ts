import { sql } from "./db";

export async function runMigrations(): Promise<{ ok: boolean; message: string }> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          TEXT        NOT NULL,
        email         TEXT        UNIQUE NOT NULL,
        password_hash TEXT        NOT NULL,
        role          TEXT        NOT NULL DEFAULT 'client'
                                  CHECK (role IN ('owner', 'client')),
        client_id     INTEGER     REFERENCES clients(id) ON DELETE SET NULL,
        status        TEXT        NOT NULL DEFAULT 'invited'
                                  CHECK (status IN ('active', 'invited', 'suspended')),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login    TIMESTAMPTZ
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS invite_tokens (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT        UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used       BOOLEAN     NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT        UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used       BOOLEAN     NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    return { ok: true, message: "Phase 4 migrations applied." };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message };
  }
}

export async function runPhase5Migrations(): Promise<{ ok: boolean; message: string }> {
  const errors: string[] = [];

  const run = async (label: string, fn: () => Promise<unknown>) => {
    try { await fn(); } catch (err) {
      errors.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // ── New tables ────────────────────────────────────────────────────────────

  await run("onboarding_forms", () => sql`
    CREATE TABLE IF NOT EXISTS onboarding_forms (
      id                       SERIAL PRIMARY KEY,
      client_id                INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      company_name             TEXT,
      industry                 TEXT,
      website                  TEXT,
      target_market            TEXT,
      ideal_customer_profile   TEXT,
      average_deal_size        TEXT,
      current_crm              TEXT,
      sales_team_size          TEXT,
      current_outreach_process TEXT,
      business_goals           TEXT,
      monthly_revenue_range    TEXT,
      primary_challenges       TEXT,
      additional_notes         TEXT,
      submitted_at             TIMESTAMPTZ,
      created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await run("onboarding_progress", () => sql`
    CREATE TABLE IF NOT EXISTS onboarding_progress (
      id                    SERIAL PRIMARY KEY,
      client_id             INTEGER NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
      status                TEXT    NOT NULL DEFAULT 'Pending',
      profile_setup         BOOLEAN NOT NULL DEFAULT FALSE,
      business_information  BOOLEAN NOT NULL DEFAULT FALSE,
      icp_information       BOOLEAN NOT NULL DEFAULT FALSE,
      sales_information     BOOLEAN NOT NULL DEFAULT FALSE,
      requirements_submitted BOOLEAN NOT NULL DEFAULT FALSE,
      kickoff_scheduled     BOOLEAN NOT NULL DEFAULT FALSE,
      completed_at          TIMESTAMPTZ,
      created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await run("project_milestones", () => sql`
    CREATE TABLE IF NOT EXISTS project_milestones (
      id           SERIAL PRIMARY KEY,
      project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title        TEXT    NOT NULL,
      description  TEXT,
      due_date     DATE,
      status       TEXT    NOT NULL DEFAULT 'Pending',
      completed_at TIMESTAMPTZ,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await run("tasks", () => sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id           SERIAL PRIMARY KEY,
      title        TEXT    NOT NULL,
      description  TEXT,
      priority     TEXT    NOT NULL DEFAULT 'Medium',
      status       TEXT    NOT NULL DEFAULT 'To Do',
      assignee     TEXT,
      client_id    INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      project_id   INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      due_date     DATE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `);

  await run("files", () => sql`
    CREATE TABLE IF NOT EXISTS files (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      file_type   TEXT NOT NULL DEFAULT 'Other',
      size_label  TEXT NOT NULL DEFAULT '',
      url         TEXT,
      client_id   INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      project_id  INTEGER REFERENCES projects(id) ON DELETE SET NULL,
      uploaded_by TEXT NOT NULL DEFAULT 'Owner',
      version     TEXT NOT NULL DEFAULT '1.0',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await run("notifications", () => sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id         SERIAL PRIMARY KEY,
      type       TEXT    NOT NULL,
      title      TEXT    NOT NULL,
      message    TEXT    NOT NULL,
      client_id  INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      read       BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await run("client_notes", () => sql`
    CREATE TABLE IF NOT EXISTS client_notes (
      id          SERIAL PRIMARY KEY,
      client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      content     TEXT    NOT NULL,
      is_internal BOOLEAN NOT NULL DEFAULT TRUE,
      created_by  TEXT    NOT NULL DEFAULT 'Owner',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // ── Column extensions ─────────────────────────────────────────────────────

  await run("projects.priority",       () => sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Medium'`);
  await run("projects.description",    () => sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT`);
  await run("projects.assigned_owner", () => sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_owner TEXT DEFAULT 'Soham Das'`);

  // Widen project status constraint to include new statuses
  await run("projects status constraint drop",   () => sql`ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check`);
  await run("projects status constraint add",    () => sql`ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('Pending','Planning','Active','Review','Waiting On Client','Completed','Paused','Cancelled'))`);

  await run("content_items.status",     () => sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Awaiting Approval'`);
  await run("content_items.version",    () => sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT '1.0'`);
  await run("content_items.project_id", () => sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL`);

  // Widen content_items type constraint
  await run("content_items type constraint drop", () => sql`ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_type_check`);

  await run("clients.tags",             () => sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}'`);
  await run("clients.contract_status",  () => sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_status TEXT DEFAULT 'Active'`);
  await run("clients.internal_notes",   () => sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS internal_notes TEXT`);

  await run("approvals.deliverable_id", () => sql`ALTER TABLE approvals ADD COLUMN IF NOT EXISTS deliverable_id INTEGER REFERENCES content_items(id) ON DELETE SET NULL`);
  await run("approvals.client_comment", () => sql`ALTER TABLE approvals ADD COLUMN IF NOT EXISTS client_comment TEXT`);

  if (errors.length > 0) {
    console.warn("[phase5 migration] Some steps had errors:", errors);
  }

  return {
    ok: true,
    message: `Phase 5 migrations applied. ${errors.length > 0 ? `${errors.length} non-fatal warnings.` : "All clean."}`,
  };
}

export async function runPhase6Migrations(): Promise<{ ok: boolean; message: string }> {
  const errors: string[] = [];

  const run = async (label: string, fn: () => Promise<unknown>) => {
    try { await fn(); } catch (err) {
      errors.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // ── deals ─────────────────────────────────────────────────────────────────
  await run("deals", () => sql`
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

  // ── discovery_calls ───────────────────────────────────────────────────────
  await run("discovery_calls", () => sql`
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

  // ── proposals ─────────────────────────────────────────────────────────────
  await run("proposals", () => sql`
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

  // ── payments ──────────────────────────────────────────────────────────────
  await run("payments", () => sql`
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

  // ── renewals ──────────────────────────────────────────────────────────────
  await run("renewals", () => sql`
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

  // ── extend contracts ──────────────────────────────────────────────────────
  await run("contracts.deal_id",         () => sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL`);
  await run("contracts.proposal_id",     () => sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS proposal_id INTEGER REFERENCES proposals(id) ON DELETE SET NULL`);
  await run("contracts.contract_number", () => sql`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_number TEXT`);
  await run("contracts status drop",     () => sql`ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_status_check`);
  await run("contracts status add",      () => sql`ALTER TABLE contracts ADD CONSTRAINT contracts_status_check CHECK (status IN ('Draft','Sent','Signed','Active','Expired','Cancelled','Pending Signature'))`);

  // ── extend invoices ───────────────────────────────────────────────────────
  await run("invoices.deal_id",     () => sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deal_id INTEGER REFERENCES deals(id) ON DELETE SET NULL`);
  await run("invoices.proposal_id", () => sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS proposal_id INTEGER REFERENCES proposals(id) ON DELETE SET NULL`);
  await run("invoices.description", () => sql`ALTER TABLE invoices ADD COLUMN IF NOT EXISTS description TEXT`);
  await run("invoices status drop", () => sql`ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check`);
  await run("invoices status add",  () => sql`ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('Draft','Sent','Paid','Partially Paid','Overdue','Cancelled'))`);

  // ── extend activity_log type constraint ───────────────────────────────────
  await run("activity_log type drop", () => sql`ALTER TABLE activity_log DROP CONSTRAINT IF EXISTS activity_log_type_check`);

  if (errors.length > 0) {
    console.warn("[phase6 migration] Some steps had errors:", errors);
  }

  return {
    ok: true,
    message: `Phase 6 migrations applied. ${errors.length > 0 ? `${errors.length} non-fatal warnings.` : "All clean."}`,
  };
}
