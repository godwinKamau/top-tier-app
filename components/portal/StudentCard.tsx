import Link from "next/link";
import { formatMinutes } from "@/lib/goals/catalog";
import type { RosterRow } from "@/lib/goals/view";
import { cn } from "@/lib/utils";
import { CompletionRing } from "./CompletionRing";
import { Pill, type PillTone } from "./Pill";

/** Below a third of the week's focus target, as in the prototype. */
const FOCUS_LOW_RATIO = 0.34;

/**
 * One student on the roster, as the prototype's "My Students" card: who they
 * are, how much of the week is done, and flags for whatever needs a look. The
 * flags are derived from the same RosterRow the detail page agrees with.
 */
export function StudentCard({ row }: { row: RosterRow }) {
  const { student, done, counted, focusMinutes, focusTarget, logAsked, studyLogSubmitted } = row;
  const open = counted - done;

  const flags: { label: string; tone: PillTone }[] = [];
  if (open > 0) flags.push({ label: `${open} open`, tone: "gold" });
  if (logAsked && !studyLogSubmitted) flags.push({ label: "Log missing", tone: "alert" });
  if (focusTarget > 0 && focusMinutes < focusTarget * FOCUS_LOW_RATIO) {
    flags.push({ label: "Focus low", tone: "alert" });
  }
  if (counted > 0 && open === 0) flags.push({ label: "All done", tone: "done" });
  if (!student.clerkUserId) flags.push({ label: "Not signed in", tone: "muted" });

  const focusPct = focusTarget > 0 ? Math.min(100, Math.round((focusMinutes / focusTarget) * 100)) : 0;
  const meta = [student.grade, student.school].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/berfday/students/${student.id}`}
      className={cn(
        "group flex flex-col gap-3 rounded-[9px] border-[1.5px] bg-card p-4 shadow-[0_1px_2px_rgba(23,39,79,0.06)] transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_6px_18px_-8px_rgba(23,39,79,0.25)]",
        open > 0 ? "border-gold/70 hover:border-gold" : "border-line hover:border-line-strong"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.9375rem] font-bold text-ink group-hover:underline group-hover:decoration-gold group-hover:underline-offset-4">
            {student.name}
          </p>
          <p className="mt-0.5 truncate text-xs font-medium text-subtle">{meta || student.email}</p>
        </div>
        <CompletionRing done={done} counted={counted} />
      </div>

      <div className="flex min-h-5 flex-wrap gap-1.5">
        {flags.map((f) => (
          <Pill key={f.label} tone={f.tone}>
            {f.label}
          </Pill>
        ))}
        {counted === 0 && <span className="text-xs text-subtle">No goals set this week</span>}
      </div>

      <div className="mt-auto grid gap-1.5 border-t border-ink/10 pt-2.5">
        <div className="flex justify-between gap-3 text-xs font-medium text-subtle tabular-nums">
          <span>
            {counted === 0 ? "—" : `${done} of ${counted} done`}
          </span>
          <span>
            {focusTarget > 0
              ? `${formatMinutes(focusMinutes)} / ${formatMinutes(focusTarget)} focus`
              : `${formatMinutes(focusMinutes)} focus`}
          </span>
        </div>
        <div className="h-[5px] overflow-hidden rounded-full bg-track" aria-hidden>
          <div className="h-full rounded-full bg-gold" style={{ width: `${focusPct}%` }} />
        </div>
      </div>
    </Link>
  );
}
