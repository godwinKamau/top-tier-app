"use server";

import { requireDashboard } from "@/lib/auth/dashboard";
import { invalid, optionalText, runAction, text, type ActionResult } from "@/lib/actions";
import { createStudent } from "@/lib/db/students";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Creates the profile only. The student gets in by being invited to that email
 * from the Clerk dashboard; their first /portal visit links the two.
 */
export async function createStudentAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const adminId = await requireDashboard();
    const name = text(formData, "name");
    const email = text(formData, "email");
    if (!name) invalid("Enter the student's name.");
    if (!EMAIL_PATTERN.test(email)) invalid("Enter the email the student will sign in with.");
    try {
      await createStudent({
        name,
        email,
        grade: optionalText(formData, "grade"),
        school: optionalText(formData, "school"),
        assignedConsultantId: adminId,
      });
    } catch (error) {
      // The unique constraint on email is the only expected failure here.
      if (isUniqueViolation(error)) {
        invalid("A student with that email already exists.");
      }
      throw error;
    }
  });
}

/** Postgres 23505. Drizzle wraps the driver's error, so the code may be on either. */
function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}
