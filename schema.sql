-- Meridian Phase 3 Schema
-- Run once against Neon to create all tables

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('owner', 'client')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id            SERIAL PRIMARY KEY,
  company_name  TEXT NOT NULL,
  contact_name  TEXT NOT NULL,
  email         TEXT NOT NULL,
  tier          TEXT NOT NULL CHECK (tier IN ('Silver', 'Gold', 'Platinum')),
  status        TEXT NOT NULL CHECK (status IN ('Active', 'Review', 'Paused', 'Churned')),
  monthly_value INTEGER NOT NULL DEFAULT 0,
  industry      TEXT NOT NULL DEFAULT '',
  owner         TEXT NOT NULL DEFAULT 'Soham Das',
  health_score  INTEGER NOT NULL DEFAULT 80 CHECK (health_score BETWEEN 0 AND 100),
  renewal_date  DATE,
  start_date    DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id         SERIAL PRIMARY KEY,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('Pending', 'Active', 'Review', 'Completed', 'Paused')),
  progress   INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  start_date DATE,
  deadline   DATE,
  agent      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_tasks (
  id           SERIAL PRIMARY KEY,
  agent        TEXT NOT NULL,
  task         TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('Active', 'Completed', 'Review', 'Pending')),
  output       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  reviewed     BOOLEAN NOT NULL DEFAULT FALSE,
  approved     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS approvals (
  id         SERIAL PRIMARY KEY,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agent      TEXT NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Revision Requested', 'Rejected')),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_items (
  id         SERIAL PRIMARY KEY,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('Script', 'Video', 'Asset', 'Report', 'Campaign')),
  title      TEXT NOT NULL,
  size_label TEXT NOT NULL DEFAULT '',
  tags       TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meetings (
  id           SERIAL PRIMARY KEY,
  client_id    INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  type         TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_time TEXT NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('Upcoming', 'Completed', 'Cancelled')),
  notes        TEXT,
  duration     TEXT NOT NULL DEFAULT '45 min',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
  id            SERIAL PRIMARY KEY,
  client_id     INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  tier          TEXT NOT NULL CHECK (tier IN ('Silver', 'Gold', 'Platinum')),
  status        TEXT NOT NULL CHECK (status IN ('Active', 'Draft', 'Expired', 'Pending Signature')),
  signed_date   DATE,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  monthly_value INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id             SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id      INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount         INTEGER NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Overdue', 'Draft')),
  issue_date     DATE NOT NULL,
  due_date       DATE NOT NULL,
  paid_date      DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id              SERIAL PRIMARY KEY,
  client_id       INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  company         TEXT NOT NULL,
  email           TEXT,
  source          TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('Contacted', 'Responded', 'Meeting Booked', 'Qualified', 'Not Qualified', 'Closed Won')),
  estimated_value TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mrr_history (
  id          SERIAL PRIMARY KEY,
  month_label TEXT NOT NULL,
  month_year  TEXT NOT NULL UNIQUE,
  value       INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sales_funnel (
  id         SERIAL PRIMARY KEY,
  stage      TEXT NOT NULL UNIQUE,
  count      INTEGER NOT NULL DEFAULT 0,
  prev_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS activity_log (
  id          SERIAL PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('approval', 'upload', 'meeting', 'client', 'project', 'agent')),
  description TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
