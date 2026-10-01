import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { AccessGate } from "@/components/berfday/AccessGate";
import {
  ApplicationsTable,
  type ApplicationView,
} from "@/components/berfday/ApplicationsTable";
import { Button } from "@/components/ui/button";
import { getDashboardConfigError, isDashboardAuthenticated } from "@/lib/auth/dashboard";
import { listApplicants } from "@/lib/db/applicants";
import { signOutOfDashboard } from "./actions";

export const metadata: Metadata = {
  title: "Applications",
  // The gate stops a visitor reading the data; noindex stops the URL being
  // handed to people who would not otherwise know it exists.
  robots: { index: false, follow: false },
};

/**
 * Pinned rather than left to the server's locale. Both the timezone and the
 * locale are fixed so the rendered string does not depend on where the code
 * happens to be running, and the client is Chicago-based.
 */
const DATE_ZONE = "America/Chicago";

const fullFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: DATE_ZONE,
});

const shortFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: DATE_ZONE,
});

export default async function BerfdayPage() {
  // Reading the session cookie opts this page into dynamic rendering, so the
  // signed-in version is never prerendered and served from a cache.
  if (!(await isDashboardAuthenticated())) {
    if (getDashboardConfigError()) return <NotConfigured />;
    return <AccessGate />;
  }

  // Deliberately unguarded: an unreachable database should surface as the error
  // page, not as a dashboard that looks like nobody has applied.
  const rows = await listApplicants();

  // Nullable columns are collapsed to "" here rather than in the table, so the
  // component never has to decide what a missing answer looks like.
  const applications: ApplicationView[] = rows.map((row) => ({
    id: row.id,
    parentName: row.parentName,
    email: row.parentEmail,
    phone: row.phone ?? "",
    studentName: row.studentName,
    grade: row.grade ?? "",
    challenge: row.challenge ?? "",
    message: row.message ?? "",
    stage: row.stage,
    confirmationSent: row.confirmationSent,
    receivedAt: fullFormat.format(row.createdAt),
    receivedAtShort: shortFormat.format(row.createdAt),
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-navy">
            Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {applications.length} submission{applications.length === 1 ? "" : "s"}, newest first.
          </p>
        </div>
        <form action={signOutOfDashboard}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      <div className="mt-6">
        <ApplicationsTable rows={applications} />
      </div>
    </main>
  );
}

function NotConfigured() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="max-w-md border border-border bg-card p-8 text-center">
        <LockKeyhole className="mx-auto mb-4 size-9 text-muted-foreground" aria-hidden />
        <h1 className="font-semibold text-navy">This dashboard is not configured.</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
          Set <code className="font-mono text-xs">DASHBOARD_ACCESS_CODE</code> and{" "}
          <code className="font-mono text-xs">DASHBOARD_SESSION_SECRET</code> in the environment,
          then reload. Nothing is readable until both are present.
        </p>
      </div>
    </main>
  );
}
