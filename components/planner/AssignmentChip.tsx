import { useId, type ReactNode } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import type { Assignment } from "@/lib/db/assignments";
import { cn } from "@/lib/utils";

/**
 * Where an assignment stands on a given day. Only a past due date that isn't
 * done is overdue; a past plan that wasn't followed is just muted, because a
 * missed plan is not a missed deadline.
 */
export function assignmentState(a: Assignment, today: string, showOverdue: boolean) {
  const done = a.completedAt !== null;
  const past = a.date < today;
  const overdue = showOverdue && a.kind === "due" && !done && past;
  const muted = done || (a.kind === "plan" && past);
  return { done, overdue, muted };
}

function kicker(a: Assignment, overdue: boolean): string {
  const kind = overdue ? "OVERDUE" : a.kind === "due" ? "DUE" : "PLAN";
  return a.author === "admin" ? `${kind} · ASSIGNED` : kind;
}

const SURFACE = {
  due: "border-[1.5px] border-gold bg-[#fdf8e9]",
  plan: "border-[1.5px] border-line border-l-[4px] border-l-ink bg-card",
  overdue: "border-[1.5px] border-[#8c3b2e] bg-[#fbefeb]",
};

function surface(a: Assignment, overdue: boolean): string {
  return overdue ? SURFACE.overdue : SURFACE[a.kind];
}

/** One line for screen readers and the hover detail: "Due · Algebra I · assigned · done". */
function summary(a: Assignment, done: boolean, overdue: boolean): string {
  const parts = [overdue ? "Overdue" : a.kind === "due" ? "Due" : "Plan", a.className];
  if (a.author === "admin") parts.push("assigned");
  if (done) parts.push("done");
  return parts.join(" · ");
}

/** The roomy form used in the week planner: kicker, title, notes, and an optional control. */
export function AssignmentRow({
  assignment: a,
  today,
  showOverdue = false,
  href,
  control,
}: {
  assignment: Assignment;
  today: string;
  showOverdue?: boolean;
  href?: string;
  control?: ReactNode;
}) {
  const { done, overdue, muted } = assignmentState(a, today, showOverdue);
  return (
    <li
      className={cn(
        "flex items-start gap-2 rounded-md px-2.5 py-2",
        surface(a, overdue),
        muted && "opacity-60"
      )}
    >
      {control}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-[0.625rem] font-extrabold tracking-[0.1em]",
            overdue ? "text-[#7a3327]" : a.kind === "due" ? "text-gold-deep" : "text-subtle"
          )}
        >
          {kicker(a, overdue)} · {a.className}
        </p>
        {href ? (
          <Link
            href={href}
            className={cn(
              "block text-[0.8125rem] leading-snug font-bold wrap-anywhere text-ink hover:underline",
              done && "line-through"
            )}
          >
            {a.title}
          </Link>
        ) : (
          <p className={cn("text-[0.8125rem] leading-snug font-bold wrap-anywhere text-ink", done && "line-through")}>
            {a.title}
          </p>
        )}
        {done && <span className="sr-only">, done</span>}
        {a.notes && <p className="mt-0.5 line-clamp-3 text-xs wrap-anywhere text-subtle">{a.notes}</p>}
      </div>
    </li>
  );
}

/**
 * The compact form used in a month cell. A link when the viewer can edit it;
 * otherwise a focusable chip that opens its notes on hover or focus, which is
 * how the consultant's read-only calendar shows detail.
 */
export function AssignmentChip({
  assignment: a,
  today,
  href,
  alignEnd = false,
}: {
  assignment: Assignment;
  today: string;
  href?: string;
  /** Open the detail leftward, for the weekend columns at the grid's right edge. */
  alignEnd?: boolean;
}) {
  const tipId = useId();
  const { done, overdue, muted } = assignmentState(a, today, true);
  const label = summary(a, done, overdue);
  const className = cn(
    "flex w-full min-w-0 items-center gap-1 rounded px-1.5 py-0.5 text-left text-[0.6875rem] font-semibold text-ink",
    surface(a, overdue),
    a.kind === "plan" && !overdue && "border-l-[3px]",
    muted && "opacity-60"
  );
  const body = (
    <>
      {a.author === "admin" && <UserRound className="size-2.5 shrink-0 text-subtle" strokeWidth={2.5} aria-hidden />}
      {a.kind === "due" && (
        <span className={cn("shrink-0 text-[0.5625rem] font-extrabold", overdue ? "text-[#7a3327]" : "text-gold-deep")}>
          {overdue ? "LATE" : "DUE"}
        </span>
      )}
      <span className={cn("truncate", done && "line-through")}>{a.title}</span>
      <span className="sr-only">, {label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(className, "hover:brightness-95")} title={`${a.title} — ${label}`}>
        {body}
      </Link>
    );
  }
  return (
    <span className="group relative block min-w-0">
      <span tabIndex={0} aria-describedby={a.notes ? tipId : undefined} className={cn(className, "cursor-default")}>
        {body}
      </span>
      <span
        id={tipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-full z-20 mt-1 hidden w-56 rounded-md border-[1.5px] border-line bg-card p-2.5 text-xs text-ink shadow-[0_6px_20px_rgba(23,39,79,0.15)] group-focus-within:block group-hover:block",
          alignEnd ? "right-0" : "left-0"
        )}
      >
        <span className="block text-[0.625rem] font-extrabold tracking-[0.1em] text-subtle">{label.toUpperCase()}</span>
        <span className="mt-0.5 block font-bold wrap-anywhere">{a.title}</span>
        {a.notes && <span className="mt-1 block wrap-anywhere text-subtle">{a.notes}</span>}
      </span>
    </span>
  );
}
