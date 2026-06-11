/**
 * In-memory sliding-window rate limiter.
 * Works for single-instance deployments. For multi-instance, swap the
 * backing store to Redis without changing the call sites.
 *
 * Key format: `${action}:${identifier}` — identifier is typically an IP address.
 */

type WindowEntry = { count: number; windowStart: number };

// Module-level map — lives for the lifetime of the Node.js process.
const store = new Map<string, WindowEntry>();

// Prune stale entries periodically so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > 60_000) store.delete(key);
  }
}, 60_000);

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterMs: number; message: string };

export interface RateLimitOptions {
  /** Max requests allowed in the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
  /** Human-readable description used in the error message. */
  action?: string;
}

/**
 * Check whether `identifier` (usually IP) has exceeded the rate limit for `key`.
 * Call this at the start of any sensitive server action.
 *
 * @example
 * const result = checkRateLimit("login", ip, { limit: 5, windowMs: 60_000 });
 * if (!result.allowed) return { error: result.message };
 */
export function checkRateLimit(
  key: string,
  identifier: string,
  opts: RateLimitOptions
): RateLimitResult {
  const mapKey = `${key}:${identifier}`;
  const now = Date.now();
  const entry = store.get(mapKey);

  if (!entry || now - entry.windowStart >= opts.windowMs) {
    // New window
    store.set(mapKey, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= opts.limit) {
    const retryAfterMs = opts.windowMs - (now - entry.windowStart);
    const label = opts.action ?? key;
    return {
      allowed: false,
      retryAfterMs,
      message: `Too many ${label} attempts. Please wait ${Math.ceil(retryAfterMs / 1000)} seconds.`,
    };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Reset the rate limit counter for a specific key + identifier.
 * Call this after a successful login to unblock the account.
 */
export function resetRateLimit(key: string, identifier: string): void {
  store.delete(`${key}:${identifier}`);
}

// ─── Pre-defined limits for Arashi OPS endpoints ─────────────────────────────

export const LIMITS = {
  login:          { limit: 10, windowMs: 5 * 60 * 1000,  action: "login" },           // 10/5min
  forgotPassword: { limit: 5,  windowMs: 15 * 60 * 1000, action: "password reset" },  // 5/15min
  aiAction:       { limit: 30, windowMs: 60 * 1000,       action: "AI request" },      // 30/min
  billingAction:  { limit: 20, windowMs: 60 * 1000,       action: "billing request" }, // 20/min
  webhook:        { limit: 60, windowMs: 60 * 1000,       action: "webhook trigger" }, // 60/min
  apiGeneral:     { limit: 100, windowMs: 60 * 1000,      action: "API request" },     // 100/min
} as const;
