import type { Metadata } from "next";
import { AssignmentPage } from "@/components/planner/AssignmentPage";
import { AssignmentForm } from "@/components/planner/AssignmentForm";
import { listClassNames } from "@/lib/db/assignments";
import { safeAdminReturnPath } from "@/lib/planner/calendar";
import { parseProgramDate, todayInProgram } from "@/lib/week";
import { saveStudentAssignmentAction } from "../../actions";
import { gateStudent } from "../gate";

export const metadata: Metadata = {
  title: "New assignment",
  robots: { index: false, follow: false },
};

export default async function NewStudentAssignmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string; return?: string }>;
}) {
  const gate = await gateStudent((await params).id);
  if (!gate.ok) return gate.denied;
  const { student } = gate;

  const query = await searchParams;
  const returnTo = safeAdminReturnPath(query.return, student.id);
  const classNames = await listClassNames(student.id);

  return (
    <AssignmentPage title={`New assignment for ${student.name.split(" ")[0]}`} backHref={returnTo}>
      <AssignmentForm
        action={saveStudentAssignmentAction}
        audience="admin"
        hidden={{ studentId: student.id }}
        defaultDate={parseProgramDate(query.date) ?? todayInProgram()}
        classNames={classNames}
        returnTo={returnTo}
      />
    </AssignmentPage>
  );
}
