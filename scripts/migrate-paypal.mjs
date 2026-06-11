import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function run(label, fn) {
  try {
    await fn();
    console.log(`✓ ${label}`);
  } catch (err) {
    const msg = err.message ?? "";
    if (msg.includes("already exists") || msg.includes("does not exist")) {
      console.log(`~ ${label} (skipped)`);
    } else {
      console.error(`✗ ${label}:`, msg);
    }
  }
}

async function main() {
  console.log("PayPal migration starting...\n");

  await run("Add paypal_plan_id to plans",    () =>
    sql.query(`ALTER TABLE plans ADD COLUMN IF NOT EXISTS paypal_plan_id TEXT`)
  );

  await run("Add paypal_product_id to plans", () =>
    sql.query(`ALTER TABLE plans ADD COLUMN IF NOT EXISTS paypal_product_id TEXT`)
  );

  await run("Set PayPal as active + default", () =>
    sql.query(`
      UPDATE payment_providers
      SET status = 'active', enabled = true, is_default = true, updated_at = NOW()
      WHERE name = 'paypal'
    `)
  );

  await run("Remove Stripe as default", () =>
    sql.query(`
      UPDATE payment_providers
      SET is_default = false, updated_at = NOW()
      WHERE name = 'stripe'
    `)
  );

  console.log("\nPayPal migration complete!");
}

main().catch(console.error);
