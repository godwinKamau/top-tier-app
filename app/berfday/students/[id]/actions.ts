"use server";

import { redirect } from "next/navigation";
import { requireDashboard } from "@/lib/auth/dashboard";
import { invalid, oneOf, optionalText, runAction, text, type ActionResult } from "@/lib/actions";
import { createAssignment, deleteAssignment, updateAssignment } from "@/lib/db/assignments";
import { addSession, deleteSession, updateSessionMinutes } from "@/lib/db/focus";
import { copyWeekGoals, createGoal, deleteGoal, setOverride, updateGoal } from "@/lib/db/goals";
import { getStudent } from "@/lib/db/students";
import { notifyAssignmentCreated } from "@/lib/email/assignmentEmail";
import { GOAL_TYPES, SOAR_CATEGORIES, type GoalType } from "@/lib/goals/catalog";
import { safeAdminReturnPath } from "@/lib/planner/calendar";
import { assignmentId, parseAssignmentInput } from "@/lib/planner/input";
import { parseProgramDateTime, parseWeekStart, shiftWeek } from "@/lib/week";

/**
 * Staff actions on one student's goals, focus time and assignments. Each checks for itself
 * that the caller is an admin, because Server Actions are reachable by direct
 * POST whether or not the page was gated, and each confirms the student exists
 * before using the ID from the form.
 */

const CATEGORY_KEYS = SOAR_CATEGORIES.map((c) => c.key);
const TYPE_KEYS = Object.keys(GOAL_TYPES) as GoalType[];

async function authorize(formData: FormData) {
  const adminId = await requireDashboard();
  const student = await getStudent(text(formData, "studentId"));
  if (!student) invalid("That student no longer exists.");
  return { adminId, studentId: student.id, student };
}

/** The form asks in hours ("4", "1.5"), the way the goal is said out loud; it is stored in minutes. */
function targetMinutes(formData: FormData): number {
  const hours = Number(text(formData, "targetHours"));
  const minutes = Math.round(hours * 60);
  if (!Number.isFinite(hours) || minutes < 15 || minutes > 60 * 40) {
    invalid("Set a focus target between 0.25 and 40 hours.");
  }
  return minutes;
}

/** A whole number of planner entries. */
function targetCount(formData: FormData): number {
  const count = Number(text(formData, "targetCount"));
  if (!Number.isInteger(count) || count < 1 || count > 50) {
    invalid("Set an assignment target between 1 and 50.");
  }
  return count;
}

/** Only the target the goal type measures is read; the other is stored as null. */
function goalTargets(formData: FormData, type: GoalType) {
  const kind = GOAL_TYPES[type].target;
  return {
    targetMinutes: kind === "minutes" ? targetMinutes(formData) : null,
    targetCount: kind === "count" ? targetCount(formData) : null,
  };
}

function weekFrom(formData: FormData) {
  const week = parseWeekStart(text(formData, "weekStart"));
  if (!week) invalid("That is not a valid week.");
  return week;
}

export async function createGoalAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const { adminId, studentId } = await authorize(formData);
    const type = oneOf(formData, "type", TYPE_KEYS);
    const targets = goalTargets(formData, type);
    const title = text(formData, "title") || GOAL_TYPES[type].defaultTitle(targets.targetMinutes ?? targets.targetCount);
    if (!title) invalid("A check-off task needs a title.");
    await createGoal(
      studentId,
      weekFrom(formData),
      {
        category: oneOf(formData, "category", CATEGORY_KEYS),
        type,
        ...targets,
        title,
        detail: optionalText(formData, "detail"),
      },
      adminId
    );
  });
}

export async function updateGoalAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const { studentId } = await authorize(formData);
    const type = oneOf(formData, "type", TYPE_KEYS);
    const targets = goalTargets(formData, type);
    const title = text(formData, "title") || GOAL_TYPES[type].defaultTitle(targets.targetMinutes ?? targets.targetCount);
    if (!title) invalid("A check-off task needs a title.");
    await updateGoal(text(formData, "goalId"), studentId, {
      category: oneOf(formData, "category", CATEGORY_KEYS),
      ...targets,
      title,
      detail: optionalText(formData, "detail"),
    });
  });
}

export async function deleteGoalAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const { studentId } = await authorize(formData);
    await deleteGoal(text(formData, "goalId"), studentId);
  });
}

export async function setOverrideAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const { adminId, studentId } = await authorize(formData);
    const value = oneOf(formData, "override", ["complete", "excused", "none"] as const);
    await setOverride(text(formData, "goalId"), studentId, value === "none" ? null : value, adminId);
  });
}

export async function copyLastWeekAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const { adminId, studentId } = await authorize(formData);
    const toWeek = weekFrom(formData);
    const copied = await copyWeekGoals(studentId, shiftWeek(toWeek, -1), toWeek, adminId);
    if (copied === 0) invalid("Nothing copied: this week already has goals, or last week had none.");
  });
}

function minutesFrom(formData: FormData): number {
  return Number(text(formData, "minutes"));
}

export async function addSessionAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const { studentId } = await authorize(formData);
    const startedAt = parseProgramDateTime(text(formData, "startedAt"));
    if (!startedAt) invalid("Enter when the session started.");
    await addSession(studentId, startedAt, minutesFrom(formData));
  });
}

export async function updateSessionAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const { studentId } = await authorize(formData);
    await updateSessionMinutes(text(formData, "sessionId"), studentId, minutesFrom(formData));
  });
}

export async function deleteSessionAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const { studentId } = await authorize(formData);
    await deleteSession(text(formData, "sessionId"), studentId);
  });
}

/**
 * Creates an assignment for the student, or updates one when the form carries an
 * `id`. Scoped to entries staff wrote: what the student planned stays theirs.
 * Only a new assignment emails the student; edits go through quietly.
 */
export async function saveStudentAssignmentAction(_prev: ActionResult, formData: FormData) {
  const returnTo = safeAdminReturnPath(formData.get("returnTo"), text(formData, "studentId"));
  const result = await runAction(async () => {
    const { student } = await authorize(formData);
    const input = parseAssignmentInput(formData);
    if (formData.get("id")) {
      await updateAssignment(assignmentId(formData), student.id, "admin", input);
    } else {
      await createAssignment(student.id, input, "admin");
      await notifyAssignmentCreated(student, input);
    }
  });
  // redirect() throws, so it runs outside runAction's try block.
  if (!result.error) redirect(returnTo);
  return result;
}

export async function deleteStudentAssignmentAction(_prev: ActionResult, formData: FormData) {
  const returnTo = safeAdminReturnPath(formData.get("returnTo"), text(formData, "studentId"));
  const result = await runAction(async () => {
    const { studentId } = await authorize(formData);
    await deleteAssignment(assignmentId(formData), studentId, "admin");
  });
  if (!result.error) redirect(returnTo);
  return result;
}
