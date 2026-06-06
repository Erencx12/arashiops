import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { sql } from "./db";
import type { SessionPayload } from "./session";

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session?.userId) redirect("/login");
  return session;
});

export const verifyOwnerSession = cache(async (): Promise<SessionPayload> => {
  const session = await verifySession();
  if (session.role !== "owner") redirect("/client");
  return session;
});

// Client guard — for actual clients, uses their own clientId.
// For owners previewing the portal, uses the first client in the DB.
export const verifyClientSession = cache(
  async (): Promise<SessionPayload & { clientId: number }> => {
    const session = await verifySession();

    if (session.role === "client") {
      if (!session.clientId) redirect("/login");
      return session as SessionPayload & { clientId: number };
    }

    // Owner preview: pick first available client
    const rows = await sql`SELECT id FROM clients ORDER BY id ASC LIMIT 1` as Array<{ id: number }>;
    if (!rows.length) redirect("/admin");
    return { ...session, clientId: rows[0].id };
  }
);
