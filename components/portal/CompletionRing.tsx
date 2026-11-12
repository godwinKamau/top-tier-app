import { cn } from "@/lib/utils";

/**
 * Goals done this week as a ring, the prototype's roster signature. It carries a
 * real number (done of counted), never decoration; with no goals set it shows a
 * dash rather than a 0% that would read as failure.
 */
export function CompletionRing({
  done,
  counted,
  className,
}: {
  done: number;
  counted: number;
  className?: string;
}) {
  const pct = counted === 0 ? null : Math.round((done / counted) * 100);
  const complete = pct === 100;
  const color = complete ? "var(--color-done)" : "var(--color-gold)";
  return (
    <div
      role="img"
      aria-label={pct === null ? "No goals set" : `${done} of ${counted} goals done`}
      className={cn("grid size-11 shrink-0 place-items-center rounded-full", className)}
      style={{
        background:
          pct === null
            ? "var(--color-track)"
            : `conic-gradient(${color} ${pct * 3.6}deg, var(--color-track) 0deg)`,
      }}
    >
      <span className="grid size-[34px] place-items-center rounded-full bg-card text-[0.6875rem] font-extrabold text-ink">
        {pct === null ? "—" : `${pct}%`}
      </span>
    </div>
  );
}
