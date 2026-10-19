import Link from "next/link";
import { Clock } from "lucide-react";
import { ActionForm } from "@/components/goals/ActionForm";
import { WeeklyGoals, WeekSummary } from "@/components/goals/WeeklyGoals";
import { Button, buttonVariants } from "@/components/ui/button";
import type { GoalView } from "@/lib/goals/view";
import { getWeekView } from "@/lib/goals/view";
import { currentWeek } from "@/lib/week";
import { setManualDoneAction } from "./actions";
import { gatePortal } from "./gate";

export default async function PortalPage() {
  const gate = await gatePortal();
  if (!gate.ok) return gate.denied;
  const { student } = gate;

  const view = await getWeekView(student.id, currentWeek());

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
