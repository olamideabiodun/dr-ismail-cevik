import "server-only";

/**
 * Best-effort in-process rate limiter for the booking action.
 *
 * Deliberately simple, and deliberately not the only defence. On Vercel each
 * serverless instance holds its own map, so a determined attacker spread across
 * instances would get more than `limit` attempts. The real backstop is the
 * per-email check inside public.create_booking(), which is enforced in the
 * database and cannot be sidestepped.
 *
 * What this does buy is cheap protection against the common case: a script
 * hammering the endpoint from one place, absorbed before it reaches Postgres.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Stop the map growing without bound on a long-lived instance. */
function sweep(now: number) {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function checkRateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Derives a rate-limit key from proxy headers.
 *
 * `x-forwarded-for` is client-controlled unless a trusted proxy overwrites it —
 * on Vercel it is set by the platform, so the leftmost entry is usable. The
 * email is folded in so one shared NAT address cannot lock out a whole office.
 */
export function rateLimitKey(
  forwardedFor: string | null,
  realIp: string | null,
  email: string
): string {
  const ip =
    forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown-ip";
  return `${ip}:${email.toLowerCase()}`;
}
