import type { CalendarView } from "@/components/planner/CalendarShell";
import type { Assignment } from "@/lib/db/assignments";
import {
  currentMonth,
  currentWeek,
  formatMonthLabel,
  formatWeekLabel,
  monthGridDays,
  parseMonth,
  parseWeekStart,
  shiftMonth,
  shiftWeek,
  weekDays,
  weekStartOfDate,
  type MonthKey,
  type WeekStart,
} from "@/lib/week";

export type CalendarQuery = { view?: string; month?: string; week?: string };

export type CalendarState = {
  view: CalendarView;
  month: MonthKey;
  week: WeekStart;
};

/**
 * Reads the calendar's search params, falling back to this month and this week
 * for anything missing or hand-edited into nonsense. Month is the default view.
 */
export function resolveCalendar(query: CalendarQuery): CalendarState {
  return {
    view: query.view === "week" ? "week" : "month",
    month: parseMonth(query.month) ?? currentMonth(),
    week: parseWeekStart(query.week) ?? currentWeek(),
  };
}

/** What the current view shows: its days, title, and the range to load. */
export function calendarFrame(state: CalendarState) {
  if (state.view === "week") {
    const days = weekDays(state.week);
    return { title: `Week of ${formatWeekLabel(state.week)}`, from: days[0], to: days[6], weekDays: days, monthDays: [] };
  }
  const monthDays = monthGridDays(state.month);
  return {
    title: formatMonthLabel(state.month),
    from: monthDays[0].date,
    to: monthDays[monthDays.length - 1].date,
    weekDays: [],
    monthDays,
  };
}

/**
 * The links the shell needs, given a function that turns a state into a URL.
 * Switching layouts carries the place over: month → week opens the first week
 * of that month (or this week, when it is this month), week → month opens the
 * month the week starts in.
 */
export function calendarLinks(state: CalendarState, href: (next: CalendarState) => string) {
  const thisMonth = currentMonth();
  const thisWeek = currentWeek();
  const weekForMonth = state.month === thisMonth ? thisWeek : weekStartOfDate(`${state.month}-01`);
  const toWeek = state.view === "week" ? state : { ...state, view: "week" as const, week: weekForMonth };
  const toMonth = state.view === "month" ? state : { ...state, view: "month" as const, month: state.week.slice(0, 7) };
  const step = (n: number) =>
    state.view === "month" ? { ...state, month: shiftMonth(state.month, n) } : { ...state, week: shiftWeek(state.week, n) };
  const onToday = state.view === "month" ? state.month === thisMonth : state.week === thisWeek;
  return {
    monthHref: href(toMonth),
    weekHref: href(toWeek),
    prevHref: href(step(-1)),
    nextHref: href(step(1)),
    todayHref: onToday ? undefined : href({ ...state, month: thisMonth, week: thisWeek }),
    weekOf: (week: WeekStart) => href({ ...state, view: "week", week }),
  };
}

/**
 * The student's edit page for an entry, or undefined for one a consultant
 * assigned: the student can check that off but not change it.
 */
export function studentEditHref(a: Pick<Assignment, "id" | "author">, returnTo: string): string | undefined {
  return a.author === "student" ? `/portal/assignments/${a.id}?return=${encodeURIComponent(returnTo)}` : undefined;
}

/**
 * Where an assignment form goes back to. Only the two pages that link to it are
 * accepted, so a crafted `return` param cannot send the student off-site.
 */
export function safeReturnPath(value: unknown): string {
  return typeof value === "string" && /^\/portal(\/calendar)?(\?[^#\\]*)?$/.test(value) ? value : "/portal";
}

/**
 * The consultant's version: only this student's profile page, so the form can
 * neither leave the dashboard nor land on a different student.
 */
export function safeAdminReturnPath(value: unknown, studentId: string): string {
  const base = `/berfday/students/${studentId}`;
  return typeof value === "string" && value.startsWith(base) && /^(\?[^#\\]*)?$/.test(value.slice(base.length))
    ? value
    : `${base}?tab=calendar`;
}
