import { and, asc, eq, isNull } from "drizzle-orm";
import { requireDb as db } from "./index";
import { students } from "./schema";

/**
 * Unlike lib/db/applicants.ts, writes here throw. The applicant path swallows
 * errors because a family on the public form must always get their
 * confirmation; these are called from staff and student actions, which catch
 * and turn the failure into a message the person can act on.
 */

export type Student = typeof students.$inferSelect;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function listStudents(): Promise<Student[]> {
  return db().select().from(students).orderBy(asc(students.name));
}

export async function getStudent(id: string): Promise<Student | null> {
  const [row] = await db().select().from(students).where(eq(students.id, id)).limit(1);
  return row ?? null;
}

export async function getStudentByClerkId(clerkUserId: string): Promise<Student | null> {
  const [row] = await db()
    .select()
    .from(students)
    .where(eq(students.clerkUserId, clerkUserId))
    .limit(1);
  return row ?? null;
}

/**
 * Claims the profile whose email matches, but only if no account has claimed it
 * yet: a second Clerk account with the same address (deleted and re-invited, say)
 * cannot silently take over a profile that is already linked. That case needs a
 * staff member to clear `clerk_user_id` by hand.
 */
export async function linkStudentByEmail(
  email: string,
  clerkUserId: string
): Promise<Student | null> {
  const [row] = await db()
    .update(students)
    .set({ clerkUserId })
    .where(and(eq(students.email, normalizeEmail(email)), isNull(students.clerkUserId)))
    .returning();
  return row ?? null;
}

export async function createStudent(input: {
  name: string;
  email: string;
  grade: string | null;
  school: string | null;
  assignedConsultantId: string | null;
}): Promise<Student> {
  const [row] = await db()
    .insert(students)
    .values({ ...input, email: normalizeEmail(input.email) })
    .returning();
  return row;
}
