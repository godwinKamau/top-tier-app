import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Plus, Users } from "lucide-react";
import { NotAuthorized } from "@/components/berfday/NotAuthorized";
import { ActionForm } from "@/components/goals/ActionForm";
import { StudentCard } from "@/components/portal/StudentCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDashboardAccess } from "@/lib/auth/dashboard";
import { getCurrentRoster } from "@/lib/goals/view";
import { formatWeekLabel } from "@/lib/week";
import { createStudentAction } from "./students/actions";

export const metadata: Metadata = {
  title: "Students",
  // The gate stops a visitor reading the data; noindex stops the URL being
  // handed to people who would not otherwise know it exists.
  robots: { index: false, follow: false },
};

/** The admin's front page: this week's roster, students who are behind first. */
export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const access = await getDashboardAccess();
  if (access.status === "signed-out") {
    // Sends them to /sign-in with a redirect back here once they are through.
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }
  if (access.status === "forbidden") return <NotAuthorized />;

  const { week, rows } = await getCurrentRoster();
  const adding = (await searchParams).add === "1";
  const behind = rows.filter((r) => r.done < r.counted).length;

  return (
    <main className="mx-auto w-full max-w-[1320px] px-4 pt-7 pb-20 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-[1.625rem] font-bold text-ink">
            My Students
          </h1>
          <p className="mt-1 text-[0.8125rem] font-medium text-subtle">
            Week of {formatWeekLabel(week)} · {rows.length} student{rows.length === 1 ? "" : "s"}
            {rows.length > 0 && ` · ${behind === 0 ? "everyone is caught up" : `${behind} with goals still open`}`}
          </p>
        </div>
        {/* The page's primary action, where the prototype puts it. A plain link
            that opens the form below, so it works before any JS loads. */}
        <Link href="/berfday?add=1#add-student" className={buttonVariants({ variant: "ink", size: "portal" })}>
          <Plus aria-hidden /> Add student
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[9px] border-[1.5px] border-dashed border-line-strong bg-card px-6 py-14 text-center">
          <Users className="mx-auto mb-3 size-9 text-gold" aria-hidden />
          <p className="font-bold text-ink">Add your first student</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-subtle text-pretty">
            Once a student is on the roster you can set their weekly S.O.A.R. goals and watch them
            fill in here.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5">
          {rows.map((row) => (
            <li key={row.student.id} className="grid">
              <StudentCard row={row} />
            </li>
          ))}
        </ul>
      )}

      <details
        id="add-student"
        className="group mt-8 scroll-mt-24 max-w-2xl rounded-[9px] border-[1.5px] border-line bg-card open:shadow-[0_1px_2px_rgba(23,39,79,0.06)]"
        open={rows.length === 0 || adding}
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-[0.8125rem] font-bold text-ink [&::-webkit-details-marker]:hidden">
          <span className="grid size-6 place-items-center rounded-md bg-ink text-gold-soft transition-transform duration-200 group-open:rotate-45">
            <Plus className="size-3.5" aria-hidden />
          </span>
          Add a student
        </summary>
        <div className="border-t border-line px-4 pt-3 pb-4">
          <p className="text-[0.8125rem] text-subtle text-pretty">
            Then invite the same email from the Clerk dashboard. Their first visit to the student
            portal links the account to this profile.
          </p>
          <ActionForm action={createStudentAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="student-name">Name</Label>
              <Input id="student-name" name="name" required autoComplete="off" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="student-email">Email</Label>
              <Input id="student-email" name="email" type="email" required autoComplete="off" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="student-grade">Grade</Label>
              <Input id="student-grade" name="grade" placeholder="e.g. 10th" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="student-school">School</Label>
              <Input id="student-school" name="school" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" variant="ink" size="portal">
                Add student
              </Button>
            </div>
          </ActionForm>
        </div>
      </details>
    </main>
  );
}
