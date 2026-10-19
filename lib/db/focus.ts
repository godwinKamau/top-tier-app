import { and, asc, eq, gte, inArray, isNotNull, isNull, lt, sql } from "drizzle-orm";
import { assertWeekOpen, weekRange, weekStartFor, type WeekStart } from "@/lib/week";
import { requireDb as db } from "./index";
import { focusSessions } from "./schema";

export type FocusSession = typeof focusSessions.$inferSelect;

/**
 * The most one session can count for. A timer left running overnight is a
 * forgotten Stop button, not eight hours of focus; three hours is generous for
 * a real sitting and caps what a forgotten one is worth.
 */
export const MAX_SESSION_MINUTES = 180;

export class FocusError extends Error {
  name = "FocusError";
}

export async function getOpenSession(studentId: string): Promise<FocusSession | null> {
  const [row] = await db()
    .select()
    .from(focusSessions)
    .where(and(eq(focusSessions.studentId, studentId), isNull(focusSessions.endedAt)))
    .limit(1);
  return row ?? null;
}

/**
 * Starts the timer with the database's clock, never the browser's. Pressing
 * Start with a timer already running (a second tab, a double-click) returns the
 * running session rather than failing: the partial unique index rejects the
 * insert and the existing row is what the student meant.
 */
export async function startSession(studentId: string): Promise<FocusSession> {
  const [row] = await db()
    .insert(focusSessions)
    .values({ studentId, startedAt: sql`now()`, source: "timer" })
    .onConflictDoNothing()
    .returning();
  if (row) return row;
  const open = await getOpenSession(studentId);
  if (!open) throw new FocusError("Could not start the timer. Try again.");
  return open;
}

/**
 * Stops the running timer. Minutes are computed in SQL from the two server
 * timestamps and capped at MAX_SESSION_MINUTES.
 *
 * A session counts toward the week it started in, and is also cut off at that
 * week's end: a timer started Sunday night and stopped Monday morning credits
 * the minutes up to midnight and no more, because the week after midnight is
 * closed and may already have been locked.
 */
export async function stopSession(studentId: string): Promise<FocusSession | null> {
  const open = await getOpenSession(studentId);
  if (!open) return null;

  const cutoff = weekRange(weekStartFor(open.startedAt)).end;
  const endedAt = sql`LEAST(now(), ${cutoff.toISOString()}::timestamptz)`;
  const [row] = await db()
    .update(focusSessions)
    .set({
      endedAt,
      minutes: sql`LEAST(${MAX_SESSION_MINUTES}, FLOOR(EXTRACT(EPOCH FROM (${endedAt} - ${focusSessions.startedAt})) / 60))::int`,
    })
    .where(and(eq(focusSessions.id, open.id), isNull(focusSessions.endedAt)))
    .returning();
  return row ?? null;
}

/** Finished minutes per student for one week. Students with none are absent from the map. */
export async function focusMinutesByStudent(
  studentIds: string[],
  weekStart: WeekStart
): Promise<Map<string, number>> {
  if (studentIds.length === 0) return new Map();
  const { start, end } = weekRange(weekStart);
  const rows = await db()
    .select({
      studentId: focusSessions.studentId,
      minutes: sql<number>`COALESCE(SUM(${focusSessions.minutes}), 0)::int`,
    })
    .from(focusSessions)
    .where(
      and(
        inArray(focusSessions.studentId, studentIds),
        gte(focusSessions.startedAt, start),
        lt(focusSessions.startedAt, end),
        isNotNull(focusSessions.endedAt)
      )
    )
    .groupBy(focusSessions.studentId);
  return new Map(rows.map((r) => [r.studentId, r.minutes]));
}

export async function listSessions(studentId: string, weekStart: WeekStart): Promise<FocusSession[]> {
  const { start, end } = weekRange(weekStart);
  return db()
    .select()
    .from(focusSessions)
    .where(
      and(
        eq(focusSessions.studentId, studentId),
        gte(focusSessions.startedAt, start),
        lt(focusSessions.startedAt, end)
      )
    )
    .orderBy(asc(focusSessions.startedAt));
}

function assertMinutes(minutes: number): void {
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_SESSION_MINUTES) {
    throw new FocusError(`Minutes must be a whole number from 1 to ${MAX_SESSION_MINUTES}.`);
  }
}

/** An admin correction: a session the timer missed, recorded by hand. */
export async function addSession(
  studentId: string,
  startedAt: Date,
  minutes: number
): Promise<void> {
  assertMinutes(minutes);
  if (startedAt > new Date()) throw new FocusError("A session cannot start in the future.");
  assertWeekOpen(weekStartFor(startedAt));
  await db().insert(focusSessions).values({
    studentId,
    startedAt,
    endedAt: new Date(startedAt.getTime() + minutes * 60_000),
    minutes,
    source: "admin",
  });
}

async function getFinishedSession(sessionId: string, studentId: string): Promise<FocusSession> {
  const [row] = await db()
    .select()
    .from(focusSessions)
    .where(and(eq(focusSessions.id, sessionId), eq(focusSessions.studentId, studentId)))
    .limit(1);
  if (!row) throw new FocusError("That session no longer exists.");
  if (!row.endedAt) throw new FocusError("That session is still running.");
  assertWeekOpen(weekStartFor(row.startedAt));
  return row;
}

export async function updateSessionMinutes(
  sessionId: string,
  studentId: string,
  minutes: number
): Promise<void> {
  assertMinutes(minutes);
  const session = await getFinishedSession(sessionId, studentId);
  await db()
    .update(focusSessions)
    .set({ minutes, endedAt: new Date(session.startedAt.getTime() + minutes * 60_000) })
    .where(eq(focusSessions.id, sessionId));
}

export async function deleteSession(sessionId: string, studentId: string): Promise<void> {
  await getFinishedSession(sessionId, studentId);
  await db().delete(focusSessions).where(eq(focusSessions.id, sessionId));
}
