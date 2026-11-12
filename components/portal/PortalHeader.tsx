import { UserButton } from "@clerk/nextjs";
import { HeaderTabs, type HeaderTab } from "./HeaderTabs";

/**
 * The portal's sticky header, from the client prototype: royal blue with a gold
 * hairline, wordmark left, the area's tabs centered, the signed-in person right.
 * Shared by the admin area and the student portal so the two read as one product.
 */
export function PortalHeader({
  area,
  tabs,
  tabsLabel,
  userName,
  userRole,
}: {
  area: string;
  tabs: HeaderTab[];
  tabsLabel: string;
  userName: string | null;
  userRole: string;
}) {
  return (
    <header className="sticky top-0 z-30 bg-portal-blue text-white shadow-[0_1px_0_rgba(201,162,39,0.45)]">
      <div className="mx-auto flex h-[66px] max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:gap-6">
        <div className="flex shrink-0 items-center gap-2.5 lg:min-w-[220px]">
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden>
            <path
              d="M2 24h18M4 24V8M11 24V6M18 24V8M1 8l10-6 10 6"
              stroke="#c9a227"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <div className="hidden leading-none sm:block">
            <p className="text-[0.6875rem] font-extrabold tracking-[0.14em]">TOP-TIER SCHOLAR SYSTEMS</p>
            <p className="mt-1 text-[0.6875rem] font-medium tracking-[0.14em] text-white/65">{area}</p>
          </div>
          <span className="sr-only sm:hidden">Top-Tier Scholar Systems, {area.toLowerCase()}</span>
        </div>

        <HeaderTabs tabs={tabs} label={tabsLabel} />

        <div className="flex shrink-0 items-center justify-end gap-3 lg:min-w-[220px]">
          <div className="hidden text-right leading-tight lg:block">
            {userName && <p className="text-xs font-bold">{userName}</p>}
            <p className="text-[0.6875rem] font-medium text-white/65">{userRole}</p>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8 ring-[1.5px] ring-[#c9a227]/70 ring-offset-0",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
