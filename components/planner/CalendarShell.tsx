import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarView = "month" | "week";

/**
 * The header both calendars share: title, Month/Week toggle, previous/next, and
 * the legend. Each route builds its own links, so the student page and the
 * consultant's tab keep their own URLs.
 */
export function CalendarShell({
  title,
  subtitle,
  view,
  monthHref,
  weekHref,
  prevHref,
  nextHref,
  todayHref,
  addHref,
  heading = "h1",
  children,
}: {
  title: string;
  subtitle?: string;
  view: CalendarView;
  monthHref: string;
  weekHref: string;
  prevHref: string;
  nextHref: string;
  /** Shown when the view is not already on today. */
  todayHref?: string;
  /** Omitted where the viewer can't add, which hides the button. */
  addHref?: string;
  heading?: "h1" | "h2";
  children: ReactNode;
}) {
  const Heading = heading;
  const unit = view === "month" ? "month" : "week";
  return (
    <section aria-labelledby="calendar-heading" className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Heading
            id="calendar-heading"
            className={cn(
              "font-[family-name:var(--font-playfair)] font-bold text-ink",
              heading === "h1" ? "text-[1.625rem]" : "text-[1.25rem]"
            )}
          >
            {title}
          </Heading>
          {subtitle && <p className="mt-1 text-[0.8125rem] font-medium text-subtle">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Calendar layout" className="flex gap-0.5 rounded-lg bg-[#efe9dc] p-1">
            {(
              [
                ["month", "Month", monthHref],
                ["week", "Week", weekHref],
              ] as const
            ).map(([key, label, href]) => (
              <Link
                key={key}
                href={href}
                aria-current={view === key ? "page" : undefined}
                className={cn(
                  "rounded-[5px] px-3.5 py-1.5 text-xs font-bold transition-colors",
                  view === key ? "bg-ink text-gold-soft" : "text-subtle hover:text-ink"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <nav aria-label={`Change ${unit}`} className="flex items-center gap-1 rounded-lg bg-[#efe9dc] p-1 text-ink">
            <Link href={prevHref} className="grid size-8 place-items-center rounded-md hover:bg-card" aria-label={`Previous ${unit}`}>
              <ChevronLeft className="size-4" aria-hidden />
            </Link>
            {todayHref && (
              <Link href={todayHref} className="rounded-md px-2 py-1.5 text-xs font-bold hover:bg-card">
                Today
              </Link>
            )}
            <Link href={nextHref} className="grid size-8 place-items-center rounded-md hover:bg-card" aria-label={`Next ${unit}`}>
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </nav>

          {addHref && (
            <Link href={addHref} className={buttonVariants({ variant: "ink", size: "portal" })}>
              <Plus aria-hidden /> Add assignment
            </Link>
          )}
        </div>
      </div>

      <Legend />
      {children}
    </section>
  );
}

function Legend() {
  return (
    <ul aria-label="Legend" className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.6875rem] font-medium text-subtle">
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="size-[11px] rounded-[3px] border-[1.5px] border-gold bg-[#fdf8e9]" />
        Due date
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="size-[11px] rounded-[3px] border-[1.5px] border-line border-l-[4px] border-l-ink bg-card" />
        Plan
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden className="size-[11px] rounded-[3px] border-[1.5px] border-[#8c3b2e] bg-[#fbefeb]" />
        Overdue
      </li>
    </ul>
  );
}
