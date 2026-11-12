import { Pill } from "@/components/portal/Pill";
import type { StudyLog } from "@/lib/db/studyLogs";
import { formatWeekLabel, PROGRAM_ZONE } from "@/lib/week";

export const STUDY_LOG_QUESTIONS = [
  { name: "completed", label: "What I completed" },
  { name: "remaining", label: "What is left" },
  { name: "blockers", label: "Blockers" },
  { name: "learned", label: "What I learned" },
] as const;

const submittedFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: PROGRAM_ZONE,
});

/**
 * A week's log, read-only, as the prototype's log card: the admin's Study logs
 * tab and the student's past weeks. `bare` drops the card chrome for use inside
 * a container that already has it (a <details> past-week row).
 */
export function StudyLogAnswers({ log, bare = false }: { log: StudyLog; bare?: boolean }) {
  const body = (
    <>
      {!bare && (
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[0.875rem] font-bold text-ink">Week of {formatWeekLabel(log.weekStart)}</p>
          {log.submittedAt ? (
            <span className="text-xs font-medium text-subtle">
              Submitted {submittedFormat.format(log.submittedAt)}
            </span>
          ) : (
            <Pill tone="muted">Draft</Pill>
          )}
        </div>
      )}
      <dl className="grid gap-3 sm:grid-cols-2 sm:gap-x-6">
        {STUDY_LOG_QUESTIONS.map((q) => (
          <div key={q.name}>
            <dt className="mb-0.5 text-[0.6875rem] font-extrabold tracking-[0.12em] text-subtle uppercase">
              {q.label}
            </dt>
            <dd className="text-[0.8125rem] leading-relaxed whitespace-pre-line text-ink-soft">
              {log[q.name] || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );

  if (bare) return body;
  return <article className="rounded-[9px] border-[1.5px] border-line bg-card px-4 py-4 sm:px-5">{body}</article>;
}
