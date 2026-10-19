import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { assertWeekOpen, isWeekEditable, type WeekStart } from "@/lib/week";
import type { EarnedStatus, GoalType, SoarCategory } from "@/lib/goals/catalog";
import { requireDb as db } from "./index";
import { weeklyGoals } from "./schema";

export type WeeklyGoal = typeof weeklyGoals.$inferSelect;

export class GoalEditError extends Error {
  name = "GoalEditError";
}

/** Admins plan this week and next; anything else is read-only. */
function assertEditable(weekStart: WeekStart): void {
  assertWeekOpen(weekStart);
  if (!isWeekEditable(weekStart)) {
    throw new GoalEditError("Goals can only be set for this week and next week.");
  }
}

export async function listGoals(studentId: string, weekStart: WeekStart): Promise<WeeklyGoal[]> {
  return db()
    .select()
    .from(weeklyGoals)
    .where(and(eq(weeklyGoals.studentId, studentId), eq(weeklyGoals.weekStart, weekStart)))
    .orderBy(asc(weeklyGoals.createdAt));
}

export async function listGoalsForStudents(
  studentIds: string[],
  weekStart: WeekStart
): Promise<WeeklyGoal[]> {
  if (studentIds.length === 0) return [];
  return db()
    .select()
    .from(weeklyGoals)
    .where(and(inArray(weeklyGoals.studentId, studentIds), eq(weeklyGoals.weekStart, weekStart)))
    .orderBy(asc(weeklyGoals.createdAt));
}

/** Every lookup by id is scoped to a student, so an id from another student's page cannot be acted on. */
async function getGoal(goalId: string, studentId: string): Promise<WeeklyGoal> {
  const [row] = await db()
    .select()
    .from(weeklyGoals)
    .where(and(eq(weeklyGoals.id, goalId), eq(weeklyGoals.studentId, studentId)))
    .limit(1);
  if (!row) throw new GoalEditError("That goal no longer exists.");
  return row;
}

export type GoalInput = {
  category: SoarCategory;
  type: GoalType;
  targetMinutes: number | null;
  title: string;
  detail: string | null;
};

export async function createGoal(
  studentId: string,
  weekStart: WeekStart,
  input: GoalInput,
  createdBy: string
): Promise<void> {
  assertEditable(weekStart);
  await db().insert(weeklyGoals).values({ studentId, weekStart, createdBy, ...input });
}

/**
 * The type is fixed once a goal exists: switching a focus goal to a check-off
 * task would carry over a meaningless target and a student check that never
 * applied. Delete and re-add instead.
 */
export async function updateGoal(
  goalId: string,
  studentId: string,
  input: Omit<GoalInput, "type">
): Promise<void> {
  const goal = await getGoal(goalId, studentId);
  assertEditable(goal.weekStart);
  await db()
    .update(weeklyGoals)
    .set({
      ...input,
      targetMinutes: goal.type === "focus_minutes" ? input.targetMinutes : null,
      updatedAt: new Date(),
    })
    .where(eq(weeklyGoals.id, goalId));
}

export async function deleteGoal(goalId: string, studentId: string): Promise<void> {
  const goal = await getGoal(goalId, studentId);
  assertEditable(goal.weekStart);
  await db().delete(weeklyGoals).where(eq(weeklyGoals.id, goalId));
}

export async function setOverride(
  goalId: string,
  studentId: string,
  override: "complete" | "excused" | null,
  adminId: string
): Promise<void> {
  await getGoal(goalId, studentId);
  // No week check: overrides are the one correction allowed after a week
  // closes — that is the whole point of them. A locked goal's final_status is
  // the pre-override result, so setting or clearing this never touches it.
  await db()
    .update(weeklyGoals)
    .set({ override, overrideBy: override ? adminId : null, updatedAt: new Date() })
    .where(eq(weeklyGoals.id, goalId));
}

/** The student's own check on a `manual` goal. */
export async function setManualDone(
  goalId: string,
  studentId: string,
  done: boolean
): Promise<void> {
  const goal = await getGoal(goalId, studentId);
  if (goal.type !== "manual") throw new GoalEditError("Only check-off tasks are marked by hand.");
  assertWeekOpen(goal.weekStart);
  await db()
    .update(weeklyGoals)
    .set({ manuallyCompletedAt: done ? new Date() : null, updatedAt: new Date() })
    .where(eq(weeklyGoals.id, goalId));
}

/**
 * Copies one week's goals into another as fresh goals: category, type, target,
 * title and detail, with no progress, check or override. A single
 * INSERT … SELECT … WHERE NOT EXISTS, so a double-click (or two admins at once)
 * cannot copy twice — the second statement sees the first one's rows and
 * inserts nothing. Returns how many goals were copied.
 */
export async function copyWeekGoals(
  studentId: string,
  fromWeek: WeekStart,
  toWeek: WeekStart,
  createdBy: string
): Promise<number> {
  assertEditable(toWeek);
  const result = await db().execute(sql`
    INSERT INTO weekly_goals (student_id, week_start, category, type, target_minutes, title, detail, created_by)
    SELECT student_id, ${toWeek}::date, category, type, target_minutes, title, detail, ${createdBy}
    FROM weekly_goals
    WHERE student_id = ${studentId} AND week_start = ${fromWeek}::date
      AND NOT EXISTS (
        SELECT 1 FROM weekly_goals WHERE student_id = ${studentId} AND week_start = ${toWeek}::date
      )
  `);
  return result.rowCount ?? 0;
}

/**
 * Records a closed week's results on its goals. `finalStatus` is the status the
 * activity earned, before any override, so an override set or cleared later
 * still applies on top of it. Only touches goals not yet
 * locked, so two people opening the same closed week at once both write the
 * same values and neither overwrites a lock taken earlier.
 */
export async function lockGoals(
  results: { id: string; finalProgress: number; finalStatus: EarnedStatus }[]
): Promise<void> {
  if (results.length === 0) return;
  const lockedAt = new Date();
  const [first, ...rest] = results.map((r) =>
    db()
      .update(weeklyGoals)
      .set({ finalProgress: r.finalProgress, finalStatus: r.finalStatus, lockedAt })
      .where(and(eq(weeklyGoals.id, r.id), isNull(weeklyGoals.lockedAt)))
  );
  await db().batch([first, ...rest]);
}
