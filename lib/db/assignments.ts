import { and, asc, between, desc, eq, inArray, max, sql } from "drizzle-orm";
import { weekDays, weekRange, type WeekStart } from "@/lib/week";
import { requireDb as db } from "./index";
import { assignments } from "./schema";

export type Assignment = typeof assignments.$inferSelect;

export type AssignmentKind = Assignment["kind"];

/** Who wrote an entry. Each side edits only its own; anyone can mark one done. */
export type AssignmentAuthor = Assignment["author"];

export type AssignmentInput = Pick<Assignment, "title" | "className" | "date" | "kind" | "notes">;

export class AssignmentError extends Error {
  name = "AssignmentError";
}

const MISSING = "That assignment no longer exists.";

/**
 * Every entry dated `from` to `to`, both inclusive, in the order a day lists
 * them: due dates before plans, then oldest first. The enum is declared
 * ('plan', 'due'), so descending puts due first.
 */
export async function listAssignments(studentId: string, from: string, to: string): Promise<Assignment[]> {
  return db()
    .select()
    .from(assignments)
    .where(and(eq(assignments.studentId, studentId), between(assignments.date, from, to)))
    .orderBy(asc(assignments.date), desc(assignments.kind), asc(assignments.createdAt));
}

/**
 * Matches one entry of one student written by `author`. Scoping by both means an
 * id from someone else's calendar, or one the other side wrote, reads as missing.
 */
function owned(id: string, studentId: string, author: AssignmentAuthor) {
  return and(eq(assignments.id, id), eq(assignments.studentId, studentId), eq(assignments.author, author));
}

export async function getAssignment(id: string, studentId: string, author: AssignmentAuthor): Promise<Assignment | null> {
  const [row] = await db().select().from(assignments).where(owned(id, studentId, author)).limit(1);
  return row ?? null;
}

export async function createAssignment(
  studentId: string,
  input: AssignmentInput,
  author: AssignmentAuthor
): Promise<Assignment> {
  const [row] = await db().insert(assignments).values({ studentId, ...input, author }).returning();
  return row;
}

export async function updateAssignment(
  id: string,
  studentId: string,
  author: AssignmentAuthor,
  input: AssignmentInput
): Promise<void> {
  const rows = await db()
    .update(assignments)
    .set({ ...input, updatedAt: new Date() })
    .where(owned(id, studentId, author))
    .returning({ id: assignments.id });
  if (rows.length === 0) throw new AssignmentError(MISSING);
}

export async function deleteAssignment(id: string, studentId: string, author: AssignmentAuthor): Promise<void> {
  const rows = await db()
    .delete(assignments)
    .where(owned(id, studentId, author))
    .returning({ id: assignments.id });
  if (rows.length === 0) throw new AssignmentError(MISSING);
}

/** Either author's entry: the student checks off assigned work too. */
export async function setAssignmentDone(id: string, studentId: string, done: boolean): Promise<void> {
  const now = new Date();
  const rows = await db()
    .update(assignments)
    .set({ completedAt: done ? now : null, updatedAt: now })
    .where(and(eq(assignments.id, id), eq(assignments.studentId, studentId)))
    .returning({ id: assignments.id });
  if (rows.length === 0) throw new AssignmentError(MISSING);
}

/** The classes a student has used, most recent first, for the form's suggestions. */
export async function listClassNames(studentId: string): Promise<string[]> {
  const rows = await db()
    .select({ className: assignments.className, last: max(assignments.createdAt) })
    .from(assignments)
    .where(eq(assignments.studentId, studentId))
    .groupBy(assignments.className)
    .orderBy(desc(max(assignments.createdAt)))
    .limit(30);
  return rows.map((r) => r.className);
}

/**
 * Each student's entries dated in a week, and how many of those were checked off
 * before the week ended. A check made after the week closes doesn't count, so a
 * closed week's assignment goals can't change once they're locked.
 */
export async function assignmentCountsByStudent(
  studentIds: string[],
  weekStart: WeekStart
): Promise<Map<string, { total: number; done: number }>> {
  if (studentIds.length === 0) return new Map();
  const days = weekDays(weekStart);
  const { end } = weekRange(weekStart);
  const rows = await db()
    .select({
      studentId: assignments.studentId,
      total: sql<number>`COUNT(*)::int`,
      done: sql<number>`(COUNT(*) FILTER (WHERE ${assignments.completedAt} < ${end.toISOString()}::timestamptz))::int`,
    })
    .from(assignments)
    .where(and(inArray(assignments.studentId, studentIds), between(assignments.date, days[0], days[6])))
    .groupBy(assignments.studentId);
  return new Map(rows.map((r) => [r.studentId, { total: r.total, done: r.done }]));
}
