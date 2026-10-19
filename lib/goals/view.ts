import { cache } from "react";
import { focusMinutesByStudent } from "@/lib/db/focus";
import { listGoals, listGoalsForStudents, lockGoals, type WeeklyGoal } from "@/lib/db/goals";
import { submittedStudents } from "@/lib/db/studyLogs";
import { listStudents, type Student } from "@/lib/db/students";
import { currentWeek, formatWeekLabel, isWeekEditable, isWeekOpen, type WeekStart } from "@/lib/week";
import {
  applyOverride,
  earnedStatus,
  GOAL_TYPES,
  type EarnedStatus,
  type GoalStatus,
  type Progress,
  type SoarCategory,
  type WeekActivity,
} from "./catalog";

/**
 * The one place goal progress is computed. The student's /portal and the
 * admin's student page both render what this returns, so the two can never
 * disagree about how far along a goal is.
 */

export type GoalView = {
  id: string;
  category: SoarCategory;
  type: WeeklyGoal["type"];
  title: string;
  detail: string | null;
  targetMinutes: number | null;
  progress: Progress;
  /** 0–100, for the bar. */
  percent: number;
  progressText: string;
  status: GoalStatus;
  override: WeeklyGoal["override"];
  manuallyDone: boolean;
};

export type WeekView = {
  weekStart: WeekStart;
  label: string;
  open: boolean;
  /** Whether an admin may add, edit or delete goals (this week and next). */
  editable: boolean;
  goals: GoalView[];
  focusMinutes: number;
  studyLogSubmitted: boolean;
  done: number;
  /** Excused goals are left out, so excusing one never counts against the student. */
  counted: number;
};

function targetFor(goal: WeeklyGoal): number {
  return goal.type === "focus_minutes" ? (goal.targetMinutes ?? 0) : 1;
}

function toView(goal: WeeklyGoal, progress: Progress, earned: EarnedStatus): GoalView {
  const def = GOAL_TYPES[goal.type];
  const status = applyOverride(goal.override, earned);
  return {
    id: goal.id,
    category: goal.category,
    type: goal.type,
    title: goal.title,
    detail: goal.detail,
    targetMinutes: goal.targetMinutes,
    progress,
    percent:
      status === "done" ? 100 : progress.target > 0 ? Math.min(100, Math.round((progress.value / progress.target) * 100)) : 0,
    progressText: def.describe(progress),
    status,
    override: goal.override,
    manuallyDone: goal.manuallyCompletedAt !== null,
  };
}

/** Live progress from activity, before any override. */
function earnedFromActivity(goal: WeeklyGoal, activity: WeekActivity) {
  const progress = GOAL_TYPES[goal.type].progress(goal, activity);
  return { progress, earned: earnedStatus(progress) };
}

function summarize(
  weekStart: WeekStart,
  goals: GoalView[],
  activity: WeekActivity
): WeekView {
  return {
    weekStart,
    label: formatWeekLabel(weekStart),
    open: isWeekOpen(weekStart),
    editable: isWeekEditable(weekStart),
    goals,
    focusMinutes: activity.focusMinutes,
    studyLogSubmitted: activity.studyLogSubmitted,
    done: goals.filter((g) => g.status === "done").length,
    counted: goals.filter((g) => g.status !== "excused").length,
  };
}

export async function getWeekView(studentId: string, weekStart: WeekStart): Promise<WeekView> {
  const [goals, minutes, submitted] = await Promise.all([
    listGoals(studentId, weekStart),
    focusMinutesByStudent([studentId], weekStart),
    submittedStudents([studentId], weekStart),
  ]);
  const activity: WeekActivity = {
    focusMinutes: minutes.get(studentId) ?? 0,
    studyLogSubmitted: submitted.has(studentId),
  };

  if (isWeekOpen(weekStart)) {
    const views = goals.map((g) => {
      const { progress, earned } = earnedFromActivity(g, activity);
      return toView(g, progress, earned);
    });
    return summarize(weekStart, views, activity);
  }

  // A closed week reads from its stored record. Goals not yet locked are
  // computed one last time — nothing can have changed since the week closed,
  // because every write to a closed week is rejected — and saved, so from now
  // on the record no longer depends on the activity tables.
  const unlocked = goals.filter((g) => !g.lockedAt);
  const fresh = new Map(unlocked.map((g) => [g.id, earnedFromActivity(g, activity)]));
  await lockGoals(
    unlocked.map((g) => {
      const { progress, earned } = fresh.get(g.id)!;
      return { id: g.id, finalProgress: progress.value, finalStatus: earned };
    })
  );

  const views = goals.map((g) => {
    const computed = fresh.get(g.id);
    if (computed) return toView(g, computed.progress, computed.earned);
    const progress = { value: g.finalProgress ?? 0, target: targetFor(g) };
    return toView(g, progress, g.finalStatus === "done" ? "done" : "open");
  });
  return summarize(weekStart, views, activity);
}

export type RosterRow = {
  student: Student;
  done: number;
  counted: number;
  focusMinutes: number;
  /** Sum of this week's focus-goal targets; 0 when no focus goal is set. */
  focusTarget: number;
  /** Whether a study-log goal is set this week, so "log missing" only flags when it was asked for. */
  logAsked: boolean;
  studyLogSubmitted: boolean;
};

/**
 * The admin roster for one open week, in three queries however many students
 * there are. Students with unfinished goals sort first, then by name.
 */
export async function getRoster(students: Student[], weekStart: WeekStart): Promise<RosterRow[]> {
  const ids = students.map((s) => s.id);
  const [goals, minutes, submitted] = await Promise.all([
    listGoalsForStudents(ids, weekStart),
    focusMinutesByStudent(ids, weekStart),
    submittedStudents(ids, weekStart),
  ]);

  const rows = students.map((student) => {
    const activity: WeekActivity = {
      focusMinutes: minutes.get(student.id) ?? 0,
      studyLogSubmitted: submitted.has(student.id),
    };
    const own = goals.filter((g) => g.studentId === student.id);
    const views = own
      .map((g) => {
        const { progress, earned } = earnedFromActivity(g, activity);
        return toView(g, progress, earned);
      });
    return {
      student,
      done: views.filter((v) => v.status === "done").length,
      counted: views.filter((v) => v.status !== "excused").length,
      focusMinutes: activity.focusMinutes,
      focusTarget: own
        .filter((g) => g.type === "focus_minutes")
        .reduce((sum, g) => sum + (g.targetMinutes ?? 0), 0),
      logAsked: own.some((g) => g.type === "study_log"),
      studyLogSubmitted: activity.studyLogSubmitted,
    };
  });

  return rows.sort((a, b) => {
    const aBehind = a.done < a.counted ? 0 : 1;
    const bBehind = b.done < b.counted ? 0 : 1;
    return aBehind - bBehind || a.student.name.localeCompare(b.student.name);
  });
}

/**
 * This week's roster, once per request: the admin layout's tab badge and the
 * roster page both read it, and React's cache() keeps that to one set of queries.
 */
export const getCurrentRoster = cache(async () => {
  const week = currentWeek();
  return { week, rows: await getRoster(await listStudents(), week) };
});
