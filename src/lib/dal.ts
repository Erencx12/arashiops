import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import type { SessionPayload } from "./session";

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session?.userId) redirect("/login");
  // JWT deserializes numbers as floats — coerce to integers for SQL
  return {
    ...session,
    userId: Math.trunc(Number(session.userId)),
    clientId: session.clientId != null ? Math.trunc(Number(session.clientId)) : null,
  };
});

export const verifyOwnerSession = cache(async (): Promise<SessionPayload> => {
  const session = await verifySession();
  if (session.role !== "owner") redirect("/client");
  return session;
});

// Client guard — clients only. Owners are redirected to /admin.
export const verifyClientSession = cache(
  async (): Promise<SessionPayload & { clientId: number }> => {
    const session = await verifySession();
    if (session.role !== "client") redirect("/admin");
    if (!session.clientId) redirect("/login");
    // JWT deserializes numbers as floats — coerce to integer for SQL
    const clientId = Math.trunc(Number(session.clientId));
    return { ...session, clientId } as SessionPayload & { clientId: number };
  }
);
