import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "./db-types";

export type SessionPayload = {
  userId: number;
  role: UserRole;
  clientId: number | null;
  name: string;
  email: string;
};

const COOKIE_NAME = "arashi_session";

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Hard crash at startup is correct — this is a server config error, not a user error.
    // Log to server, never expose to client.
    console.error("[auth] SESSION_SECRET env var is missing");
    throw new Error("Server configuration error");
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(
  payload: SessionPayload,
  rememberMe = false
): Promise<void> {
  const token = await encrypt(payload);
  const cookieStore = await cookies();
  const opts: Parameters<typeof cookieStore.set>[2] = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
  if (rememberMe) {
    opts.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  cookieStore.set(COOKIE_NAME, token, opts);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return decrypt(token);
}

export async function updateSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return;
  const payload = await decrypt(token);
  if (!payload) return;
  await createSession(payload);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
