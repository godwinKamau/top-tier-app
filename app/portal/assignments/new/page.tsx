import type { Metadata } from "next";
import { AssignmentPage } from "@/components/planner/AssignmentPage";
import { AssignmentForm } from "@/components/planner/AssignmentForm";
import { saveAssignmentAction } from "../../actions";
import { listClassNames } from "@/lib/db/assignments";
import { parseProgramDate, todayInProgram } from "@/lib/week";
import { safeReturnPath } from "@/lib/planner/calendar";
import { gatePortal } from "../../gate";

export const metadata: Metadata = { title: "New assignment" };

export default async function NewAssignmentPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; return?: string }>;
}) {
  const gate = await gatePortal();
  if (!gate.ok) return gate.denied;
  const { student } = gate;

  const query = await searchParams;
  const returnTo = safeReturnPath(query.return);
  const classNames = await listClassNames(student.id);

  return (
    <AssignmentPage title="New assignment" backHref={returnTo}>
      <AssignmentForm
        action={saveAssignmentAction}
        defaultDate={parseProgramDate(query.date) ?? todayInProgram()}
        classNames={classNames}
        returnTo={returnTo}
      />
    </AssignmentPage>
  );
}
