/**
 * The S.O.A.R. framework and the goal types it is measured with.
 *
 * Category and type answer different questions and are chosen independently by
 * the admin: the category is *why* the goal matters to the student (a focus goal
 * can be Rigor one week and Small Wins the next), the type is *how* progress is
 * measured. Adding a goal type later means adding an enum value and an entry
 * here with its calculator, and nothing else in the goals UI changes.
 */

export const SOAR_CATEGORIES = [
  { key: "small_wins", letter: "S", label: "Small Wins" },
  { key: "organization", letter: "O", label: "Organization" },
  { key: "accountability", letter: "A", label: "Accountability" },
  { key: "rigor", letter: "R", label: "Rigor" },
] as const;

export type SoarCategory = (typeof SOAR_CATEGORIES)[number]["key"];

export const SOAR_BY_KEY = Object.fromEntries(SOAR_CATEGORIES.map((c) => [c.key, c])) as Record<
  SoarCategory,
  (typeof SOAR_CATEGORIES)[number]
>;

export type GoalType = "focus_minutes" | "study_log" | "manual" | "assignments";

/** What a week's activity looks like to a progress calculator. */
export type WeekActivity = {
  focusMinutes: number;
  studyLogSubmitted: boolean;
  /** Planner entries dated in the week, and how many were checked off before it ended. */
  assignmentsTotal: number;
  assignmentsDone: number;
};

export type GoalForProgress = {
  type: GoalType;
  targetMinutes: number | null;
  targetCount: number | null;
  manuallyCompletedAt: Date | null;
};

export type Progress = { value: number; target: number };

type GoalTypeDef = {
  label: string;
  /** The numeric target the admin sets, if any: focus minutes or a count of assignments. */
  target: "minutes" | "count" | null;
  /** Gets the target in the unit `target` names. */
  defaultTitle: (target: number | null) => string;
  progress: (goal: GoalForProgress, activity: WeekActivity) => Progress;
  /** "X of Y" as the student and admin read it. */
  describe: (p: Progress) => string;
};

export const GOAL_TYPES: Record<GoalType, GoalTypeDef> = {
  focus_minutes: {
    label: "Focus time",
    target: "minutes",
    defaultTitle: (target) => `Log ${formatMinutes(target ?? 0)} of focus time`,
    progress: (goal, activity) => ({
      value: activity.focusMinutes,
      target: goal.targetMinutes ?? 0,
    }),
    describe: (p) => `${formatMinutes(p.value)} of ${formatMinutes(p.target)}`,
  },
  study_log: {
    label: "Weekly study log",
    target: null,
    defaultTitle: () => "Fill out your weekly study log",
    progress: (_goal, activity) => ({ value: activity.studyLogSubmitted ? 1 : 0, target: 1 }),
    describe: (p) => (p.value >= p.target ? "Submitted" : "Not submitted"),
  },
  manual: {
    label: "Check-off task",
    target: null,
    defaultTitle: () => "",
    progress: (goal) => ({ value: goal.manuallyCompletedAt ? 1 : 0, target: 1 }),
    describe: (p) => (p.value >= p.target ? "Done" : "Not done"),
  },
  assignments: {
    label: "Assignments completed",
    target: "count",
    defaultTitle: (n) => `Complete ${n ?? 0} assignment${n === 1 ? "" : "s"}`,
    // Capped at the week's entries, so a light week can still be finished.
    // With none at all the target is 0 and the goal stays open.
    progress: (goal, activity) => {
      const target = Math.min(goal.targetCount ?? 0, activity.assignmentsTotal);
      return { value: Math.min(activity.assignmentsDone, target), target };
    },
    describe: (p) => (p.target === 0 ? "No assignments this week" : `${p.value} of ${p.target} done`),
  },
};

export type GoalStatus = "open" | "done" | "excused";
export type EarnedStatus = Exclude<GoalStatus, "excused">;

/**
 * What the activity alone has earned. Done exactly when progress reaches the
 * target, so it can fall back to open while the week is open if the student
 * deletes the activity that got it there.
 */
export function earnedStatus(progress: Progress): EarnedStatus {
  return progress.target > 0 && progress.value >= progress.target ? "done" : "open";
}

/** The admin's override wins outright. */
export function applyOverride(
  override: "complete" | "excused" | null,
  earned: EarnedStatus
): GoalStatus {
  if (override === "excused") return "excused";
  if (override === "complete") return "done";
  return earned;
}

/** 240 → "4 hrs", 90 → "1 hr 30 min", 45 → "45 min". */
export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes} min`;
  const h = `${hours} hr${hours === 1 ? "" : "s"}`;
  return minutes === 0 ? h : `${h} ${minutes} min`;
}
