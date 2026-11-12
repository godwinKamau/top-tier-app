import { and, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { assertWeekOpen, type WeekStart } from "@/lib/week";
import { requireDb as db } from "./index";
import { studyLogs } from "./schema";

export type StudyLog = typeof studyLogs.$inferSelect;

export type StudyLogFields = Pick<StudyLog, "completed" | "remaining" | "blockers" | "learned">;

export async function getStudyLog(studentId: string, weekStart: WeekStart): Promise<StudyLog | null> {
  const [row] = await db()
    .select()
    .from(studyLogs)
    .where(and(eq(studyLogs.studentId, studentId), eq(studyLogs.weekStart, weekStart)))
    .limit(1);
  return row ?? null;
}

/** Every week's log for a student, newest first — the "Past weeks" list. */
export async function listStudyLogs(studentId: string): Promise<StudyLog[]> {
  return db()
    .select()
    .from(studyLogs)
    .where(eq(studyLogs.studentId, studentId))
    .orderBy(desc(studyLogs.weekStart));
}

export async function submittedStudents(
  studentIds: string[],
  weekStart: WeekStart
): Promise<Set<string>> {
  if (studentIds.length === 0) return new Set();
  const rows = await db()
    .select({ studentId: studyLogs.studentId })
    .from(studyLogs)
    .where(
      and(
        inArray(studyLogs.studentId, studentIds),
        eq(studyLogs.weekStart, weekStart),
        isNotNull(studyLogs.submittedAt)
      )
    );
  return new Set(rows.map((r) => r.studentId));
}

/**
 * Saves the log, as a draft or as a submission. Once submitted it stays
 * submitted: later edits during the same week update the answers but keep the
 * original `submitted_at`, so "submitted on time" cannot be undone by fixing a
 * typo on Saturday.
 */
export async function saveStudyLog(
  studentId: string,
  weekStart: WeekStart,
  fields: StudyLogFields,
  submit: boolean
): Promise<void> {
  assertWeekOpen(weekStart);
  const now = new Date();
  await db()
    .insert(studyLogs)
    .values({ studentId, weekStart, ...fields, submittedAt: submit ? now : null, updatedAt: now })
    .onConflictDoUpdate({
      target: [studyLogs.studentId, studyLogs.weekStart],
      set: {
        ...fields,
        updatedAt: now,
        submittedAt: submit
          ? sql`COALESCE(${studyLogs.submittedAt}, ${now.toISOString()}::timestamptz)`
          : sql`${studyLogs.submittedAt}`,
      },
    });
}
