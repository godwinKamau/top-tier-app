"use server";

import { requireDashboard } from "@/lib/auth/dashboard";
import { invalid, oneOf, optionalText, runAction, text, type ActionResult } from "@/lib/actions";
import { addSession, deleteSession, updateSessionMinutes } from "@/lib/db/focus";
import { copyWeekGoals, createGoal, deleteGoal, setOverride, updateGoal } from "@/lib/db/goals";
import { getStudent } from "@/lib/db/students";
import { GOAL_TYPES, SOAR_CATEGORIES, type GoalType } from "@/lib/goals/catalog";
import { parseProgramDateTime, parseWeekStart, shiftWeek } from "@/lib/week";

/**
 * Staff actions on one student's goals and focus time. Each checks for itself
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
  return { adminId, studentId: student.id };
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

function weekFrom(formData: FormData) {
  const week = parseWeekStart(text(formData, "weekStart"));
  if (!week) invalid("That is not a valid week.");
  return week;
}

export async function createGoalAction(_prev: ActionResult, formData: FormData) {
  return runAction(async () => {
    const { adminId, studentId } = await authorize(formData);
    const type = oneOf(formData, "type", TYPE_KEYS);
    const target = GOAL_TYPES[type].hasTarget ? targetMinutes(formData) : null;
    const title = text(formData, "title") || GOAL_TYPES[type].defaultTitle(target);
    if (!title) invalid("A check-off task needs a title.");
    await createGoal(
      studentId,
      weekFrom(formData),
      {
        category: oneOf(formData, "category", CATEGORY_KEYS),
        type,
        targetMinutes: target,
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
    const target = GOAL_TYPES[type].hasTarget ? targetMinutes(formData) : null;
    const title = text(formData, "title") || GOAL_TYPES[type].defaultTitle(target);
    if (!title) invalid("A check-off task needs a title.");
    await updateGoal(text(formData, "goalId"), studentId, {
      category: oneOf(formData, "category", CATEGORY_KEYS),
      targetMinutes: target,
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
