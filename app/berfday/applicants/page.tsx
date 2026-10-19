import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import {
  ApplicationsTable,
  type ApplicationView,
} from "@/components/berfday/ApplicationsTable";
import { NotAuthorized } from "@/components/berfday/NotAuthorized";
import { getDashboardAccess } from "@/lib/auth/dashboard";
import { listApplicants } from "@/lib/db/applicants";

export const metadata: Metadata = {
  title: "Applicants",
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

export default async function ApplicantsPage() {
  const access = await getDashboardAccess();
  if (access.status === "signed-out") {
    // Sends them to /sign-in with a redirect back here once they are through.
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }
  if (access.status === "forbidden") return <NotAuthorized />;

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
    <main className="mx-auto w-full max-w-[1320px] px-4 pt-7 pb-20 sm:px-6">
      <div className="mb-5">
        <h1 className="font-[family-name:var(--font-playfair)] text-[1.625rem] font-bold text-ink">
          Applicants
        </h1>
        <p className="mt-1 text-[0.8125rem] font-medium text-subtle">
          {applications.length} submission{applications.length === 1 ? "" : "s"} from the apply
          form, newest first.
        </p>
      </div>
      <ApplicationsTable rows={applications} />
    </main>
  );
}
