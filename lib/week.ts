import { TZDate } from "@date-fns/tz";
import { addWeeks, format, isMonday, startOfWeek } from "date-fns";

/**
 * Everything about "which week is it" for the student portal. The program runs
 * on Chicago time and weeks run Monday 00:00 to Sunday 23:59, so a log entry at
 * 11:58pm Sunday counts for the week it looks like it belongs to, whatever zone
 * the server or the student's laptop is in. TZDate does the DST arithmetic, so
 * the spring-forward and fall-back weeks are 167 and 169 hours long, correctly.
 *
 * A week is identified by its Monday as a `YYYY-MM-DD` string — the same shape
 * the `week_start` date columns store — rather than a Date, which would carry a
 * time and a zone that mean nothing here.
 */

export const PROGRAM_ZONE = "America/Chicago";

export type WeekStart = string;

const WEEK_START_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function mondayOf(weekStart: WeekStart): TZDate {
  const [y, m, d] = weekStart.split("-").map(Number);
  return new TZDate(y, m - 1, d, PROGRAM_ZONE);
}

/** The week an instant falls in. */
export function weekStartFor(instant: Date): WeekStart {
  const local = new TZDate(instant, PROGRAM_ZONE);
  return format(startOfWeek(local, { weekStartsOn: 1 }), "yyyy-MM-dd");
}

export function currentWeek(): WeekStart {
  return weekStartFor(new Date());
}

export function shiftWeek(weekStart: WeekStart, weeks: number): WeekStart {
  return format(addWeeks(mondayOf(weekStart), weeks), "yyyy-MM-dd");
}

/**
 * For untrusted input (a search param, a form field). Returns null unless it is
 * a real Monday, so a hand-edited URL cannot create a goal for "a week" that
 * starts on a Thursday and overlaps two real ones.
 */
export function parseWeekStart(value: unknown): WeekStart | null {
  if (typeof value !== "string" || !WEEK_START_PATTERN.test(value)) return null;
  const monday = mondayOf(value);
  if (Number.isNaN(monday.getTime()) || !isMonday(monday)) return null;
  // Rejects rollovers such as 2026-02-30 → March 2.
  return format(monday, "yyyy-MM-dd") === value ? value : null;
}

/** [start, end) as instants, for querying timestamptz columns. */
export function weekRange(weekStart: WeekStart): { start: Date; end: Date } {
  const start = mondayOf(weekStart);
  return { start: new Date(start.getTime()), end: new Date(addWeeks(start, 1).getTime()) };
}

/** Open until the Monday after it begins. Closed weeks accept no writes. */
export function isWeekOpen(weekStart: WeekStart, now: Date = new Date()): boolean {
  return now < weekRange(weekStart).end;
}

/**
 * Which weeks an admin may edit goals for: this one and the next. Past weeks are
 * locked; anything further out is planning nobody has asked for yet.
 */
export function isWeekEditable(weekStart: WeekStart, now: Date = new Date()): boolean {
  const current = weekStartFor(now);
  return weekStart === current || weekStart === shiftWeek(current, 1);
}

export class ClosedWeekError extends Error {
  constructor(weekStart: WeekStart) {
    super(`The week of ${weekStart} is closed and can no longer be changed.`);
    this.name = "ClosedWeekError";
  }
}

export function assertWeekOpen(weekStart: WeekStart): void {
  if (!isWeekOpen(weekStart)) throw new ClosedWeekError(weekStart);
}

/** "Oct 19 – Oct 25" */
export function formatWeekLabel(weekStart: WeekStart): string {
  const monday = mondayOf(weekStart);
  const sunday = addWeeks(monday, 1);
  sunday.setDate(sunday.getDate() - 1);
  return `${format(monday, "MMM d")} – ${format(sunday, "MMM d")}`;
}

/**
 * Reads a `<input type="datetime-local">` value ("2026-10-19T14:30") as Chicago
 * wall-clock time. The browser sends no zone with it, and the admin entering it
 * means program time, not the server's.
 */
export function parseProgramDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const local = new TZDate(y, mo - 1, d, h, mi, PROGRAM_ZONE);
  return Number.isNaN(local.getTime()) ? null : new Date(local.getTime());
}

/** The inverse, for prefilling a datetime-local input. */
export function toProgramDateTimeInput(instant: Date): string {
  return format(new TZDate(instant, PROGRAM_ZONE), "yyyy-MM-dd'T'HH:mm");
}
