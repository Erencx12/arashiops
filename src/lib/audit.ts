/**
 * Audit logging for sensitive actions.
 * All writes are best-effort — a logging failure must never block the
 * main operation. Callers should use `void writeAuditLog(...)` or
 * await it after the primary action succeeds.
 */

import { sql } from "./db";
import { getSession } from "./session";

export type AuditAction =
  // Auth
  | "auth.login"
  | "auth.logout"
  | "auth.password_reset"
  | "auth.invite_sent"
  // Users
  | "user.created"
  | "user.role_changed"
  | "user.suspended"
  // Clients
  | "client.created"
  | "client.deleted"
  | "client.status_changed"
  | "client.tier_changed"
  // Commercial
  | "contract.updated"
  | "invoice.updated"
  | "deal.won"
  | "deal.lost"
  | "proposal.sent"
  | "proposal.accepted"
  // Billing
  | "billing.subscription_created"
  | "billing.subscription_cancelled"
  | "billing.plan_changed"
  | "billing.payment_recorded"
  | "billing.refund_issued"
  // Settings / Infra
  | "settings.changed"
  | "api_key.added"
  | "api_key.removed"
  | "integration.enabled"
  | "integration.disabled"
  | "webhook.created"
  | "webhook.deleted"
  // AI
  | "ai.prompt_created"
  | "ai.prompt_updated"
  | "ai.prompt_deleted"
  // Data
  | "data.export"
  | "data.import";

export interface AuditLogParams {
  action: AuditAction;
  targetType?: string;
  targetId?: number | null;
  details?: Record<string, unknown>;
  /** Pass actor explicitly when session context isn't available (e.g. webhooks). */
  actorEmail?: string;
  actorRole?: string;
  ipAddress?: string;
}

/**
 * Write an audit log entry. Never throws — all errors are swallowed so
 * audit logging never blocks the main business flow.
 */
export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    const session = await getSession().catch(() => null);
    const actorId    = session?.userId    ?? null;
    const actorEmail = params.actorEmail  ?? session?.email ?? null;
    const actorRole  = params.actorRole   ?? session?.role  ?? null;
    const details    = params.details ? JSON.stringify(params.details) : null;

    await sql`
      INSERT INTO audit_logs
        (action, actor_id, actor_email, actor_role, target_type, target_id, details, ip_address)
      VALUES
        (${params.action}, ${actorId}, ${actorEmail}, ${actorRole},
         ${params.targetType ?? null}, ${params.targetId ?? null},
         ${details}::jsonb, ${params.ipAddress ?? null})
    `;
  } catch {
    // Best-effort — never propagate audit failures
  }
}

/**
 * Record a server-side error to the error_logs table.
 * Safe to call from catch blocks — never rethrows.
 */
export async function logError(params: {
  errorType: "server" | "api" | "webhook" | "ai" | "billing" | "sync" | "auth";
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}): Promise<void> {
  try {
    const context = params.context ? JSON.stringify(params.context) : null;
    await sql`
      INSERT INTO error_logs (error_type, message, stack, context)
      VALUES (${params.errorType}, ${params.message}, ${params.stack ?? null}, ${context}::jsonb)
    `;
  } catch {
    // Best-effort
    console.error("[error_log] Failed to persist error:", params.message);
  }
}

/**
 * Write a health check result for a specific service.
 */
export async function recordHealthCheck(
  service: string,
  status: "healthy" | "warning" | "critical",
  message?: string,
  responseTimeMs?: number
): Promise<void> {
  try {
    await sql`
      INSERT INTO health_check_results (service, status, message, response_time_ms)
      VALUES (${service}, ${status}, ${message ?? null}, ${responseTimeMs ?? null})
    `;
  } catch {
    // Best-effort
  }
}
