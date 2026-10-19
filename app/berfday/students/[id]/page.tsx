import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Lock, Trash2 } from "lucide-react";
import { NotAuthorized } from "@/components/berfday/NotAuthorized";
import { ActionForm } from "@/components/goals/ActionForm";
import { AdminGoalControls } from "@/components/goals/AdminGoalControls";
import { GoalForm } from "@/components/goals/GoalForm";
import { StudyLogAnswers } from "@/components/goals/StudyLogAnswers";
import { WeeklyGoals, WeekSummary } from "@/components/goals/WeeklyGoals";
import { Pill } from "@/components/portal/Pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDashboardAccess } from "@/lib/auth/dashboard";
import { listSessions, MAX_SESSION_MINUTES, type FocusSession } from "@/lib/db/focus";
import { getStudent } from "@/lib/db/students";
import { listStudyLogs } from "@/lib/db/studyLogs";
import { formatMinutes } from "@/lib/goals/catalog";
import { getWeekView } from "@/lib/goals/view";
import { cn } from "@/lib/utils";
import {
  currentWeek,
  parseWeekStart,
  PROGRAM_ZONE,
  shiftWeek,
  toProgramDateTimeInput,
} from "@/lib/week";
import {
  addSessionAction,
  copyLastWeekAction,
  deleteSessionAction,
  updateSessionAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Student",
  robots: { index: false, follow: false },
};

const sessionFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: PROGRAM_ZONE,
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TABS = [
  { key: "goals", label: "Weekly goals" },
  { key: "focus", label: "Focus sessions" },
  { key: "logs", label: "Study logs" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ week?: string; tab?: string }>;
}) {
  const access = await getDashboardAccess();
  if (access.status === "signed-out") {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }
  if (access.status === "forbidden") return <NotAuthorized />;

  const { id } = await params;
  // Checked before querying: Postgres rejects a malformed uuid with an error,
  // which would render as a crash rather than the 404 it is.
  if (!UUID.test(id)) notFound();
  const student = await getStudent(id);
  if (!student) notFound();

  const query = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === query.tab) ? (query.tab as Tab) : "goals";
  const thisWeek = currentWeek();
  const nextWeek = shiftWeek(thisWeek, 1);
  const requested = parseWeekStart(query.week);
  // Weeks after next have nothing to show or edit, so they fall back to now.
  const week = requested && requested <= nextWeek ? requested : thisWeek;

  const [view, sessions, logs] = await Promise.all([
    getWeekView(student.id, week),
    tab === "focus" ? listSessions(student.id, week) : Promise.resolve([]),
    tab === "logs" ? listStudyLogs(student.id) : Promise.resolve([]),
  ]);
  const focusTarget = view.goals
    .filter((g) => g.type === "focus_minutes")
    .reduce((sum, g) => sum + (g.targetMinutes ?? 0), 0);
  const openGoals = view.goals.filter((g) => g.status === "open").length;

  const href = (next: { week?: string; tab?: Tab }) => {
    const p = new URLSearchParams();
    const w = next.week ?? week;
    const t = next.tab ?? tab;
    if (w !== thisWeek) p.set("week", w);
    if (t !== "goals") p.set("tab", t);
    const qs = p.toString();
    return `/berfday/students/${student.id}${qs ? `?${qs}` : ""}`;
  };

  const meta = [
    student.grade,
    student.school,
    student.email,
    focusTarget > 0
      ? `${formatMinutes(view.focusMinutes)} / ${formatMinutes(focusTarget)} focus this week`
      : `${formatMinutes(view.focusMinutes)} focus this week`,
  ].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 pt-6 pb-20 sm:px-6">
      <Link
        href="/berfday"
        className="inline-flex items-center gap-1.5 pb-3 text-xs font-semibold text-subtle hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden /> All students
      </Link>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-[family-name:var(--font-playfair)] text-[1.625rem] font-bold text-ink">
              {student.name}
            </h1>
            {!student.clerkUserId && <Pill tone="muted">Not signed in yet</Pill>}
          </div>
          <p className="mt-1 text-[0.8125rem] font-medium text-subtle">{meta.join(" · ")}</p>
        </div>

        {tab !== "logs" && (
          <nav
            aria-label="Week"
            className="flex items-center gap-1 rounded-lg bg-[#efe9dc] p-1 text-ink"
          >
            <Link
              href={href({ week: shiftWeek(week, -1) })}
              className="grid size-8 place-items-center rounded-md hover:bg-card"
              aria-label="Previous week"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Link>
            <span className="min-w-[9.5rem] px-2 text-center text-xs font-bold">
              {view.label}
              <span className="block text-[0.6875rem] font-semibold text-subtle">
                {week === thisWeek ? "This week" : week === nextWeek ? "Next week" : view.open ? "Open" : "Closed"}
              </span>
            </span>
            {week < nextWeek ? (
              <Link
                href={href({ week: shiftWeek(week, 1) })}
                className="grid size-8 place-items-center rounded-md hover:bg-card"
                aria-label="Next week"
              >
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <span className="size-8" aria-hidden />
            )}
          </nav>
        )}
      </div>

      <nav aria-label="Student sections" className="mb-5 border-b-[1.5px] border-line">
        <ul className="-mb-[1.5px] flex gap-6 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <li key={t.key}>
                <Link
                  href={href({ tab: t.key })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 pb-2.5 text-[0.8125rem] font-semibold whitespace-nowrap transition-[color,box-shadow] duration-150",
                    active
                      ? "text-ink shadow-[inset_0_-2.5px_0_var(--color-gold)]"
                      : "text-subtle hover:text-ink hover:shadow-[inset_0_-2.5px_0_var(--color-line-strong)]"
                  )}
                >
                  {t.label}
                  {t.key === "goals" && openGoals > 0 && (
                    <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1.5 text-[0.6875rem] font-extrabold text-ink">
                      {openGoals}
                      <span className="sr-only"> open</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {tab === "goals" && (
        <div className="grid items-start gap-4 min-[900px]:grid-cols-[1.1fr_0.9fr]">
          <section aria-label="S.O.A.R. goals" className="grid gap-4">
            <p className="text-[0.8125rem] font-medium text-subtle">
              <WeekSummary view={view} />
            </p>
            {!view.open && (
              <p className="flex items-start gap-2 rounded-md border-[1.5px] border-dashed border-line-strong bg-ivory px-3 py-2.5 text-xs font-medium text-ink-soft">
                <Lock className="mt-px size-3.5 shrink-0 text-subtle" aria-hidden />
                This week is closed and its results are final. Overrides can still correct a goal.
              </p>
            )}
            <WeeklyGoals
              view={view}
              role="admin"
              emptyMessage={
                view.editable
                  ? "No goals for this week yet. Add one, or copy last week's."
                  : "No goals were set this week."
              }
              controls={(goal) => (
                <AdminGoalControls
                  goal={goal}
                  studentId={student.id}
                  weekStart={week}
                  editable={view.editable}
                />
              )}
            />
          </section>

          {view.editable && (
            <aside
              aria-labelledby="new-goal"
              className="grid gap-4 rounded-[9px] border-[1.5px] border-line bg-card p-4 shadow-[0_1px_2px_rgba(23,39,79,0.06)] min-[900px]:sticky min-[900px]:top-[86px] sm:p-5"
            >
              <div>
                <h2 id="new-goal" className="text-[0.875rem] font-bold text-ink">
                  New weekly goal
                </h2>
                <p className="mt-0.5 text-xs text-subtle">
                  For the week of {view.label}. It appears on {student.name.split(" ")[0]}&apos;s
                  dashboard right away.
                </p>
              </div>
              <GoalForm studentId={student.id} weekStart={week} />
              {view.goals.length === 0 && (
                <ActionForm action={copyLastWeekAction} className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <input type="hidden" name="studentId" value={student.id} />
                  <input type="hidden" name="weekStart" value={week} />
                  <Button type="submit" variant="line" size="portal">
                    <Copy aria-hidden /> Copy last week&apos;s goals
                  </Button>
                </ActionForm>
              )}
            </aside>
          )}
        </div>
      )}

      {tab === "focus" && (
        <FocusSessions studentId={student.id} sessions={sessions} open={view.open} week={week} total={view.focusMinutes} />
      )}

      {tab === "logs" && (
        <section aria-label="Study logs" className="grid max-w-[720px] gap-3">
          {logs.length === 0 ? (
            <p className="text-[0.8125rem] text-subtle">No study logs written yet.</p>
          ) : (
            logs.map((log) => <StudyLogAnswers key={log.id} log={log} />)
          )}
        </section>
      )}
    </main>
  );
}

function FocusSessions({
  studentId,
  sessions,
  open,
  week,
  total,
}: {
  studentId: string;
  sessions: FocusSession[];
  open: boolean;
  week: string;
  total: number;
}) {
  const ids = (sessionId: string) => (
    <>
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="sessionId" value={sessionId} />
    </>
  );
  // Prefill the add form with a time inside the week being viewed.
  const defaultStart = toProgramDateTimeInput(
    week === currentWeek() ? new Date() : new Date(`${week}T12:00:00Z`)
  );

  return (
    <section aria-labelledby="focus-heading" className="grid max-w-[720px] gap-4">
      <div className="rounded-[9px] border-[1.5px] border-line bg-card shadow-[0_1px_2px_rgba(23,39,79,0.06)]">
        <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <h2 id="focus-heading" className="text-[0.875rem] font-bold text-ink">Sessions</h2>
          <span className="text-xs font-semibold text-subtle tabular-nums">{formatMinutes(total)} total</span>
        </div>
        {sessions.length === 0 ? (
          <p className="px-4 py-6 text-[0.8125rem] text-subtle sm:px-5">No focus time logged this week.</p>
        ) : (
          <ul className="divide-y divide-line">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 text-[0.8125rem] sm:px-5">
                <span className="min-w-40 font-semibold text-ink">{sessionFormat.format(s.startedAt)}</span>
                {s.endedAt === null ? (
                  <Pill tone="gold">Running now</Pill>
                ) : open ? (
                  <ActionForm action={updateSessionAction} className="flex flex-wrap items-center gap-2">
                    {ids(s.id)}
                    <Label htmlFor={`m-${s.id}`} className="sr-only">
                      Minutes
                    </Label>
                    <Input
                      id={`m-${s.id}`}
                      name="minutes"
                      type="number"
                      min={1}
                      max={MAX_SESSION_MINUTES}
                      defaultValue={s.minutes ?? 0}
                      className="h-8 w-20"
                    />
                    <span className="text-subtle">min</span>
                    <Button type="submit" variant="line" size="portal-sm">
                      Save
                    </Button>
                  </ActionForm>
                ) : (
                  <span className="font-semibold text-subtle tabular-nums">{formatMinutes(s.minutes ?? 0)}</span>
                )}
                {s.source === "admin" && <Pill tone="muted">Added by staff</Pill>}
                {open && s.endedAt !== null && (
                  <ActionForm action={deleteSessionAction} className="ml-auto">
                    {ids(s.id)}
                    <Button type="submit" variant="ghost" size="icon-sm" aria-label="Delete session" className="text-destructive hover:bg-destructive/10">
                      <Trash2 />
                    </Button>
                  </ActionForm>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <div className="rounded-[9px] border-[1.5px] border-line bg-card p-4 sm:p-5">
          <h3 className="text-[0.875rem] font-bold text-ink">Add a missed session</h3>
          <p className="mt-0.5 text-xs text-subtle">For time the timer didn&apos;t catch. Chicago time.</p>
          <ActionForm action={addSessionAction} className="mt-3 flex flex-wrap items-end gap-3">
            <input type="hidden" name="studentId" value={studentId} />
            <div className="grid gap-1.5">
              <Label htmlFor="session-start">Started</Label>
              <Input id="session-start" name="startedAt" type="datetime-local" defaultValue={defaultStart} required className="w-auto" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="session-minutes">Minutes</Label>
              <Input id="session-minutes" name="minutes" type="number" min={1} max={MAX_SESSION_MINUTES} required className="w-24" />
            </div>
            <Button type="submit" variant="ink" size="portal">
              Add session
            </Button>
          </ActionForm>
        </div>
      )}
    </section>
  );
}
