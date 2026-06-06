import { NextRequest, NextResponse } from "next/server";
import { runPhase5Migrations } from "@/lib/db-migrate";

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runPhase5Migrations();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
