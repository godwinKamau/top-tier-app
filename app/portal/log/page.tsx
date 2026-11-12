import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { ActionForm } from "@/components/goals/ActionForm";
import { STUDY_LOG_QUESTIONS, StudyLogAnswers } from "@/components/goals/StudyLogAnswers";
import { Pill } from "@/components/portal/Pill";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listStudyLogs } from "@/lib/db/studyLogs";
import { currentWeek, formatWeekLabel } from "@/lib/week";
import { saveStudyLogAction } from "../actions";
import { gatePortal } from "../gate";

export const metadata: Metadata = { title: "Study log" };

const PROMPTS: Record<(typeof STUDY_LOG_QUESTIONS)[number]["name"], string> = {
  completed: "Assignments finished, chapters read, problems worked…",
  remaining: "What's still on your plate going into next week?",
  blockers: "Anything in your way? \"None\" is a fine answer.",
  learned: "One thing that clicked, or a way of working that helped.",
};

export default async function StudyLogPage() {
  const gate = await gatePortal();
  if (!gate.ok) return gate.denied;
  const { student } = gate;

  const week = currentWeek();
  const logs = await listStudyLogs(student.id);
  const current = logs.find((l) => l.weekStart === week);
  const past = logs.filter((l) => l.weekStart < week);
  const submitted = Boolean(current?.submittedAt);

  return (
    <main className="mx-auto w-full max-w-[900px] flex-1 px-4 pt-7 pb-20 sm:px-6">
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-[family-name:var(--font-playfair)] text-[1.625rem] font-bold text-ink">
            Weekly study log
          </h1>
          <Pill tone={submitted ? "done" : "gold"}>{submitted ? "Submitted" : "Not submitted"}</Pill>
        </div>
        <p className="mt-1 text-[0.8125rem] font-medium text-subtle text-pretty">
          Week of {formatWeekLabel(week)}. Four short answers; your consultant reads it before your
          next meeting.
          {submitted && " You can still edit it until Sunday night."}
        </p>
      </div>

      <ActionForm
        action={saveStudyLogAction}
        className="grid gap-4 rounded-[9px] border-[1.5px] border-line bg-card p-4 shadow-[0_1px_2px_rgba(23,39,79,0.06)] sm:grid-cols-2 sm:p-5"
      >
        {STUDY_LOG_QUESTIONS.map((q) => (
          <div key={q.name} className="grid content-start gap-1.5">
            <Label htmlFor={`log-${q.name}`} className="text-[0.6875rem] font-extrabold tracking-[0.12em] uppercase">
              {q.label}
            </Label>
            <Textarea
              id={`log-${q.name}`}
              name={q.name}
              defaultValue={current?.[q.name] ?? ""}
              placeholder={PROMPTS[q.name]}
              rows={4}
              className="min-h-24"
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" name="intent" value="submit" variant="ink" size="portal">
            {submitted ? "Save changes" : "Submit log"}
          </Button>
          {!submitted && (
            <Button type="submit" name="intent" value="save" variant="line" size="portal">
              Save draft
            </Button>
          )}
        </div>
      </ActionForm>

      {past.length > 0 && (
        <section className="mt-10" aria-labelledby="past-weeks">
          <h2 id="past-weeks" className="mb-3 text-[0.6875rem] font-extrabold tracking-[0.16em] text-subtle uppercase">
            Past weeks
          </h2>
          <div className="grid gap-2">
            {past.map((log) => (
              <details key={log.id} className="group rounded-[9px] border-[1.5px] border-line bg-card">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[0.8125rem] font-bold text-ink [&::-webkit-details-marker]:hidden">
                  <ChevronRight className="size-4 text-subtle transition-transform duration-200 group-open:rotate-90" aria-hidden />
                  Week of {formatWeekLabel(log.weekStart)}
                  <span className="ml-auto">
                    {log.submittedAt ? <Pill tone="done">Submitted</Pill> : <Pill tone="muted">Not submitted</Pill>}
                  </span>
                </summary>
                <div className="border-t border-line px-4 pt-3 pb-4">
                  <StudyLogAnswers log={log} bare />
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
