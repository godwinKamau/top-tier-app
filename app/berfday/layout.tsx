import { currentUser } from "@clerk/nextjs/server";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { getDashboardAccess } from "@/lib/auth/dashboard";
import { countNewApplicants } from "@/lib/db/applicants";
import { getCurrentRoster } from "@/lib/goals/view";

/**
 * The admin shell. Students come first because the accountability loop is the
 * product; applicants are the pipeline that feeds it.
 *
 * This layout only decides whether to draw the shell. Every page still checks
 * access itself — a layout does not re-run on every navigation, so it is never
 * the thing standing between a visitor and the data.
 */
export default async function BerfdayLayout({ children }: { children: React.ReactNode }) {
  const access = await getDashboardAccess();
  if (access.status !== "admin") return <div className="portal-root min-h-dvh">{children}</div>;

  const [user, roster, newApplicants] = await Promise.all([
    currentUser(),
    getCurrentRoster(),
    countNewApplicants(),
  ]);
  const behind = roster.rows.filter((r) => r.done < r.counted).length;

  return (
    <div className="portal-root min-h-dvh">
      <PortalHeader
        area="ADMIN"
        tabsLabel="Admin"
        userName={user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? null}
        userRole="Administrator"
        tabs={[
          { href: "/berfday", label: "Students", exact: true, match: ["/berfday/students"], badge: behind, badgeLabel: "with goals still open" },
          { href: "/berfday/applicants", label: "Applicants", badge: newApplicants, badgeLabel: "new" },
        ]}
      />
      {children}
    </div>
  );
}
