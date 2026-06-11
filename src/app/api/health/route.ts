import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isStripeConfigured } from "@/lib/stripe";
import { isApiKeyConfigured } from "@/lib/claude";
import { recordHealthCheck } from "@/lib/audit";
import { smtp as smtpConfig, apollo as apolloConfig } from "@/lib/config";

type ServiceStatus = "healthy" | "degraded" | "unhealthy";

interface ServiceResult {
  service: string;
  status: ServiceStatus;
  message: string;
  responseTimeMs: number;
}

async function checkDatabase(): Promise<ServiceResult> {
  const t = Date.now();
  try {
    await sql`SELECT 1`;
    const ms = Date.now() - t;
    return { service: "database", status: "healthy", message: "Connected", responseTimeMs: ms };
  } catch (err) {
    return {
      service: "database",
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Connection failed",
      responseTimeMs: Date.now() - t,
    };
  }
}

async function checkClaude(): Promise<ServiceResult> {
  const t = Date.now();
  if (!isApiKeyConfigured()) {
    return { service: "claude", status: "degraded", message: "API key not configured", responseTimeMs: 0 };
  }
  // Lightweight API ping — just verify the key by checking models endpoint
  try {
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      signal: AbortSignal.timeout(5000),
    });
    const ms = Date.now() - t;
    if (res.ok) return { service: "claude", status: "healthy", message: "API reachable", responseTimeMs: ms };
    return { service: "claude", status: "degraded", message: `HTTP ${res.status}`, responseTimeMs: ms };
  } catch {
    return { service: "claude", status: "degraded", message: "API unreachable", responseTimeMs: Date.now() - t };
  }
}

async function checkStripe(): Promise<ServiceResult> {
  const t = Date.now();
  if (!isStripeConfigured()) {
    return { service: "stripe", status: "degraded", message: "Not configured (demo mode)", responseTimeMs: 0 };
  }
  try {
    const res = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    const ms = Date.now() - t;
    if (res.ok) return { service: "stripe", status: "healthy", message: "API reachable", responseTimeMs: ms };
    return { service: "stripe", status: "degraded", message: `HTTP ${res.status}`, responseTimeMs: ms };
  } catch {
    return { service: "stripe", status: "degraded", message: "API unreachable", responseTimeMs: Date.now() - t };
  }
}

async function checkSmtp(): Promise<ServiceResult> {
  if (!smtpConfig.isConfigured()) {
    return { service: "smtp", status: "degraded", message: "Not configured", responseTimeMs: 0 };
  }
  // We only verify configuration — full SMTP connect is too slow for a health endpoint
  return { service: "smtp", status: "healthy", message: "Configured", responseTimeMs: 0 };
}

async function checkApollo(): Promise<ServiceResult> {
  const t = Date.now();
  if (!apolloConfig.isConfigured()) {
    return { service: "apollo", status: "degraded", message: "Not configured", responseTimeMs: 0 };
  }
  try {
    const res = await fetch("https://api.apollo.io/api/v1/auth/health", {
      headers: { "x-api-key": apolloConfig.apiKey()! },
      signal: AbortSignal.timeout(5000),
    });
    const ms = Date.now() - t;
    if (res.ok) return { service: "apollo", status: "healthy", message: "API reachable", responseTimeMs: ms };
    return { service: "apollo", status: "degraded", message: `HTTP ${res.status}`, responseTimeMs: ms };
  } catch {
    return { service: "apollo", status: "degraded", message: "API unreachable", responseTimeMs: Date.now() - t };
  }
}

function overallStatus(results: ServiceResult[]): ServiceStatus {
  if (results.some(r => r.service === "database" && r.status === "unhealthy")) return "unhealthy";
  if (results.some(r => r.status === "unhealthy")) return "unhealthy";
  if (results.some(r => r.status === "degraded")) return "degraded";
  return "healthy";
}

export async function GET() {
  const [db, claudeResult, stripe, smtpResult, apolloResult] = await Promise.all([
    checkDatabase(),
    checkClaude(),
    checkStripe(),
    checkSmtp(),
    checkApollo(),
  ]);

  const services = [db, claudeResult, stripe, smtpResult, apolloResult];
  const status = overallStatus(services);

  // Persist results best-effort (don't await — don't slow the response)
  void Promise.all(
    services.map(s => recordHealthCheck(s.service, s.status === "unhealthy" ? "critical" : s.status === "degraded" ? "warning" : "healthy", s.message, s.responseTimeMs))
  );

  const httpStatus = status === "healthy" ? 200 : status === "degraded" ? 200 : 503;

  return NextResponse.json(
    {
      status,
      timestamp: new Date().toISOString(),
      services: Object.fromEntries(services.map(s => [s.service, { status: s.status, message: s.message, responseTimeMs: s.responseTimeMs }])),
    },
    { status: httpStatus }
  );
}
