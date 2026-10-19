/**
 * Creates (or resets) one test student with goals, focus time and a study log
 * across last week and this week, so the portal and the admin student page have
 * something real to show.
 *
 *   npm run db:seed -- you+student@example.com "Test Student"
 *
 * Then invite that email from the Clerk dashboard and sign in at /portal.
 *
 * Re-running resets the student's goals, sessions and logs for those two weeks
 * only. It writes straight to the tables, bypassing the closed-week checks, which
 * is the point: last week needs history for the locked view to have anything to
 * lock.
 */
import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { requireDb } from "@/lib/db";
import { focusSessions, students, studyLogs, users, weeklyGoals } from "@/lib/db/schema";
import { normalizeEmail } from "@/lib/db/students";
import { currentWeek, shiftWeek, weekRange } from "@/lib/week";

async function main() {
  const [emailArg, nameArg] = process.argv.slice(2);
  if (!emailArg) {
    console.error('Usage: npm run db:seed -- <student email> ["Student Name"]');
    process.exit(1);
  }
  const email = normalizeEmail(emailArg);
  const db = requireDb();

  const [admin] = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
  if (!admin) throw new Error("No admin in `users`; goals need a creator. Add yourself first.");

  const [student] = await db
    .insert(students)
    .values({ name: nameArg ?? "Test Student", email, grade: "10th", school: "Lincoln Park High", assignedConsultantId: admin.clerkUserId })
    .onConflictDoUpdate({ target: students.email, set: { name: nameArg ?? "Test Student" } })
    .returning();

  const thisWeek = currentWeek();
  const lastWeek = shiftWeek(thisWeek, -1);
  const weeks = [lastWeek, thisWeek];

  await db.delete(weeklyGoals).where(and(eq(weeklyGoals.studentId, student.id), inArray(weeklyGoals.weekStart, weeks)));
  await db.delete(studyLogs).where(and(eq(studyLogs.studentId, student.id), inArray(studyLogs.weekStart, weeks)));
  await db
    .delete(focusSessions)
    .where(
      and(
        eq(focusSessions.studentId, student.id),
        gte(focusSessions.startedAt, weekRange(lastWeek).start),
        lt(focusSessions.startedAt, weekRange(thisWeek).end)
      )
    );

  const createdBy = admin.clerkUserId;
  const goalsFor = (weekStart: string) => [
    { studentId: student.id, weekStart, createdBy, category: "rigor" as const, type: "focus_minutes" as const, targetMinutes: 240, title: "Log 4 hrs of focus time", detail: "Spread it across at least three days." },
    { studentId: student.id, weekStart, createdBy, category: "accountability" as const, type: "study_log" as const, targetMinutes: null, title: "Fill out your weekly study log", detail: "Due Sunday night." },
    { studentId: student.id, weekStart, createdBy, category: "small_wins" as const, type: "manual" as const, targetMinutes: null, title: "Ask one question on the biology worksheet", detail: null },
    { studentId: student.id, weekStart, createdBy, category: "organization" as const, type: "manual" as const, targetMinutes: null, title: "Put every due date for next week in your planner", detail: null },
  ];
  await db.insert(weeklyGoals).values([...goalsFor(lastWeek), ...goalsFor(thisWeek)]);

  // Last week: 260 minutes (focus goal met). This week: 95 so far.
  const session = (weekStart: string, dayOffset: number, hour: number, minutes: number) => {
    const startedAt = new Date(weekRange(weekStart).start.getTime() + (dayOffset * 24 + hour) * 3_600_000);
    return { studentId: student.id, startedAt, endedAt: new Date(startedAt.getTime() + minutes * 60_000), minutes, source: "timer" as const };
  };
  const now = Date.now();
  await db.insert(focusSessions).values(
    [
      session(lastWeek, 0, 16, 90),
      session(lastWeek, 2, 17, 80),
      session(lastWeek, 4, 15, 90),
      session(thisWeek, 0, 16, 50),
      session(thisWeek, 0, 19, 45),
    ].filter((s) => s.endedAt.getTime() <= now)
  );

  await db.insert(studyLogs).values({
    studentId: student.id,
    weekStart: lastWeek,
    completed: "Finished the chem lab write-up and two chapters of history reading.",
    remaining: "Biology worksheet questions 6–10.",
    blockers: "None",
    learned: "Outlining before writing made the lab report much faster.",
    submittedAt: new Date(weekRange(lastWeek).end.getTime() - 4 * 3_600_000),
  });

  console.log(`Seeded ${student.name} <${email}> (${student.id}) for ${lastWeek} and ${thisWeek}.`);
  console.log(`Admin view: /berfday/students/${student.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
