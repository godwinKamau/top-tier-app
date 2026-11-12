import Link from "next/link";
import { CalendarDays, Clock, Plus } from "lucide-react";
import { ActionForm } from "@/components/goals/ActionForm";
import { WeeklyGoals, WeekSummary } from "@/components/goals/WeeklyGoals";
import { WeekPlanner } from "@/components/planner/WeekPlanner";
import { Button, buttonVariants } from "@/components/ui/button";
import type { GoalView } from "@/lib/goals/view";
import { getWeekView } from "@/lib/goals/view";
import { listAssignments } from "@/lib/db/assignments";
import { studentEditHref } from "@/lib/planner/calendar";
import { currentWeek, todayInProgram, weekDays } from "@/lib/week";
import { setManualDoneAction } from "./actions";
import { gatePortal } from "./gate";

export default async function PortalPage() {
  const gate = await gatePortal();
  if (!gate.ok) return gate.denied;
  const { student } = gate;

  const week = currentWeek();
  const days = weekDays(week);
  const [view, assignments] = await Promise.all([
    getWeekView(student.id, week),
    listAssignments(student.id, days[0], days[6]),
  ]);

  return (
    <main className="mx-auto w-full max-w-[920px] flex-1 px-4 pt-7 pb-20 sm:px-6">
      <section
        aria-labelledby="soar-heading"
        className="rounded-[10px] border-[1.5px] border-t-[5px] border-gold bg-card px-4 pt-5 pb-5 shadow-[0_2px_10px_rgba(23,39,79,0.07)] sm:px-6"
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1
              id="soar-heading"
              className="font-[family-name:var(--font-playfair)] text-[1.625rem] font-bold text-ink"
            >
              Your S.O.A.R. Goals
            </h1>
            <p className="mt-1 text-[0.8125rem] font-medium text-subtle">
              Week of {view.label} · <WeekSummary view={view} />
            </p>
          </div>
          <Link href="/portal/focus" className={buttonVariants({ variant: "ink", size: "portal" })}>
            <Clock aria-hidden /> Focus mode
          </Link>
        </div>

        <WeeklyGoals
          view={view}
          role="student"
          layout="blocks"
          emptyMessage="No goals set for this week yet. Your consultant will add them, and they'll show up here."
          controls={(goal) => <StudentGoalAction goal={goal} />}
        />
      </section>

      <section aria-labelledby="planner-heading" className="mt-8 grid gap-4">
        <div>
          <h2
            id="planner-heading"
            className="font-[family-name:var(--font-playfair)] text-[1.375rem] font-bold text-ink"
          >
            This week&apos;s planner
          </h2>
          <p className="mt-1 text-[0.8125rem] font-medium text-subtle">
            What you&apos;re working on and what&apos;s due, Monday to Sunday.
          </p>
        </div>

        <WeekPlanner
          days={days}
          assignments={assignments}
          mode="student"
          today={todayInProgram()}
          editHref={(a) => studentEditHref(a, "/portal")}
        />

        <div className="flex flex-wrap gap-2">
          <Link href="/portal/calendar" className={buttonVariants({ variant: "line", size: "portal" })}>
            <CalendarDays aria-hidden /> Open calendar
          </Link>
          <Link
            href="/portal/assignments/new?return=%2Fportal"
            className={buttonVariants({ variant: "ink", size: "portal" })}
          >
            <Plus aria-hidden /> Add assignment
          </Link>
        </div>
      </section>
    </main>
  );
}

/** The one thing to do next for each goal, as a link to where it gets done. */
function StudentGoalAction({ goal }: { goal: GoalView }) {
  if (goal.status === "excused") return null;

  switch (goal.type) {
    case "focus_minutes":
      return goal.status === "done" ? null : (
        <Link href="/portal/focus" className={buttonVariants({ variant: "ink", size: "portal-sm" })}>
          Open focus
        </Link>
      );
    case "assignments":
      return goal.status === "done" ? null : (
        <Link href="/portal/calendar" className={buttonVariants({ variant: "ink", size: "portal-sm" })}>
          Open planner
        </Link>
      );
    case "study_log":
      return (
        <Link
          href="/portal/log"
          className={buttonVariants({ variant: goal.status === "done" ? "line" : "ink", size: "portal-sm" })}
        >
          {goal.status === "done" ? "View log" : "Fill it out"}
        </Link>
      );
    case "manual":
      // An admin override decides it; the student's check would change nothing.
      if (goal.override) return null;
      return (
        <ActionForm action={setManualDoneAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="goalId" value={goal.id} />
          <input type="hidden" name="done" value={goal.manuallyDone ? "false" : "true"} />
          <Button type="submit" variant={goal.manuallyDone ? "line" : "ink"} size="portal-sm">
            {goal.manuallyDone ? "Undo" : "Mark done"}
          </Button>
        </ActionForm>
      );
  }
}
