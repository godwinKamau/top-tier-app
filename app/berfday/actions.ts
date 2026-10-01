"use server";

import { refresh } from "next/cache";
import {
  endDashboardSession,
  getDashboardConfigError,
  startDashboardSession,
  verifyAccessCode,
} from "@/lib/auth/dashboard";
import { clearAttempts, consumeAttempt } from "@/lib/auth/rateLimit";
import type { GateState } from "./gateState";

/**
 * One message for a wrong code, a missing code and a malformed code. Telling the
 * visitor which of those it was tells an attacker how close they are.
 */
const REJECTED = "That code is not right.";

export async function submitAccessCode(prev: GateState, formData: FormData): Promise<GateState> {
  const next = (error: string): GateState => ({ error, attempt: prev.attempt + 1 });

  if (getDashboardConfigError()) {
    console.error("/berfday is missing DASHBOARD_ACCESS_CODE or DASHBOARD_SESSION_SECRET.");
    return next("This dashboard is not configured yet.");
  }

  // Counted before the code is checked, so a flood of wrong guesses is what runs
  // out the budget rather than a flood of requests that happen to be correct.
  const limit = await consumeAttempt();
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);
    return next(`Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`);
  }

  const code = formData.get("code");
  if (typeof code !== "string" || !verifyAccessCode(code)) {
    return next(REJECTED);
  }

  await clearAttempts();
  await startDashboardSession();

  // The page reads the session cookie, so it has to re-render for the new cookie
  // to mean anything. refresh() is the Next 16 way to do that from an action and
  // is Server-Action-only by design.
  refresh();

  return { error: null, attempt: prev.attempt + 1 };
}

export async function signOutOfDashboard(): Promise<void> {
  await endDashboardSession();
  refresh();
}
