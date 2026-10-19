import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStudentByClerkId, linkStudentByEmail, type Student } from "@/lib/db/students";

/**
 * The only thing in the codebase that knows how /portal is guarded — the
 * student-side twin of lib/auth/dashboard.ts.
 *
 * A Clerk account becomes a student by being linked to a `students` row. Staff
 * create the row with the student's email and invite that address through
 * Clerk; the first visit here matches the account's *verified* primary email to
 * the row and records the Clerk user ID, after which the ID alone is used. An
 * unverified address is never matched, or anyone could type a student's email
 * into a sign-up form and inherit their profile.
 */

export type StudentAccess =
  | { status: "signed-out" }
  | { status: "unlinked"; email: string | null }
  | { status: "student"; student: Student };

/** Cached per request: the portal layout and the page both ask. */
export const getStudentAccess = cache(async (): Promise<StudentAccess> => {
  const { userId } = await auth();
  if (!userId) return { status: "signed-out" };

  const linked = await getStudentByClerkId(userId);
  if (linked) return { status: "student", student: linked };

  const user = await currentUser();
  const primary = user?.primaryEmailAddress;
  if (!primary || primary.verification?.status !== "verified") {
    return { status: "unlinked", email: primary?.emailAddress ?? null };
  }

  const claimed = await linkStudentByEmail(primary.emailAddress, userId);
  return claimed
    ? { status: "student", student: claimed }
    : { status: "unlinked", email: primary.emailAddress };
});

/**
 * For Server Actions, which are reachable by direct POST and so must check for
 * themselves. Returns the student, whose `id` every action scopes its writes to
 * — an action never takes a student ID from the request.
 */
export async function requireStudent(): Promise<Student> {
  const access = await getStudentAccess();
  if (access.status !== "student") throw new Error("Not signed in as a student.");
  return access.student;
}
