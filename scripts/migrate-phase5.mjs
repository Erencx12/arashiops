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
      console.log(`~ ${label} (already exists, skipped)`);
    } else {
      console.error(`✗ ${label}: ${e.message}`);
    }
  }
}

// ── clients columns ──────────────────────────────────────────────────────────
await run("clients.tags", () => sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`);
await run("clients.contract_status", () => sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS contract_status TEXT`);
await run("clients.internal_notes", () => sql`ALTER TABLE clients ADD COLUMN IF NOT EXISTS internal_notes TEXT`);

// ── projects columns ─────────────────────────────────────────────────────────
await run("projects.priority", () => sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Medium'`);
await run("projects.description", () => sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT`);
await run("projects.assigned_owner", () => sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_owner TEXT`);

// Widen projects.status CHECK constraint to include new statuses
await run("projects.status drop constraint", () => sql`
  ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check
`);
await run("projects.status add constraint", () => sql`
  ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN ('Pending','Active','Completed','Paused','Review','Planning','Waiting On Client','Cancelled'))
`);

// ── content_items columns ────────────────────────────────────────────────────
await run("content_items.status", () => sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Draft'`);
await run("content_items.version", () => sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1`);
await run("content_items.project_id", () => sql`ALTER TABLE content_items ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL`);
await run("content_items.type drop constraint", () => sql`ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_type_check`);

// ── approvals columns ────────────────────────────────────────────────────────
await run("approvals.deliverable_id", () => sql`ALTER TABLE approvals ADD COLUMN IF NOT EXISTS deliverable_id INTEGER REFERENCES content_items(id) ON DELETE SET NULL`);
await run("approvals.client_comment", () => sql`ALTER TABLE approvals ADD COLUMN IF NOT EXISTS client_comment TEXT`);

// ── onboarding_progress ──────────────────────────────────────────────────────
await run("create onboarding_progress", () => sql`
  CREATE TABLE IF NOT EXISTS onboarding_progress (
    id                     SERIAL PRIMARY KEY,
    client_id              INTEGER NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
    status                 TEXT NOT NULL DEFAULT 'Not Started'
                           CHECK (status IN ('Not Started','In Progress','Waiting For Client','Completed')),
    profile_setup          BOOLEAN NOT NULL DEFAULT FALSE,
    business_information   BOOLEAN NOT NULL DEFAULT FALSE,
    icp_information        BOOLEAN NOT NULL DEFAULT FALSE,
    sales_information      BOOLEAN NOT NULL DEFAULT FALSE,
    requirements_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    kickoff_scheduled      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── onboarding_forms ─────────────────────────────────────────────────────────
await run("create onboarding_forms", () => sql`
  CREATE TABLE IF NOT EXISTS onboarding_forms (
    id                       SERIAL PRIMARY KEY,
    client_id                INTEGER NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
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
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── project_milestones ───────────────────────────────────────────────────────
await run("create project_milestones", () => sql`
  CREATE TABLE IF NOT EXISTS project_milestones (
    id          SERIAL PRIMARY KEY,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'Pending'
                CHECK (status IN ('Pending','In Progress','In Review','Completed')),
    due_date    DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── tasks ────────────────────────────────────────────────────────────────────
await run("create tasks", () => sql`
  CREATE TABLE IF NOT EXISTS tasks (
    id          SERIAL PRIMARY KEY,
    client_id   INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    project_id  INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    description TEXT,
    priority    TEXT NOT NULL DEFAULT 'Medium'
                CHECK (priority IN ('Low','Medium','High','Critical')),
    status      TEXT NOT NULL DEFAULT 'To Do'
                CHECK (status IN ('To Do','In Progress','Review','Completed','Blocked')),
    assignee    TEXT,
    due_date    DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── files ────────────────────────────────────────────────────────────────────
await run("create files", () => sql`
  CREATE TABLE IF NOT EXISTS files (
    id          SERIAL PRIMARY KEY,
    client_id   INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    project_id  INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    name        TEXT NOT NULL,
    url         TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'Document',
    size_bytes  BIGINT,
    uploaded_by TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── notifications ────────────────────────────────────────────────────────────
await run("create notifications", () => sql`
  CREATE TABLE IF NOT EXISTS notifications (
    id         SERIAL PRIMARY KEY,
    type       TEXT NOT NULL,
    title      TEXT NOT NULL,
    message    TEXT,
    client_id  INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ── client_notes ─────────────────────────────────────────────────────────────
await run("create client_notes", () => sql`
  CREATE TABLE IF NOT EXISTS client_notes (
    id         SERIAL PRIMARY KEY,
    client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    type       TEXT NOT NULL DEFAULT 'internal' CHECK (type IN ('internal','external')),
    author     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

console.log("\nPhase 5 migration complete.");
