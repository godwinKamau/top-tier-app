import type { Metadata } from "next";
import { FocusTimer } from "@/components/goals/FocusTimer";
import { getOpenSession, MAX_SESSION_MINUTES } from "@/lib/db/focus";
import { formatMinutes } from "@/lib/goals/catalog";
import { getWeekView } from "@/lib/goals/view";
import { cn } from "@/lib/utils";
import { currentWeek } from "@/lib/week";
import { gatePortal } from "../gate";

export const metadata: Metadata = { title: "Focus" };

/**
 * Focus mode: the one immersive surface in the portal. Deep navy so the page
 * itself recedes, with the clock as the only bright thing on it.
 */
export default async function FocusPage() {
  const gate = await gatePortal();
  if (!gate.ok) return gate.denied;
  const { student } = gate;

  const [open, view] = await Promise.all([
    getOpenSession(student.id),
    getWeekView(student.id, currentWeek()),
  ]);
  const focusGoals = view.goals.filter((g) => g.type === "focus_minutes");
  const target = focusGoals.reduce((sum, g) => sum + (g.targetMinutes ?? 0), 0);
  const left = Math.max(0, target - view.focusMinutes);

  return (
    <main className="flex flex-1 flex-col bg-ink text-white">
      <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-[1.75rem] font-bold">
            Deep work, {student.name.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-[0.8125rem] font-medium text-white/70 tabular-nums">
            {target > 0
              ? left > 0
                ? `${formatMinutes(left)} left toward your focus goal this week`
                : "Focus goal met for this week. Anything more is extra credit."
              : `${formatMinutes(view.focusMinutes)} logged this week`}
          </p>
        </div>

        <div className="my-auto py-12">
          <FocusTimer
            startedAt={open?.startedAt.toISOString() ?? null}
            serverNow={new Date().toISOString()}
            maxMinutes={MAX_SESSION_MINUTES}
          />
        </div>

        {focusGoals.length > 0 && (
          <section aria-labelledby="focus-goals" className="rounded-[10px] border border-white/12 bg-white/[0.04] px-4 py-4 sm:px-5">
            <h2 id="focus-goals" className="mb-3 text-[0.6875rem] font-extrabold tracking-[0.16em] text-white/70 uppercase">
              Weekly focus goal{focusGoals.length === 1 ? "" : "s"}
            </h2>
            <ul className="grid gap-3.5">
              {focusGoals.map((g) => {
                const done = g.status === "done";
                return (
                  <li key={g.id}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[0.8125rem]">
                      <span className="min-w-0 truncate font-semibold">{g.title}</span>
                      <span className={cn("shrink-0 font-semibold tabular-nums", done ? "text-[#b9cf86]" : "text-white/70")}>
                        {done ? "Done" : g.progressText}
                      </span>
                    </div>
                    <div className="h-[5px] overflow-hidden rounded-full bg-white/12" aria-hidden>
                      <div
                        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", done ? "bg-[#9fbf5a]" : "bg-gold")}
                        style={{ width: `${g.percent}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
