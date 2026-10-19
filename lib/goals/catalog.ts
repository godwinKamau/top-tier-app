/**
 * The S.O.A.R. framework and the goal types it is measured with.
 *
 * Category and type answer different questions and are chosen independently by
 * the admin: the category is *why* the goal matters to the student (a focus goal
 * can be Rigor one week and Small Wins the next), the type is *how* progress is
 * measured. Adding a goal type later — calendar updates, assignment turn-in —
 * means adding an enum value and an entry here with its calculator, and nothing
 * else in the goals UI changes.
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

export type GoalType = "focus_minutes" | "study_log" | "manual";

/** What a week's activity looks like to a progress calculator. */
export type WeekActivity = {
  focusMinutes: number;
  studyLogSubmitted: boolean;
};

export type GoalForProgress = {
  type: GoalType;
  targetMinutes: number | null;
  manuallyCompletedAt: Date | null;
};

export type Progress = { value: number; target: number };

type GoalTypeDef = {
  label: string;
  /** Whether the admin sets a numeric target. */
  hasTarget: boolean;
  defaultTitle: (targetMinutes: number | null) => string;
  progress: (goal: GoalForProgress, activity: WeekActivity) => Progress;
  /** "X of Y" as the student and admin read it. */
  describe: (p: Progress) => string;
};

export const GOAL_TYPES: Record<GoalType, GoalTypeDef> = {
  focus_minutes: {
    label: "Focus time",
    hasTarget: true,
    defaultTitle: (target) => `Log ${formatMinutes(target ?? 0)} of focus time`,
    progress: (goal, activity) => ({
      value: activity.focusMinutes,
      target: goal.targetMinutes ?? 0,
    }),
    describe: (p) => `${formatMinutes(p.value)} of ${formatMinutes(p.target)}`,
  },
  study_log: {
    label: "Weekly study log",
    hasTarget: false,
    defaultTitle: () => "Fill out your weekly study log",
    progress: (_goal, activity) => ({ value: activity.studyLogSubmitted ? 1 : 0, target: 1 }),
    describe: (p) => (p.value >= p.target ? "Submitted" : "Not submitted"),
  },
  manual: {
    label: "Check-off task",
    hasTarget: false,
    defaultTitle: () => "",
    progress: (goal) => ({ value: goal.manuallyCompletedAt ? 1 : 0, target: 1 }),
    describe: (p) => (p.value >= p.target ? "Done" : "Not done"),
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
