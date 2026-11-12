import AssignmentCreatedEmail, { assignmentCreatedSubject } from "@/emails/AssignmentCreatedEmail";
import type { AssignmentInput } from "@/lib/db/assignments";
import type { Student } from "@/lib/db/students";
import type { PreparedEmail } from "./applicationEmail";
import { renderEmail } from "./render";
import { FROM, getBaseUrl, getResend } from "./resend";

export async function renderAssignmentCreated(
  studentName: string,
  assignment: AssignmentInput,
  baseUrl: string
): Promise<PreparedEmail> {
  const { html, text } = await renderEmail(
    <AssignmentCreatedEmail studentName={studentName} assignment={assignment} baseUrl={baseUrl} />
  );
  return { html, text, subject: assignmentCreatedSubject(assignment) };
}

/**
 * Tells the student a consultant added work to their planner. Never throws: the
 * assignment is already saved, and the consultant's form has nothing useful to
 * do with a mail failure, so problems are logged instead of reported.
 */
export async function notifyAssignmentCreated(student: Student, assignment: AssignmentInput): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.error("RESEND_API_KEY is not set; assignment email was not sent.");
    return;
  }
  try {
    const { html, text, subject } = await renderAssignmentCreated(student.name, assignment, getBaseUrl());
    const { data, error } = await resend.emails.send({ from: FROM, to: student.email, subject, html, text });
    if (error) console.error("Assignment email failed", error);
    else console.log(`Assignment email queued: ${data?.id} -> ${student.email}`);
  } catch (error) {
    console.error("Assignment email failed", error);
  }
}
