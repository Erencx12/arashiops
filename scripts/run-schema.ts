import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function runSchema() {
  const schema = fs.readFileSync("schema.sql", "utf8");
  const statements = schema
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    const clean = stmt.endsWith(";") ? stmt : stmt + ";";
    console.log("Running:", clean.substring(0, 60) + "...");
    await sql.query(clean);
  }
  console.log("Schema applied.");
}

runSchema().catch((e) => {
  console.error(e);
  process.exit(1);
});
