import { and, desc, eq, exists, getTableColumns, sql } from "drizzle-orm";
import { getDb } from "./index";
import { applicants, emailSends } from "./schema";
import type { ApplicationField, ApplicationSubmission } from "@/lib/email/application";

type ApplicantInsert = typeof applicants.$inferInsert;

type Assert<T extends true> = T;

/** The form fields insertApplicant writes to a column. */
type StoredField =
  | "parentName"
  | "email"
  | "phone"
  | "studentName"
  | "grade"
  | "challenge"
  | "message";

/**
 * Compile-time guard that no answer is collected and then thrown away. Adding a
 * key to content.apply.fields widens ApplicationField, and this alias fails
 * `tsc` until the new field is stored too — rather than the answer being
 * accepted by the form, echoed in the confirmation email, and silently dropped
 * on the way to the database, which is exactly what happened to `challenge`.
 */
export type _EveryFieldIsStored = Assert<
  Exclude<ApplicationField, StoredField> extends never ? true : false
>;

/**
 * Stores a submission and returns the new applicant's id, or null if it could
 * not be stored. Never throws: the caller is mid-request on a public form, and
 * neither a database outage nor a missing connection string should be what
 * stands between a family and their confirmation. On failure the whole
 * submission goes to the log so the lead can be recovered by hand.
 *
 * `stage` and `source` are left to their defaults ('new', 'website') — the
 * database already describes what a submission from the public form is.
 */
export async function insertApplicant(
  submission: ApplicationSubmission
): Promise<string | null> {
  const db = getDb();
  if (!db) {
    console.error(
      "DATABASE_URL is not set; application was not stored.",
      JSON.stringify(submission)
    );
    return null;
  }

  // Written out rather than spread, because the names genuinely differ: the form
  // asks for `email` and the table, which also holds a student name, calls it
  // `parent_email`. An explicit literal is also fully type-checked, where a
  // mapped-and-cast object would not be.
  const values: ApplicantInsert = {
    parentName: submission.parentName,
    parentEmail: submission.email,
    phone: submission.phone,
    studentName: submission.studentName,
    grade: submission.grade,
    challenge: submission.challenge,
    message: submission.message,
  };

  try {
    const [row] = await db.insert(applicants).values(values).returning({ id: applicants.id });
    return row?.id ?? null;
  } catch (error) {
    console.error(
      "Storing the application failed; the submission is logged here so it is not lost.",
      JSON.stringify(submission),
      error
    );
    return null;
  }
}

export type ConfirmationOutcome =
  | { status: "sent"; resendId: string | null; renderedHtml: string }
  | { status: "failed"; error: string };

/**
 * Logs the confirmation attempt against the applicant. Best-effort by design:
 * by the time this runs the email has already been handed to Resend or already
 * failed, so a problem here is a reporting gap in the dashboard, never a reason
 * to fail the visitor's request.
 *
 * A 'failed' row is as valuable as a 'sent' one — it is what lets the dashboard
 * say "this family does not know their application arrived" instead of leaving
 * the absence of a row to be guessed at.
 */
export async function recordConfirmation(
  applicantId: string,
  toAddress: string,
  subject: string,
  outcome: ConfirmationOutcome
): Promise<void> {
  const db = getDb();
  if (!db) return;

  try {
    await db.insert(emailSends).values({
      applicantId,
      toAddress,
      subject,
      status: outcome.status,
      ...(outcome.status === "sent"
        ? {
            resendId: outcome.resendId,
            renderedHtml: outcome.renderedHtml,
            // Resend reports only `queued` this soon, so this is the time it was
            // accepted for delivery, not proof it landed. Real delivery state
            // belongs on a webhook updating `status` to 'delivered'/'bounced'.
            sentAt: new Date(),
          }
        : { error: outcome.error }),
    });
  } catch (error) {
    console.error(`Could not log the confirmation email for applicant ${applicantId}`, error);
  }
}

export type ApplicantListRow = typeof applicants.$inferSelect & {
  confirmationSent: boolean;
};

/**
 * Every applicant, newest first, each flagged with whether a confirmation
 * actually went out. One query: the flag is an EXISTS subquery rather than a
 * join, so a family with several logged sends still produces exactly one row.
 *
 * Throws on failure, unlike the write path — there is a person waiting on this
 * who needs to see that the read broke, not an empty table that reads as
 * "nobody has applied".
 */
export async function listApplicants(): Promise<ApplicantListRow[]> {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not set.");

  return db
    .select({
      ...getTableColumns(applicants),
      // Wrapped in sql<boolean> because exists() is typed SQL<unknown>; the
      // subquery itself is still built by drizzle, so the enum comparison stays
      // a bound parameter rather than an interpolated string.
      confirmationSent: sql<boolean>`${exists(
        db
          .select({ one: sql`1` })
          .from(emailSends)
          .where(
            and(eq(emailSends.applicantId, applicants.id), eq(emailSends.status, "sent"))
          )
      )}`,
    })
    .from(applicants)
    .orderBy(desc(applicants.createdAt));
}
