import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssignmentPage } from "@/components/planner/AssignmentPage";
import { AssignmentForm, DeleteAssignment } from "@/components/planner/AssignmentForm";
import { getAssignment, listClassNames } from "@/lib/db/assignments";
import { safeAdminReturnPath } from "@/lib/planner/calendar";
import { UUID } from "@/lib/planner/input";
import { deleteStudentAssignmentAction, saveStudentAssignmentAction } from "../../actions";
import { gateStudent } from "../gate";

export const metadata: Metadata = {
  title: "Edit assignment",
  robots: { index: false, follow: false },
};

export default async function EditStudentAssignmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; assignmentId: string }>;
  searchParams: Promise<{ return?: string }>;
}) {
  const { id, assignmentId } = await params;
  const gate = await gateStudent(id);
  if (!gate.ok) return gate.denied;
  const { student } = gate;

  // Only work staff assigned opens here; what the student wrote stays theirs.
  if (!UUID.test(assignmentId)) notFound();
  const [assignment, classNames] = await Promise.all([
    getAssignment(assignmentId, student.id, "admin"),
    listClassNames(student.id),
  ]);
  if (!assignment) notFound();
  const returnTo = safeAdminReturnPath((await searchParams).return, student.id);
  const hidden = { studentId: student.id };

  return (
    <AssignmentPage title="Edit assignment" backHref={returnTo}>
      <AssignmentForm
        action={saveStudentAssignmentAction}
        audience="admin"
        hidden={hidden}
        assignment={assignment}
        defaultDate={assignment.date}
        classNames={classNames}
        returnTo={returnTo}
      />
      <div className="border-t border-line pt-4">
        <DeleteAssignment action={deleteStudentAssignmentAction} id={assignment.id} returnTo={returnTo} hidden={hidden} />
      </div>
    </AssignmentPage>
  );
}
