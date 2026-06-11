import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "./session";
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

// Client guard — clients only. Owners are redirected to /admin.
export const verifyClientSession = cache(
  async (): Promise<SessionPayload & { clientId: number }> => {
    const session = await verifySession();
    if (session.role !== "client") redirect("/admin");
    if (!session.clientId) redirect("/login");
    return session as SessionPayload & { clientId: number };
  }
);
