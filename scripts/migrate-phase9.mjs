import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function run(label, fn) {
  try {
    await fn();
    console.log(`✓ ${label}`);
  } catch (err) {
    if (err.message?.includes("already exists")) {
      console.log(`– ${label} (already exists)`);
    } else {
      console.error(`✗ ${label}:`, err.message);
      throw err;
    }
  }
}

// ─── Phase 9: Claude Intelligence Layer ───────────────────────────────────────

await run("Create ai_prompts table", () => sql`
  CREATE TABLE ai_prompts (
    id           SERIAL PRIMARY KEY,
    name         TEXT NOT NULL,
    category     TEXT NOT NULL,
    description  TEXT,
    prompt       TEXT NOT NULL,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    is_default   BOOLEAN NOT NULL DEFAULT FALSE,
    version      INTEGER NOT NULL DEFAULT 1,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create lead_scores table", () => sql`
  CREATE TABLE lead_scores (
    id             SERIAL PRIMARY KEY,
    apollo_lead_id INTEGER REFERENCES apollo_leads(id) ON DELETE CASCADE,
    score          TEXT NOT NULL,
    confidence     INTEGER,
    reason         TEXT,
    model          TEXT,
    tokens_input   INTEGER,
    tokens_output  INTEGER,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create reply_classifications table", () => sql`
  CREATE TABLE reply_classifications (
    id             SERIAL PRIMARY KEY,
    campaign_id    TEXT,
    reply_id       TEXT,
    contact_name   TEXT,
    contact_email  TEXT,
    reply_text     TEXT,
    classification TEXT NOT NULL,
    confidence     INTEGER,
    reason         TEXT,
    model          TEXT,
    tokens_input   INTEGER,
    tokens_output  INTEGER,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create research_reports table", () => sql`
  CREATE TABLE research_reports (
    id               SERIAL PRIMARY KEY,
    report_type      TEXT NOT NULL,
    subject_name     TEXT NOT NULL,
    subject_company  TEXT,
    input_data       TEXT,
    report_markdown  TEXT NOT NULL,
    model            TEXT,
    tokens_input     INTEGER,
    tokens_output    INTEGER,
    client_id        INTEGER REFERENCES clients(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create ai_insights table", () => sql`
  CREATE TABLE ai_insights (
    id               SERIAL PRIMARY KEY,
    insight_type     TEXT NOT NULL,
    title            TEXT NOT NULL,
    subject_id       INTEGER,
    subject_name     TEXT,
    input_data       TEXT,
    insight_markdown TEXT NOT NULL,
    model            TEXT,
    tokens_input     INTEGER,
    tokens_output    INTEGER,
    client_id        INTEGER REFERENCES clients(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create ai_usage table", () => sql`
  CREATE TABLE ai_usage (
    id               SERIAL PRIMARY KEY,
    task_type        TEXT NOT NULL,
    model            TEXT NOT NULL,
    tokens_input     INTEGER NOT NULL DEFAULT 0,
    tokens_output    INTEGER NOT NULL DEFAULT 0,
    cost_usd         DECIMAL(10, 6),
    response_time_ms INTEGER,
    client_id        INTEGER REFERENCES clients(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create ai_jobs table", () => sql`
  CREATE TABLE ai_jobs (
    id           SERIAL PRIMARY KEY,
    job_id       INTEGER REFERENCES jobs(id),
    task_type    TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'Queued',
    subject_id   INTEGER,
    subject_type TEXT,
    subject_name TEXT,
    result_id    INTEGER,
    result_type  TEXT,
    error_message TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
  )
`);

// ─── Seed default prompts ─────────────────────────────────────────────────────

await run("Seed default AI prompts", () => sql`
  INSERT INTO ai_prompts (name, category, description, prompt, is_default) VALUES
  (
    'Lead Qualification',
    'lead_scoring',
    'Score a B2B outbound lead as Hot, Warm, Cold, or Disqualified',
    'You are a B2B lead qualification expert for a revenue operations agency. Given lead data, score the lead and explain why.

Scoring criteria:
- Hot: Decision maker, budget authority, clear pain, relevant industry, company size 50-5000 employees
- Warm: Relevant role, relevant industry, some signals of fit, but incomplete data
- Cold: Relevant industry but junior role, missing contact info, or small company
- Disqualified: Wrong industry, student, job seeker, no company, or clearly no fit

Respond ONLY with valid JSON in this exact format:
{"score":"Hot|Warm|Cold|Disqualified","confidence":0-100,"reason":"one concise sentence explaining the score"}',
    TRUE
  ),
  (
    'Prospect Research',
    'research',
    'Generate a full prospect profile from name, title, and company',
    'You are a B2B sales researcher. Generate a concise prospect research report in markdown.

Include sections:
## Professional Background
## Company Overview
## Likely Pain Points
## Conversation Starters
## Red Flags (if any)

Keep the report under 400 words. Be specific and actionable. Do not invent facts — use only what is provided and reasonable inference from role/industry.',
    TRUE
  ),
  (
    'Account Research',
    'research',
    'Generate a company-level analysis for prospecting',
    'You are a B2B account researcher. Generate a concise account research report in markdown.

Include sections:
## Company Overview
## Business Model & Revenue
## Tech Stack Signals
## Key Decision Makers (infer from industry norms)
## Outreach Angle

Keep the report under 400 words. Be specific and actionable.',
    TRUE
  ),
  (
    'Discovery Call Summary',
    'research',
    'Convert raw discovery call notes into a structured summary',
    'You are a revenue operations expert. Convert the provided discovery call notes into a structured summary in markdown.

Include sections:
## Key Pain Points
## Current Situation
## Requirements
## Budget & Timeline
## Decision Process
## Recommended Next Step
## Risk Factors

Be concise. Extract only what was stated or clearly implied.',
    TRUE
  ),
  (
    'Campaign Analysis',
    'analysis',
    'Analyze Instantly email campaign performance and provide recommendations',
    'You are an outbound email campaign expert. Analyze the provided campaign metrics and generate a performance report in markdown.

Include sections:
## Performance Summary
## Open Rate Analysis
## Reply Rate Analysis
## Key Observations
## Recommendations (3 specific, actionable improvements)

Use industry benchmarks: open rate >40% excellent, >25% good; reply rate >5% excellent, >2% good.',
    TRUE
  ),
  (
    'ICP Profile',
    'analysis',
    'Generate an Ideal Customer Profile from scored lead data',
    'You are a revenue operations strategist. Analyze the provided lead data (Hot and Warm leads) and generate an Ideal Customer Profile in markdown.

Include sections:
## Firmographic Profile (company size, industry, geography)
## Contact Profile (typical title, seniority, department)
## Common Pain Points
## Buying Signals
## Channels & Messaging That Work
## Anti-ICP (who to avoid)

Base everything on patterns in the data, not assumptions.',
    TRUE
  ),
  (
    'Client Business Summary',
    'analysis',
    'Generate a monthly client performance summary for review',
    'You are a client success manager. Generate a concise monthly summary for a client account in markdown.

Include sections:
## Account Health
## Deliverables This Period
## Lead & Campaign Performance
## Key Wins
## Risks & Blockers
## Recommended Focus for Next Month

Keep it under 300 words. Be direct and client-ready.',
    TRUE
  ),
  (
    'Reply Classification',
    'classification',
    'Classify email reply intent for automated triage',
    'You are an outbound sales expert. Classify the intent of the provided email reply.

Categories:
- Interested: Shows genuine interest in learning more
- Meeting Requested: Explicitly asks for a call or meeting
- Follow Up Later: Not now but open to future contact
- Not Interested: Clear rejection
- Wrong Contact: Forwarded to someone else or wrong person
- Out Of Office: Auto-reply or OOO message
- Spam: Bounce, spam filter, or irrelevant

Respond ONLY with valid JSON:
{"classification":"category","confidence":0-100,"reason":"one sentence"}',
    TRUE
  )
  ON CONFLICT DO NOTHING
`);

console.log("\n✅ Phase 9 migration complete.");
