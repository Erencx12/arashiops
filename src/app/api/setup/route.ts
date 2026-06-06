import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { runMigrations } from "@/lib/db-migrate";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run table migrations
  const result = await runMigrations();
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  // Seed owner account
  const ownerEmail = process.env.OWNER_EMAIL ?? "dasw67352@gmail.com";
  const ownerPassword = process.env.OWNER_PASSWORD;
  const ownerName = process.env.OWNER_NAME ?? "Soham Das";

  if (!ownerPassword) {
    return NextResponse.json({
      ok: true,
      message: result.message + " Set OWNER_PASSWORD env var to seed the owner account.",
    });
  }

  const hash = await bcrypt.hash(ownerPassword, 12);
  await sql`
    INSERT INTO users (name, email, password_hash, role, client_id, status)
    VALUES (${ownerName}, ${ownerEmail}, ${hash}, 'owner', NULL, 'active')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
  `;

  return NextResponse.json({
    ok: true,
    message: `${result.message} Owner account ready for ${ownerEmail}.`,
  });
}
