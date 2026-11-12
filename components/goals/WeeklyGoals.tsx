import type { ReactNode } from "react";
import { Check, Target } from "lucide-react";
import { Pill } from "@/components/portal/Pill";
import { formatMinutes, SOAR_BY_KEY, SOAR_CATEGORIES } from "@/lib/goals/catalog";
import type { GoalView, WeekView } from "@/lib/goals/view";
import { cn } from "@/lib/utils";

/**
 * The week's S.O.A.R. goals as both the student and the admin see them. Both
 * pages pass the same WeekView from getWeekView(), so the bars, numbers and
 * DONE pills are the same on both sides by construction; only the controls
 * next to each goal differ, and each page supplies its own through `controls`
 * so neither page ships the other's actions to the browser.
 *
 * `layout="blocks"` lays the goals out as a wrapping grid of cards instead of
 * one banner per row, capped at half the viewport so the week fits on screen
 * beside everything else; past that the grid scrolls inside its own box.
 */
export function WeeklyGoals({
  view,
  role,
  controls,
  emptyMessage,
  layout = "rows",
}: {
  view: WeekView;
  role: "student" | "admin";
  controls?: (goal: GoalView) => ReactNode;
  emptyMessage: string;
  layout?: "rows" | "blocks";
}) {
  if (view.goals.length === 0) {
    return (
      <div className="rounded-[9px] border-[1.5px] border-dashed border-line-strong bg-card/60 px-6 py-10 text-center">
        <Target className="mx-auto mb-3 size-8 text-gold" aria-hidden />
        <p className="text-sm text-subtle text-pretty">{emptyMessage}</p>
      </div>
    );
  }

  if (layout === "blocks") {
    // One grid in S.O.A.R. order: a single row of four on large screens, 2x2
    // below that, stacked rows on phones. Each block names its own letter, so the
    // per-category headings the rows layout needs would only cost height.
    const order = SOAR_CATEGORIES.map((c) => c.key);
    const goals = [...view.goals].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
    return (
      <ul className="-mx-1 grid max-h-[50dvh] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 overflow-y-auto overscroll-contain px-1 py-1">
        {goals.map((goal) => (
          <GoalBlock key={goal.id} goal={goal} role={role} controls={controls?.(goal)} />
        ))}
      </ul>
    );
  }

  return (
    <div className="grid gap-6">
      {SOAR_CATEGORIES.map((category) => {
        const goals = view.goals.filter((g) => g.category === category.key);
        if (goals.length === 0) return null;
        return (
          <section key={category.key} aria-labelledby={`soar-${category.key}`}>
            <h3 id={`soar-${category.key}`} className="mb-2.5 flex items-baseline gap-2">
              <span
                aria-hidden
                className="font-[family-name:var(--font-playfair)] text-[1.375rem] leading-none font-bold text-gold"
              >
                {category.letter}
              </span>
              <span className="text-[0.6875rem] font-extrabold tracking-[0.16em] text-ink uppercase">
                {category.label}
              </span>
            </h3>
            <ul className="grid gap-2.5">
              {goals.map((goal) => (
                <GoalBanner key={goal.id} goal={goal} role={role} controls={controls?.(goal)} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/**
 * The prototype's goal banner. The coloured edge is state, not decoration:
 * gold while the goal is open, green once it is done, grey when excused, so a
 * column of banners reads at a glance without parsing a single pill.
 */
function GoalBanner({
  goal,
  role,
  controls,
}: {
  goal: GoalView;
  role: "student" | "admin";
  controls?: ReactNode;
}) {
  const done = goal.status === "done";
  const excused = goal.status === "excused";

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[9px] border-[1.5px] border-l-[5px] px-4 py-3.5 transition-colors duration-200",
        done && "border-done/25 border-l-done bg-done-wash/60",
        excused && "border-line border-l-line-strong bg-card",
        !done && !excused && "border-line border-l-gold bg-card"
      )}
    >
      <div className="flex min-w-0 flex-[1_1_18rem] items-center gap-3.5">
        <span
          aria-hidden
          className={cn(
            "grid size-[30px] shrink-0 place-items-center rounded-full",
            done ? "bg-done text-white" : excused ? "bg-muted text-subtle" : "bg-gold-wash text-gold-deep ring-1 ring-gold/35 ring-inset"
          )}
        >
          <Check className="size-[15px]" strokeWidth={done ? 3 : 2} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <p
              className={cn(
                "text-[0.875rem] font-bold text-pretty",
                done ? "text-done line-through decoration-done/50" : excused ? "text-subtle" : "text-ink"
              )}
            >
              {goal.title}
            </p>
            <StatusPill status={goal.status} role={role} />
          </div>
          {goal.detail && <p className="text-xs font-medium text-subtle text-pretty">{goal.detail}</p>}

          {/* A check-off task has no partial state, so an empty bar beside
              "Not done" would read as 0% progress rather than as a to-do. */}
          {goal.type === "manual" ? null : <GoalProgress goal={goal} className="mt-2" />}
        </div>
      </div>

      {controls && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 pl-[46px] has-[[data-editing]]:basis-full has-[[data-editing]]:pl-0",
            // Admin controls are a row of several buttons: always their own
            // line, so every banner in a column lines up the same way.
            role === "admin" ? "basis-full" : "sm:pl-0"
          )}
        >
          {controls}
        </div>
      )}
    </li>
  );
}

/**
 * The block version of a goal: a card in the student's grid. The coloured top
 * edge carries the same open / done / excused state as the banner's left edge.
 */
function GoalBlock({
  goal,
  role,
  controls,
}: {
  goal: GoalView;
  role: "student" | "admin";
  controls?: ReactNode;
}) {
  const done = goal.status === "done";
  const excused = goal.status === "excused";
  const category = SOAR_BY_KEY[goal.category];

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-[9px] border-[1.5px] border-t-[4px] p-3.5 transition-colors duration-200",
        done && "border-done/25 border-t-done bg-done-wash/60",
        excused && "border-line border-t-line-strong bg-card",
        !done && !excused && "border-line border-t-gold bg-card"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-baseline gap-1.5">
          <span
            aria-hidden
            className="font-[family-name:var(--font-playfair)] text-[1.125rem] leading-none font-bold text-gold"
          >
            {category.letter}
          </span>
          <span className="truncate text-[0.625rem] font-extrabold tracking-[0.14em] text-ink-soft uppercase">
            {category.label}
          </span>
        </span>
        <StatusPill status={goal.status} role={role} />
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "flex items-start gap-1.5 text-[0.875rem] font-bold text-pretty",
            done ? "text-done line-through decoration-done/50" : excused ? "text-subtle" : "text-ink"
          )}
        >
          {done && <Check className="mt-0.5 size-[14px] shrink-0" strokeWidth={3} aria-hidden />}
          {goal.title}
        </p>
        {goal.detail && <p className="mt-0.5 text-xs font-medium text-subtle text-pretty">{goal.detail}</p>}
      </div>

      {/* Same rule as the banner: a check-off task gets no empty bar. */}
      {goal.type === "manual" ? null : <GoalProgress goal={goal} />}

      {controls && <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">{controls}</div>}
    </li>
  );
}

function GoalProgress({ goal, className }: { goal: GoalView; className?: string }) {
  const done = goal.status === "done";
  const excused = goal.status === "excused";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="h-[5px] flex-1 overflow-hidden rounded-full bg-track"
        role="progressbar"
        aria-label={`${goal.title} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={goal.percent}
        aria-valuetext={goal.progressText}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            done ? "bg-done" : excused ? "bg-line-strong" : "bg-gold"
          )}
          style={{ width: `${goal.percent}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-semibold text-subtle tabular-nums">{goal.progressText}</span>
    </div>
  );
}

function StatusPill({ status, role }: { status: GoalView["status"]; role: "student" | "admin" }) {
  if (status === "done") return <Pill tone="done">Done</Pill>;
  if (status === "excused") return <Pill tone="muted">Excused</Pill>;
  return <Pill tone="gold">{role === "student" ? "This week" : "Open"}</Pill>;
}

/** One line under a week heading: the same summary on both sides. */
export function WeekSummary({ view }: { view: WeekView }) {
  return (
    <span className="tabular-nums">
      {view.done} of {view.counted} goal{view.counted === 1 ? "" : "s"} done ·{" "}
      {formatMinutes(view.focusMinutes)} focus · study log{" "}
      {view.studyLogSubmitted ? "submitted" : "not submitted"}
    </span>
  );
}
