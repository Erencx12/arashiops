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

// ─── Phase 10: Plans ──────────────────────────────────────────────────────────

await run("Create plans table", () => sql`
  CREATE TABLE plans (
    id               SERIAL PRIMARY KEY,
    name             TEXT NOT NULL,
    slug             TEXT NOT NULL UNIQUE,
    tier             TEXT,
    description      TEXT,
    price_monthly    DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_annual     DECIMAL(10,2),
    features         TEXT[] DEFAULT '{}',
    billing_cycle    TEXT NOT NULL DEFAULT 'monthly',
    status           TEXT NOT NULL DEFAULT 'Active',
    stripe_price_id  TEXT,
    stripe_product_id TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create stripe_customers table", () => sql`
  CREATE TABLE stripe_customers (
    id                  SERIAL PRIMARY KEY,
    client_id           INTEGER NOT NULL REFERENCES clients(id),
    stripe_customer_id  TEXT NOT NULL UNIQUE,
    email               TEXT,
    name                TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create subscriptions table", () => sql`
  CREATE TABLE subscriptions (
    id                      SERIAL PRIMARY KEY,
    client_id               INTEGER NOT NULL REFERENCES clients(id),
    stripe_customer_id      INTEGER REFERENCES stripe_customers(id),
    stripe_subscription_id  TEXT UNIQUE,
    plan_id                 INTEGER REFERENCES plans(id),
    plan_name               TEXT,
    tier                    TEXT,
    status                  TEXT NOT NULL DEFAULT 'Active',
    current_period_start    TIMESTAMPTZ,
    current_period_end      TIMESTAMPTZ,
    trial_end               TIMESTAMPTZ,
    cancel_at               TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,
    mrr                     DECIMAL(10,2),
    arr                     DECIMAL(10,2),
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create refunds table", () => sql`
  CREATE TABLE refunds (
    id               SERIAL PRIMARY KEY,
    payment_id       INTEGER REFERENCES payments(id),
    client_id        INTEGER REFERENCES clients(id),
    stripe_refund_id TEXT,
    amount           DECIMAL(10,2) NOT NULL,
    currency         TEXT NOT NULL DEFAULT 'usd',
    reason           TEXT,
    status           TEXT NOT NULL DEFAULT 'Pending',
    processed_by     TEXT,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create billing_events table", () => sql`
  CREATE TABLE billing_events (
    id               SERIAL PRIMARY KEY,
    stripe_event_id  TEXT UNIQUE,
    event_type       TEXT NOT NULL,
    payload          TEXT,
    processed        BOOLEAN NOT NULL DEFAULT FALSE,
    error_message    TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create plan_changes table", () => sql`
  CREATE TABLE plan_changes (
    id               SERIAL PRIMARY KEY,
    client_id        INTEGER NOT NULL REFERENCES clients(id),
    subscription_id  INTEGER REFERENCES subscriptions(id),
    from_plan_id     INTEGER REFERENCES plans(id),
    to_plan_id       INTEGER REFERENCES plans(id),
    from_tier        TEXT,
    to_tier          TEXT,
    change_type      TEXT NOT NULL DEFAULT 'upgrade',
    effective_date   DATE,
    reason           TEXT,
    revenue_impact   DECIMAL(10,2),
    created_by       TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

await run("Create billing_renewal_history table", () => sql`
  CREATE TABLE billing_renewal_history (
    id               SERIAL PRIMARY KEY,
    client_id        INTEGER NOT NULL REFERENCES clients(id),
    subscription_id  INTEGER REFERENCES subscriptions(id),
    renewal_date     DATE NOT NULL,
    status           TEXT NOT NULL DEFAULT 'Renewed',
    amount           DECIMAL(10,2),
    stripe_invoice_id TEXT,
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// ─── Extend payments table with Stripe fields ─────────────────────────────────

await run("Add stripe_payment_intent_id to payments", () =>
  sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT`
);
await run("Add stripe_charge_id to payments", () =>
  sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT`
);
await run("Add currency to payments", () =>
  sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd'`
);
await run("Add billing_status to payments", () =>
  sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'Paid'`
);

// ─── Seed plans ───────────────────────────────────────────────────────────────

await run("Seed default plans", () => sql`
  INSERT INTO plans (name, slug, tier, description, price_monthly, price_annual, features, billing_cycle, status)
  VALUES
    ('Silver',     'silver',     'Silver',     'Starter plan for growing agencies',          1500, 15000, ARRAY['Up to 5 clients', 'Core deliverables', 'Email support', 'Basic reporting'],                                                                         'monthly', 'Active'),
    ('Gold',       'gold',       'Gold',       'Professional plan for established agencies', 4500, 45000, ARRAY['Up to 15 clients', 'Advanced analytics', 'Priority support', 'CRM integration', 'Apollo & Instantly'],                                              'monthly', 'Active'),
    ('Platinum',   'platinum',   'Platinum',   'High-growth plan for scaling agencies',      7500, 75000, ARRAY['Up to 30 clients', 'Full integrations', 'Dedicated CSM', 'AI insights', 'Revenue dashboard'],                                                       'monthly', 'Active'),
    ('Enterprise', 'enterprise', 'Enterprise', 'Full-scale enterprise revenue operations',   9000, 90000, ARRAY['Unlimited clients', 'Custom reporting', 'Dedicated support', 'Full AI suite', 'White-label portal', 'SLA guarantee'],                              'monthly', 'Active'),
    ('Custom',     'custom',     'Custom',     'Custom pricing for unique requirements',         0,  null, ARRAY['Tailored to your needs', 'Custom integrations', 'Custom SLA', 'Volume pricing'],                                                                   'monthly', 'Active')
  ON CONFLICT (slug) DO NOTHING
`);

// ─── Seed subscriptions for existing clients ──────────────────────────────────

await run("Seed subscriptions for existing clients", () => sql`
  INSERT INTO subscriptions (client_id, plan_id, plan_name, tier, status, current_period_start, current_period_end, mrr, arr)
  SELECT
    c.id,
    p.id,
    p.name,
    c.tier,
    'Active',
    NOW() - INTERVAL '15 days',
    NOW() + INTERVAL '15 days',
    c.monthly_value,
    c.monthly_value * 12
  FROM clients c
  JOIN plans p ON LOWER(p.name) = LOWER(c.tier)
  WHERE c.status = 'Active'
    AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.client_id = c.id)
`);

console.log("\n✅ Phase 10 migration complete.");
