"use server";

import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/student";
import { invalid, oneOf, runAction, text, type ActionResult } from "@/lib/actions";
import { createAssignment, deleteAssignment, setAssignmentDone, updateAssignment } from "@/lib/db/assignments";
import { startSession, stopSession } from "@/lib/db/focus";
import { setManualDone } from "@/lib/db/goals";
import { saveStudyLog } from "@/lib/db/studyLogs";
import { safeReturnPath } from "@/lib/planner/calendar";
import { assignmentId, parseAssignmentInput } from "@/lib/planner/input";
import { currentWeek } from "@/lib/week";

/**
 * The student's own actions. None of them takes a student ID from the request:
 * the student is whoever is signed in, so one student can never write to
 * another's goals by editing a form.
 */

export async function startFocusAction(): Promise<ActionResult> {
  return runAction(async () => {
    const student = await requireStudent();
    await startSession(student.id);
  });
}

export async function stopFocusAction(): Promise<ActionResult> {
  return runAction(async () => {
    const student = await requireStudent();
    await stopSession(student.id);
  });
}

export async function setManualDoneAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const student = await requireStudent();
    const done = oneOf(formData, "done", ["true", "false"] as const) === "true";
    await setManualDone(text(formData, "goalId"), student.id, done);
  });
}

/** Always this week's log: past weeks are read-only and future ones have not happened. */
export async function saveStudyLogAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const student = await requireStudent();
    const intent = oneOf(formData, "intent", ["save", "submit"] as const);
    const fields = {
      completed: text(formData, "completed"),
      remaining: text(formData, "remaining"),
      blockers: text(formData, "blockers"),
      learned: text(formData, "learned"),
    };
    // A draft can be half-written; a submission is what the consultant reads before
    // the next meeting, so it needs all four. "None" is a fine answer for blockers.
    if (intent === "submit" && Object.values(fields).some((v) => !v)) {
      invalid("Answer all four questions before submitting. \"None\" is fine for blockers.");
    }
    await saveStudyLog(student.id, currentWeek(), fields, intent === "submit");
  });
}

/**
 * Creates an assignment, or updates it when the form carries an `id`. Scoped to
 * entries the student wrote: work a consultant assigned can only be checked off.
 */
export async function saveAssignmentAction(_prev: ActionResult, formData: FormData) {
  const returnTo = safeReturnPath(formData.get("returnTo"));
  const result = await runAction(async () => {
    const student = await requireStudent();
    const input = parseAssignmentInput(formData);
    if (formData.get("id")) await updateAssignment(assignmentId(formData), student.id, "student", input);
    else await createAssignment(student.id, input, "student");
  });
  // redirect() throws, so it runs outside runAction's try block.
  if (!result.error) redirect(returnTo);
  return result;
}

export async function deleteAssignmentAction(_prev: ActionResult, formData: FormData) {
  const returnTo = safeReturnPath(formData.get("returnTo"));
  const result = await runAction(async () => {
    const student = await requireStudent();
    await deleteAssignment(assignmentId(formData), student.id, "student");
  });
  if (!result.error) redirect(returnTo);
  return result;
}

export async function setAssignmentDoneAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const student = await requireStudent();
    const done = oneOf(formData, "done", ["true", "false"] as const) === "true";
    await setAssignmentDone(assignmentId(formData), student.id, done);
  });
}
