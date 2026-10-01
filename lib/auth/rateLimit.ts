import { headers } from "next/headers";

/**
 * Best-effort brute-force brake on the /berfday code entry.
 *
 * Deliberately in-memory and deliberately modest about it: on a serverless host
 * each instance keeps its own counters, so an attacker spread across enough cold
 * starts sees a higher effective limit than the one configured here. It raises
 * the cost of guessing a six-digit code from "seconds with a script" to
 * something slow and noisy; it is not a guarantee. Moving these counters into
 * Postgres (or swapping the shared code for real accounts) is what makes it one.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** Keeps the map from growing without bound on a long-lived instance. */
function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

async function clientKey(): Promise<string> {
  const h = await headers();
  // x-forwarded-for is a client-settable header that only a trusted proxy makes
  // meaningful, so the first hop is taken only as a bucketing hint — never as
  // identity. A spoofed value lets an attacker pick their own bucket, which the
  // comment above already concedes.
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/** Call before checking a code. Counts the attempt whether or not it succeeds. */
export async function consumeAttempt(): Promise<RateLimitResult> {
  const now = Date.now();
  sweep(now);

  const key = await clientKey();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true };
}

/** Clears the bucket once the right code arrives, so a typo costs nothing later. */
export async function clearAttempts(): Promise<void> {
  buckets.delete(await clientKey());
}
