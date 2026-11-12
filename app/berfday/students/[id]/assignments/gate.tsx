import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { NotAuthorized } from "@/components/berfday/NotAuthorized";
import { getDashboardAccess } from "@/lib/auth/dashboard";
import { getStudent, type Student } from "@/lib/db/students";
import { UUID } from "@/lib/planner/input";

/** The staff check and student lookup both assignment pages open with. */
export async function gateStudent(
  id: string
): Promise<{ ok: true; student: Student } | { ok: false; denied: React.ReactNode }> {
  const access = await getDashboardAccess();
  if (access.status === "signed-out") {
    const { redirectToSignIn } = await auth();
    return { ok: false, denied: redirectToSignIn() };
  }
  if (access.status === "forbidden") return { ok: false, denied: <NotAuthorized /> };

  // Checked before querying: Postgres rejects a malformed uuid with an error.
  if (!UUID.test(id)) notFound();
  const student = await getStudent(id);
  if (!student) notFound();
  return { ok: true, student };
}
