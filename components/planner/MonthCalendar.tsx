import Link from "next/link";
import type { Assignment } from "@/lib/db/assignments";
import { formatDayLabel, weekStartOfDate } from "@/lib/week";
import { cn } from "@/lib/utils";
import { assignmentState, AssignmentChip } from "./AssignmentChip";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VISIBLE = 3;

/**
 * A month of whole Mon–Sun weeks. Phones get a dot per entry and a link to that
 * week, since seven columns leave no room for titles; wider screens get chips.
 */
export function MonthCalendar({
  days,
  assignments,
  today,
  weekHref,
  newHref,
  editHref,
}: {
  days: { date: string; inMonth: boolean }[];
  assignments: Assignment[];
  today: string;
  weekHref: (weekStart: string) => string;
  /** Clicking a day starts an assignment on it. */
  newHref?: (date: string) => string;
  /** The chip's edit page, or undefined to keep it a read-only chip with a detail popover. */
  editHref?: (a: Assignment) => string | undefined;
}) {
  const byDay = new Map(days.map((d) => [d.date, [] as Assignment[]]));
  for (const a of assignments) byDay.get(a.date)?.push(a);

  return (
    // Not overflow-hidden: the read-only chips' detail popovers must escape the grid.
    <div className="rounded-[9px] border-[1.5px] border-line bg-card">
      <div className="grid grid-cols-7 rounded-t-[8px] border-b-[1.5px] border-line bg-ivory">
        {DAY_NAMES.map((d) => (
          <p key={d} className="py-2 text-center text-[0.625rem] font-extrabold tracking-[0.12em] text-subtle">
            {d.toUpperCase()}
          </p>
        ))}
      </div>
      <ol className="grid grid-cols-7">
        {days.map(({ date, inMonth }, i) => {
          const items = byDay.get(date) ?? [];
          const isToday = date === today;
          const extra = items.length - VISIBLE;
          const dayNum = formatDayLabel(date, "d");
          return (
            <li
              key={date}
              aria-label={`${formatDayLabel(date, "EEEE, MMMM d")}, ${items.length} ${items.length === 1 ? "item" : "items"}`}
              className={cn(
                "flex min-h-[64px] min-w-0 flex-col gap-1 border-line p-1 sm:min-h-[108px] sm:p-1.5",
                i % 7 !== 6 && "border-r",
                i >= 7 && "border-t",
                !inMonth && "bg-ivory/60",
                isToday && "bg-gold-wash",
                i === days.length - 7 && "rounded-bl-[8px]",
                i === days.length - 1 && "rounded-br-[8px]"
              )}
            >
              {newHref ? (
                <Link
                  href={newHref(date)}
                  aria-label={`Add an assignment on ${formatDayLabel(date, "MMMM d")}`}
                  className={cn(
                    "grid size-6 place-items-center self-start rounded-full text-xs font-bold hover:bg-gold-soft",
                    isToday ? "bg-ink text-gold-soft hover:text-ink" : inMonth ? "text-ink" : "text-subtle/70"
                  )}
                >
                  {dayNum}
                </Link>
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    "grid size-6 place-items-center self-start rounded-full text-xs font-bold",
                    isToday ? "bg-ink text-gold-soft" : inMonth ? "text-ink" : "text-subtle/70"
                  )}
                >
                  {dayNum}
                </span>
              )}

              {items.length > 0 && (
                <>
                  <Link
                    href={weekHref(weekStartOfDate(date))}
                    className="flex flex-wrap gap-0.5 px-0.5 sm:hidden"
                    aria-label={`View the week of ${formatDayLabel(date, "MMMM d")}`}
                  >
                    {items.map((a) => (
                      <Dot key={a.id} assignment={a} today={today} />
                    ))}
                  </Link>
                  {/* grid-cols-1 is minmax(0, 1fr): an implicit auto column would grow to the
                      untruncated title's width and push chips out of the cell. */}
                  <ul className="hidden min-w-0 grid-cols-1 gap-1 sm:grid">
                    {items.slice(0, VISIBLE).map((a) => (
                      <li key={a.id} className="min-w-0">
                        <AssignmentChip assignment={a} today={today} href={editHref?.(a)} alignEnd={i % 7 >= 5} />
                      </li>
                    ))}
                    {extra > 0 && (
                      <li>
                        <Link
                          href={weekHref(weekStartOfDate(date))}
                          className="px-1 text-[0.6875rem] font-bold text-subtle hover:text-ink"
                        >
                          +{extra} more
                        </Link>
                      </li>
                    )}
                  </ul>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Dot({ assignment: a, today }: { assignment: Assignment; today: string }) {
  const { overdue, muted } = assignmentState(a, today, true);
  return (
    <span
      aria-hidden
      className={cn(
        "size-2 rounded-full",
        overdue ? "bg-[#8c3b2e]" : a.kind === "due" ? "bg-gold" : "bg-ink",
        muted && "opacity-40"
      )}
    />
  );
}
