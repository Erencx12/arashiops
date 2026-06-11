/**
 * Centralized environment configuration.
 * All env-var access goes through here — no scattered process.env calls.
 * Missing critical vars are detected at call-time with actionable error messages.
 */

function get(key: string): string | undefined {
  return process.env[key] ?? undefined;
}

function require(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`[config] Required environment variable ${key} is not set`);
  return val;
}

// ─── Database ─────────────────────────────────────────────────────────────────

export const db = {
  url: () => require("DATABASE_URL"),
  isConfigured: () => !!get("DATABASE_URL"),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  sessionSecret: () => require("SESSION_SECRET"),
  isConfigured: () => !!get("SESSION_SECRET"),
};

// ─── AI / Claude ──────────────────────────────────────────────────────────────

export const claude = {
  apiKey: () => require("ANTHROPIC_API_KEY"),
  isConfigured: () => !!get("ANTHROPIC_API_KEY"),

  // Model — override via CLAUDE_MODEL env var, default to sonnet-4-6
  model: () => get("CLAUDE_MODEL") ?? "claude-sonnet-4-6",

  // Pricing per million tokens — override via env for future model changes
  inputCostPerMillion:  () => Number(get("CLAUDE_INPUT_COST_PER_M")  ?? "3.0"),
  outputCostPerMillion: () => Number(get("CLAUDE_OUTPUT_COST_PER_M") ?? "15.0"),

  // Usage controls
  maxTokensDefault:     () => Number(get("CLAUDE_MAX_TOKENS")         ?? "1024"),
  maxMonthlyCostUsd:    () => Number(get("CLAUDE_MAX_MONTHLY_COST")   ?? "0"),   // 0 = unlimited
};

// ─── Stripe ───────────────────────────────────────────────────────────────────

export const stripe = {
  secretKey:      () => get("STRIPE_SECRET_KEY"),
  publishableKey: () => get("STRIPE_PUBLISHABLE_KEY"),
  webhookSecret:  () => get("STRIPE_WEBHOOK_SECRET"),
  isConfigured:   () => !!(get("STRIPE_SECRET_KEY") && get("STRIPE_PUBLISHABLE_KEY")),
  webhookReady:   () => !!(get("STRIPE_SECRET_KEY") && get("STRIPE_PUBLISHABLE_KEY") && get("STRIPE_WEBHOOK_SECRET")),
};

// ─── SMTP / Email ─────────────────────────────────────────────────────────────

export const smtp = {
  host:         () => get("SMTP_HOST"),
  port:         () => Number(get("SMTP_PORT") ?? "587"),
  user:         () => get("SMTP_USER"),
  password:     () => get("SMTP_PASSWORD"),
  fromEmail:    () => get("SMTP_FROM_EMAIL"),
  isConfigured: () => !!(get("SMTP_HOST") && get("SMTP_USER") && get("SMTP_PASSWORD")),
};

// ─── Apollo.io ────────────────────────────────────────────────────────────────

export const apollo = {
  apiKey:       () => get("APOLLO_API_KEY"),
  isConfigured: () => !!get("APOLLO_API_KEY"),
};

// ─── Instantly.ai ─────────────────────────────────────────────────────────────

export const instantly = {
  apiKey:       () => get("INSTANTLY_API_KEY"),
  isConfigured: () => !!get("INSTANTLY_API_KEY"),
};

// ─── HubSpot CRM ─────────────────────────────────────────────────────────────

export const hubspot = {
  apiKey:       () => get("HUBSPOT_API_KEY"),
  isConfigured: () => !!get("HUBSPOT_API_KEY"),
};

// ─── App ──────────────────────────────────────────────────────────────────────

export const app = {
  url:         () => get("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  nodeEnv:     () => get("NODE_ENV") ?? "development",
  isProduction: () => get("NODE_ENV") === "production",
};

// ─── Setup ────────────────────────────────────────────────────────────────────

export const setup = {
  secret: () => get("SETUP_SECRET"),
};

// ─── Validation ───────────────────────────────────────────────────────────────

export type ConfigStatus = {
  key: string;
  label: string;
  configured: boolean;
  required: boolean;
  category: string;
};

/** Returns full status of every known config value — used by /admin/system. */
export function getConfigStatus(): ConfigStatus[] {
  const vars: Array<Omit<ConfigStatus, "configured"> & { envKey: string }> = [
    // Critical
    { key: "DATABASE_URL",             label: "Database URL",             required: true,  category: "Core",  envKey: "DATABASE_URL" },
    { key: "SESSION_SECRET",           label: "Session Secret",           required: true,  category: "Core",  envKey: "SESSION_SECRET" },
    // AI
    { key: "ANTHROPIC_API_KEY",        label: "Anthropic API Key",        required: false, category: "AI",    envKey: "ANTHROPIC_API_KEY" },
    { key: "CLAUDE_MODEL",             label: "Claude Model Override",    required: false, category: "AI",    envKey: "CLAUDE_MODEL" },
    { key: "CLAUDE_MAX_MONTHLY_COST",  label: "Claude Monthly Cost Limit",required: false, category: "AI",    envKey: "CLAUDE_MAX_MONTHLY_COST" },
    // Stripe
    { key: "STRIPE_SECRET_KEY",        label: "Stripe Secret Key",        required: false, category: "Billing", envKey: "STRIPE_SECRET_KEY" },
    { key: "STRIPE_PUBLISHABLE_KEY",   label: "Stripe Publishable Key",   required: false, category: "Billing", envKey: "STRIPE_PUBLISHABLE_KEY" },
    { key: "STRIPE_WEBHOOK_SECRET",    label: "Stripe Webhook Secret",    required: false, category: "Billing", envKey: "STRIPE_WEBHOOK_SECRET" },
    // Email
    { key: "SMTP_HOST",                label: "SMTP Host",                required: false, category: "Email", envKey: "SMTP_HOST" },
    { key: "SMTP_PORT",                label: "SMTP Port",                required: false, category: "Email", envKey: "SMTP_PORT" },
    { key: "SMTP_USER",                label: "SMTP Username",            required: false, category: "Email", envKey: "SMTP_USER" },
    { key: "SMTP_PASSWORD",            label: "SMTP Password",            required: false, category: "Email", envKey: "SMTP_PASSWORD" },
    { key: "SMTP_FROM_EMAIL",          label: "SMTP From Email",          required: false, category: "Email", envKey: "SMTP_FROM_EMAIL" },
    // Integrations
    { key: "APOLLO_API_KEY",           label: "Apollo.io API Key",        required: false, category: "Integrations", envKey: "APOLLO_API_KEY" },
    { key: "INSTANTLY_API_KEY",        label: "Instantly.ai API Key",     required: false, category: "Integrations", envKey: "INSTANTLY_API_KEY" },
    { key: "HUBSPOT_API_KEY",          label: "HubSpot API Key",          required: false, category: "Integrations", envKey: "HUBSPOT_API_KEY" },
    // App
    { key: "NEXT_PUBLIC_APP_URL",      label: "App URL",                  required: false, category: "App",   envKey: "NEXT_PUBLIC_APP_URL" },
    { key: "SETUP_SECRET",             label: "Setup Secret",             required: false, category: "App",   envKey: "SETUP_SECRET" },
  ];

  return vars.map(({ envKey, ...rest }) => ({
    ...rest,
    configured: !!process.env[envKey],
  }));
}

/** Returns the count of critical missing vars — used by health checks. */
export function getCriticalMissingCount(): number {
  return getConfigStatus().filter(s => s.required && !s.configured).length;
}
