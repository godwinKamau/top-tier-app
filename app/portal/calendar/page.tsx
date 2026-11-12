import type { Metadata } from "next";
import { CalendarShell } from "@/components/planner/CalendarShell";
import { MonthCalendar } from "@/components/planner/MonthCalendar";
import { WeekPlanner } from "@/components/planner/WeekPlanner";
import { listAssignments } from "@/lib/db/assignments";
import {
  calendarFrame,
  calendarLinks,
  resolveCalendar,
  studentEditHref,
  type CalendarQuery,
  type CalendarState,
} from "@/lib/planner/calendar";
import { currentMonth, currentWeek, todayInProgram } from "@/lib/week";
import { gatePortal } from "../gate";

export const metadata: Metadata = { title: "Calendar" };

/** Only what differs from the defaults goes in the URL. */
function calendarHref(state: CalendarState): string {
  const p = new URLSearchParams();
  if (state.view === "week") {
    p.set("view", "week");
    if (state.week !== currentWeek()) p.set("week", state.week);
  } else if (state.month !== currentMonth()) {
    p.set("month", state.month);
  }
  const qs = p.toString();
  return `/portal/calendar${qs ? `?${qs}` : ""}`;
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<CalendarQuery> }) {
  const gate = await gatePortal();
  if (!gate.ok) return gate.denied;
  const { student } = gate;

  const state = resolveCalendar(await searchParams);
  const frame = calendarFrame(state);
  const links = calendarLinks(state, calendarHref);
  const here = calendarHref(state);
  const back = encodeURIComponent(here);
  const today = todayInProgram();
  const assignments = await listAssignments(student.id, frame.from, frame.to);

  return (
    <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pt-7 pb-20 sm:px-6">
      <CalendarShell
        title={frame.title}
        view={state.view}
        {...links}
        addHref={`/portal/assignments/new?return=${back}`}
      >
        {state.view === "month" ? (
          <MonthCalendar
            days={frame.monthDays}
            assignments={assignments}
            today={today}
            weekHref={links.weekOf}
            newHref={(date) => `/portal/assignments/new?date=${date}&return=${back}`}
            editHref={(a) => studentEditHref(a, here)}
          />
        ) : (
          <WeekPlanner
            days={frame.weekDays}
            assignments={assignments}
            mode="student"
            today={today}
            editHref={(a) => studentEditHref(a, here)}
            showOverdue
          />
        )}
      </CalendarShell>
    </main>
  );
}
