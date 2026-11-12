import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssignmentPage } from "@/components/planner/AssignmentPage";
import { AssignmentForm, DeleteAssignment } from "@/components/planner/AssignmentForm";
import { getAssignment, listClassNames } from "@/lib/db/assignments";
import { safeReturnPath } from "@/lib/planner/calendar";
import { UUID } from "@/lib/planner/input";
import { deleteAssignmentAction, saveAssignmentAction } from "../../actions";
import { gatePortal } from "../../gate";

export const metadata: Metadata = { title: "Edit assignment" };

export default async function EditAssignmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ return?: string }>;
}) {
  const gate = await gatePortal();
  if (!gate.ok) return gate.denied;
  const { student } = gate;

  const { id } = await params;
  // Checked before querying: Postgres rejects a malformed uuid with an error.
  // Only the student's own entries open here; assigned work is check-off only.
  if (!UUID.test(id)) notFound();
  const [assignment, classNames] = await Promise.all([
    getAssignment(id, student.id, "student"),
    listClassNames(student.id),
  ]);
  if (!assignment) notFound();
  const returnTo = safeReturnPath((await searchParams).return);

  return (
    <AssignmentPage title="Edit assignment" backHref={returnTo}>
      <AssignmentForm
        action={saveAssignmentAction}
        assignment={assignment}
        defaultDate={assignment.date}
        classNames={classNames}
        returnTo={returnTo}
      />
      <div className="border-t border-line pt-4">
        <DeleteAssignment action={deleteAssignmentAction} id={assignment.id} returnTo={returnTo} />
      </div>
    </AssignmentPage>
  );
}
