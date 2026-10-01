import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * The only thing in the codebase that knows how /berfday is guarded.
 *
 * Pages and actions ask `requireDashboard()` / `isDashboardAuthenticated()` and
 * nothing else. Replacing the shared access code with real per-user accounts
 * (Clerk) means reimplementing these four functions and touching no page, no
 * component, and no action — which is the point, because a shared six-digit
 * code is a stopgap, not an auth system.
 */

const COOKIE_NAME = "berfday_session";

/** Long enough for an afternoon of triage, short enough that a stale laptop expires. */
const SESSION_SECONDS = 60 * 60 * 12;

export type DashboardConfigError = "missing-code" | "missing-secret" | null;

/**
 * Both env vars are required and there is deliberately no fallback. A default
 * code would mean a misconfigured deploy serves every applicant's name, email
 * and phone number to anyone who guesses the URL — so missing config fails
 * closed and says so.
 */
export function getDashboardConfigError(): DashboardConfigError {
  if (!process.env.DASHBOARD_ACCESS_CODE) return "missing-code";
  if (!process.env.DASHBOARD_SESSION_SECRET) return "missing-secret";
  return null;
}

/**
 * Signing key for session cookies, derived from the secret *and* the access
 * code. Mixing the code in means changing the code invalidates every existing
 * session, so rotating it actually locks people out instead of only affecting
 * the next sign-in.
 */
function signingKey(): Buffer {
  return createHmac("sha256", process.env.DASHBOARD_SESSION_SECRET!)
    .update(`berfday:${process.env.DASHBOARD_ACCESS_CODE!}`)
    .digest();
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

/**
 * Compares HMACs of the two values rather than the values themselves.
 * timingSafeEqual throws outright on a length mismatch, which would both crash
 * on a wrong-length guess and leak the code's length; hashing first makes both
 * sides a fixed 32 bytes.
 */
function equals(a: string, b: string): boolean {
  const key = signingKey();
  return timingSafeEqual(
    createHmac("sha256", key).update(a).digest(),
    createHmac("sha256", key).update(b).digest()
  );
}

export function verifyAccessCode(input: string): boolean {
  if (getDashboardConfigError()) return false;
  return equals(input.trim(), process.env.DASHBOARD_ACCESS_CODE!);
}

/**
 * Issues the session cookie. Server Actions and Route Handlers only — HTTP
 * cannot set a cookie once the response has started streaming, so calling this
 * during a page render is an error by construction.
 */
export async function startDashboardSession(): Promise<void> {
  const expiresAt = Date.now() + SESSION_SECONDS * 1000;
  // The nonce makes two sessions issued in the same millisecond distinct, so one
  // cookie is never a valid stand-in for another.
  const payload = `${expiresAt}.${randomBytes(16).toString("base64url")}`;

  (await cookies()).set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    // Off on localhost, where there is no HTTPS to send it over.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endDashboardSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/**
 * Reading this opts the calling page into dynamic rendering, which is what keeps
 * a gated page from being prerendered and cached as its signed-in version.
 */
export async function isDashboardAuthenticated(): Promise<boolean> {
  if (getDashboardConfigError()) return false;

  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  if (!raw) return false;

  // Split from the right: the nonce is base64url and never contains a dot, but
  // bounding the parse means a malformed cookie can only ever fail, not confuse.
  const lastDot = raw.lastIndexOf(".");
  if (lastDot < 1) return false;

  const payload = raw.slice(0, lastDot);
  const signature = raw.slice(lastDot + 1);
  if (!equals(signature, sign(payload))) return false;

  const expiresAt = Number(payload.slice(0, payload.indexOf(".")));
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
