"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type HeaderTab = {
  href: string;
  label: string;
  badge?: number;
  /** Read after the count by screen readers: "3 new", "2 need attention". */
  badgeLabel?: string;
  /** Other path prefixes that keep this tab lit, e.g. a student's detail page under Students. */
  match?: string[];
  /** Match the href exactly (match prefixes still apply), so /portal is not lit on /portal/focus. */
  exact?: boolean;
};

function isActive(pathname: string, tab: HeaderTab): boolean {
  const under = (p: string) => pathname === p || pathname.startsWith(`${p}/`);
  if (tab.exact ? pathname === tab.href : under(tab.href)) return true;
  return (tab.match ?? []).some(under);
}

/** The prototype's segmented role tabs, used as each area's primary navigation. */
export function HeaderTabs({ tabs, label }: { tabs: HeaderTab[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="min-w-0 overflow-x-auto">
      <ul className="flex w-max gap-1 rounded-[9px] bg-white/10 p-1">
        {tabs.map((tab) => {
          const active = isActive(pathname, tab);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-[0.8125rem] font-bold whitespace-nowrap transition-colors duration-150",
                  active
                    ? "bg-ivory text-ink shadow-[0_1px_2px_rgba(7,13,26,0.25)]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                {tab.label}
                {tab.badge ? (
                  <span
                    className={cn(
                      "grid h-[18px] min-w-[18px] place-items-center rounded-full px-1.5 text-[0.6875rem] font-extrabold",
                      active ? "bg-ink text-gold-soft" : "bg-gold text-ink"
                    )}
                  >
                    <span className="sr-only">, </span>
                    {tab.badge}
                    <span className="sr-only"> {tab.badgeLabel ?? "need attention"}</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
