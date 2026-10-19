import { refresh } from "next/cache";
import { FocusError } from "@/lib/db/focus";
import { GoalEditError } from "@/lib/db/goals";
import { ClosedWeekError } from "@/lib/week";

/**
 * What every portal and student-page action returns, so forms can show why a
 * change did not go through instead of failing silently or as an error page.
 */
export type ActionResult = { error: string | null };

export const OK: ActionResult = { error: null };

/** Errors whose message was written for the person who caused them. */
class InputError extends Error {
  name = "InputError";
}

export function invalid(message: string): never {
  throw new InputError(message);
}

/**
 * Runs a mutation and refreshes the page on success, so the progress both
 * views compute from the database reflects it immediately. Expected refusals
 * (a closed week, a bad input) come back as messages; anything else is logged
 * and reported generically, because its message was not written for users.
 */
export async function runAction(fn: () => Promise<void>): Promise<ActionResult> {
  try {
    await fn();
  } catch (error) {
    if (
      error instanceof InputError ||
      error instanceof ClosedWeekError ||
      error instanceof GoalEditError ||
      error instanceof FocusError
    ) {
      return { error: error.message };
    }
    console.error("Action failed", error);
    return { error: "Something went wrong saving that. Try again." };
  }
  refresh();
  return OK;
}

export function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function optionalText(formData: FormData, key: string): string | null {
  return text(formData, key) || null;
}

export function oneOf<T extends string>(formData: FormData, key: string, allowed: readonly T[]): T {
  const value = text(formData, key);
  if (!(allowed as readonly string[]).includes(value)) invalid(`Choose a valid ${key}.`);
  return value as T;
}
