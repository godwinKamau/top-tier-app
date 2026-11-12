import type { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { NotAuthorized } from "@/components/berfday/NotAuthorized";
import { getStudentAccess } from "@/lib/auth/student";
import type { Student } from "@/lib/db/students";

/**
 * Every /portal page starts here. Reading the Clerk session makes the page
 * dynamic, so one student's dashboard is never prerendered and served to another.
 */
export async function gatePortal(): Promise<{ ok: true; student: Student } | { ok: false; denied: ReactNode }> {
  const access = await getStudentAccess();
  if (access.status === "signed-out") {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }
  if (access.status === "unlinked") {
    return {
      ok: false,
      denied: (
        <NotAuthorized title="No student profile for this account.">
          {access.email ? (
            <>
              Nobody has set up a profile for <strong>{access.email}</strong> yet. Ask your
              consultant to add you with this email, then reload.
            </>
          ) : (
            <>Verify your email address, then reload. Profiles are matched by verified email.</>
          )}
        </NotAuthorized>
      ),
    };
  }
  return { ok: true, student: access.student };
}
