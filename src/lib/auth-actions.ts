"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sql } from "./db";
import { createSession, deleteSession } from "./session";
import { verifySession } from "./dal";
import {
  getUserByEmail,
  getUserById,
  updateLastLogin,
  updateUserPassword,
  updateUserStatus,
  createUser,
  createInviteToken,
  createPasswordResetToken,
  getPasswordResetToken,
  usePasswordResetToken,
} from "./queries";
import { sendInviteEmail, sendPasswordResetEmail } from "./email";

// ─── Login ────────────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.string().optional(),
});

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string[]; password?: string[] };
} | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  // Determine redirect destination — set inside try, used outside so redirect()
  // throws naturally without being caught by our error handler.
  let destination: string | null = null;

  try {
    const raw = {
      email: formData.get("email"),
      password: formData.get("password"),
      rememberMe: formData.get("rememberMe"),
    };

    const parsed = LoginSchema.safeParse(raw);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors as { email?: string[]; password?: string[] };
      return { fieldErrors: fe };
    }

    const { email, password, rememberMe } = parsed.data;

    const user = await getUserByEmail(email);
    if (!user || user.status === "suspended") {
      return { error: "Invalid email or password." };
    }

    if (!user.password_hash) {
      return { error: "Account not configured. Contact your Arashi OPS account manager." };
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return { error: "Invalid email or password." };
    }

    await createSession(
      {
        userId: user.id,
        role: user.role,
        clientId: user.client_id,
        name: user.name,
        email: user.email,
      },
      !!rememberMe
    );

    await updateLastLogin(user.id);

    if (user.status === "invited") {
      await updateUserStatus(user.id, "active");
    }

    await sql`
      INSERT INTO activity_log (type, description)
      VALUES ('client', ${`${user.name} logged in`})
    `;

    destination = user.role === "owner" ? "/admin" : "/client";
  } catch (err) {
    console.error("[loginAction]", err);
    return { error: "Something went wrong. Please try again." };
  }

  // redirect() is called outside try/catch so its internal throw propagates to Next.js
  redirect(destination!);
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  try {
    const session = await verifySession().catch(() => null);
    if (session) {
      await sql`
        INSERT INTO activity_log (type, description)
        VALUES ('client', ${`${session.name} logged out`})
      `;
    }
    await deleteSession();
  } catch {
    // best effort — still redirect to login
  }
  redirect("/login");
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

const ForgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotState = {
  error?: string;
  success?: boolean;
  resetToken?: string; // exposed in UI (mock email)
  fieldErrors?: { email?: string[] };
} | null;

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  try {
    const parsed = ForgotSchema.safeParse({ email: formData.get("email") });
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors as { email?: string[] };
      return { fieldErrors: fe };
    }

    const user = await getUserByEmail(parsed.data.email);
    if (!user) return { success: true }; // avoid email enumeration

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await createPasswordResetToken(user.id, token, expiresAt);

    await sql`
      INSERT INTO activity_log (type, description)
      VALUES ('client', ${`Password reset requested for ${user.email}`})
    `;

    // Send real email if configured; fallback exposes token for dev use
    const emailResult = await sendPasswordResetEmail(user.email, token).catch(() => ({ success: false }));
    return { success: true, resetToken: emailResult.success ? undefined : token };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

const ResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm: z.string().min(1, "Please confirm your password"),
});

export type ResetState = {
  error?: string;
  success?: boolean;
  fieldErrors?: { password?: string[]; confirm?: string[] };
} | null;

export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  try {
    const parsed = ResetSchema.safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirm: formData.get("confirm"),
    });

    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors as { password?: string[]; confirm?: string[] };
      return { fieldErrors: fe };
    }

    const { token, password, confirm } = parsed.data;

    if (password !== confirm) {
      return { fieldErrors: { confirm: ["Passwords do not match"] } };
    }

    const record = await getPasswordResetToken(token);
    if (!record || record.used || new Date(record.expires_at) < new Date()) {
      return { error: "This reset link is invalid or has expired." };
    }

    const hash = await bcrypt.hash(password, 12);
    await updateUserPassword(record.user_id, hash);
    await usePasswordResetToken(record.id);

    const user = await getUserById(record.user_id);
    if (user) {
      await sql`
        INSERT INTO activity_log (type, description)
        VALUES ('client', ${`Password reset completed for ${user.email}`})
      `;
    }

    return { success: true };
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

// ─── Create Client User (admin action) ───────────────────────────────────────

const CreateClientSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  tier: z.enum(["Silver", "Gold", "Enterprise"]),
  status: z.enum(["Active", "Review", "Paused"]),
  industry: z.string().min(1, "Industry is required"),
  monthlyValue: z.string().refine((v) => !isNaN(Number(v)), "Must be a number"),
});

export type CreateClientState = {
  error?: string;
  success?: boolean;
  inviteToken?: string;
  tempPassword?: string;
  emailSent?: boolean;
  fieldErrors?: Record<string, string[]>;
} | null;

export async function createClientUserAction(
  _prev: CreateClientState,
  formData: FormData
): Promise<CreateClientState> {
  const session = await verifyOwnerOrThrow();
  if (!session) return { error: "Unauthorized." };

  const parsed = CreateClientSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    tier: formData.get("tier"),
    status: formData.get("status"),
    industry: formData.get("industry"),
    monthlyValue: formData.get("monthlyValue"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { companyName, contactName, email, tier, status, industry, monthlyValue } = parsed.data;

  // Check email not already in use
  const existing = await getUserByEmail(email);
  if (existing) return { error: "An account with this email already exists." };

  // 1. Create client record
  const clients = await sql`
    INSERT INTO clients (company_name, contact_name, email, tier, status, monthly_value, industry, owner, health_score)
    VALUES (${companyName}, ${contactName}, ${email}, ${tier}, ${status}, ${Number(monthlyValue)}, ${industry}, ${session.name}, 80)
    RETURNING id
  ` as Array<{ id: number }>;
  const clientId = clients[0].id;

  // 2. Generate temp password
  const tempPassword = crypto.randomBytes(6).toString("hex"); // 12 hex chars
  const hash = await bcrypt.hash(tempPassword, 12);

  // 3. Create user account linked to client
  const user = await createUser(contactName, email, hash, "client", clientId, "invited");

  // 4. Generate invite token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await createInviteToken(user.id, token, expiresAt);

  await sql`
    INSERT INTO activity_log (type, description)
    VALUES ('client', ${`New client created: ${companyName} (${email})`})
  `;

  // Send real invite email if configured; fallback shows token+password in UI
  const emailResult = await sendInviteEmail(email, contactName, token, tempPassword).catch(() => ({ success: false }));
  return {
    success: true,
    inviteToken: emailResult.success ? undefined : token,
    tempPassword: emailResult.success ? undefined : tempPassword,
    emailSent: emailResult.success,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function verifyOwnerOrThrow() {
  try {
    const session = await verifySession();
    if (session.role !== "owner") return null;
    return session;
  } catch {
    return null;
  }
}

function isNextRedirect(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
