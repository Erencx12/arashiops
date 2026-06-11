import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function run(label, fn) {
  try {
    await fn();
    console.log(`✓ ${label}`);
  } catch (err) {
    console.error(`✗ ${label}:`, err.message ?? err);
  }
}

async function main() {
  console.log("Removing Platinum plan...\n");

  // Show current plans first
  const plans = await sql.query(`SELECT id, name, slug, tier, status FROM plans ORDER BY price_monthly ASC`);
  console.log("Current plans:");
  plans.forEach(p => console.log(`  [${p.id}] ${p.name} (${p.slug}) — tier: ${p.tier} — status: ${p.status}`));
  console.log("");

  // Remove Platinum — delete if no subscriptions reference it, otherwise deactivate
  await run("Check if Platinum has active subscriptions", async () => {
    const rows = await sql.query(`
      SELECT COUNT(*) as cnt FROM subscriptions s
      JOIN plans p ON s.plan_id = p.id
      WHERE (LOWER(p.name) = 'platinum' OR p.slug = 'platinum')
        AND s.status NOT IN ('Cancelled', 'Expired')
    `);
    const count = Number(rows[0]?.cnt ?? 0);
    if (count > 0) {
      throw new Error(`${count} active subscription(s) on Platinum — deactivating instead of deleting`);
    }
  });

  // Try delete first; if it throws (FK), deactivate
  let deleted = false;
  try {
    await sql.query(`DELETE FROM plans WHERE LOWER(name) = 'platinum' OR slug = 'platinum'`);
    console.log("✓ Platinum plan deleted");
    deleted = true;
  } catch {
    await sql.query(`UPDATE plans SET status = 'Inactive' WHERE LOWER(name) = 'platinum' OR slug = 'platinum'`);
    console.log("~ Platinum plan deactivated (has FK references)");
  }

  // Show final state
  console.log("\nPlans after migration:");
  const after = await sql.query(`SELECT id, name, slug, tier, status, price_monthly FROM plans ORDER BY price_monthly ASC`);
  after.forEach(p => console.log(`  [${p.id}] ${p.name} — $${p.price_monthly}/mo — status: ${p.status}`));

  console.log("\nDone!");
}

main().catch(console.error);
