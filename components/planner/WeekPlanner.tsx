import { Check } from "lucide-react";
import { setAssignmentDoneAction } from "@/app/portal/actions";
import { ActionForm } from "@/components/goals/ActionForm";
import type { Assignment } from "@/lib/db/assignments";
import { formatDayLabel } from "@/lib/week";
import { cn } from "@/lib/utils";
import { AssignmentRow } from "./AssignmentChip";

/**
 * Monday to Sunday with each day's plans and due dates. The same component is
 * the This week page, the calendar's week view, and the consultant's read-only
 * copy of it. `mode` decides whether entries can be checked off; `editHref`
 * decides which ones open for editing, since each side edits only its own.
 */
export function WeekPlanner({
  days,
  assignments,
  mode,
  today,
  editHref,
  showOverdue = false,
}: {
  days: string[];
  assignments: Assignment[];
  mode: "student" | "admin";
  today: string;
  /** The entry's edit page, or undefined for one this viewer can't edit. */
  editHref?: (a: Assignment) => string | undefined;
  showOverdue?: boolean;
}) {
  const byDay = new Map(days.map((d) => [d, [] as Assignment[]]));
  for (const a of assignments) byDay.get(a.date)?.push(a);

  return (
    <ol className="grid gap-2 lg:grid-cols-7">
      {days.map((day) => {
        const items = byDay.get(day) ?? [];
        const isToday = day === today;
        return (
          <li
            key={day}
            aria-label={formatDayLabel(day, "EEEE, MMMM d")}
            className={cn(
              "flex min-w-0 flex-col gap-1.5 rounded-lg border-[1.5px] bg-ivory p-2 lg:min-h-[140px]",
              isToday ? "border-gold bg-gold-wash" : "border-line"
            )}
          >
            <p className="flex items-baseline gap-1.5 px-0.5 lg:flex-col lg:gap-0">
              <span className="text-[0.625rem] font-extrabold tracking-[0.12em] text-subtle">
                {formatDayLabel(day, "EEE").toUpperCase()}
              </span>
              <span className={cn("text-sm font-bold", isToday ? "text-gold-deep" : "text-ink")}>
                {formatDayLabel(day, "MMM d")}
                {isToday && <span className="ml-1.5 text-[0.625rem] font-extrabold tracking-[0.1em]">TODAY</span>}
              </span>
            </p>
            {items.length === 0 ? (
              <p className="px-0.5 text-xs text-subtle/80">Nothing due.</p>
            ) : (
              <ul className="grid min-w-0 grid-cols-1 gap-1.5">
                {items.map((a) => (
                  <AssignmentRow
                    key={a.id}
                    assignment={a}
                    today={today}
                    showOverdue={showOverdue}
                    href={editHref?.(a)}
                    control={mode === "student" ? <DoneToggle assignment={a} /> : undefined}
                  />
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function DoneToggle({ assignment: a }: { assignment: Assignment }) {
  const done = a.completedAt !== null;
  return (
    <ActionForm action={setAssignmentDoneAction} className="contents">
      <input type="hidden" name="id" value={a.id} />
      <input type="hidden" name="done" value={done ? "false" : "true"} />
      <button
        type="submit"
        aria-pressed={done}
        aria-label={`${done ? "Mark not done" : "Mark done"}: ${a.title}`}
        className={cn(
          "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded border-[1.5px] transition-colors",
          done ? "border-done bg-done text-white" : "border-line-strong bg-card hover:border-ink"
        )}
      >
        {done && <Check className="size-3" strokeWidth={3} aria-hidden />}
      </button>
    </ActionForm>
  );
}
