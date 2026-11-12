import { invalid, oneOf, optionalText, text } from "@/lib/actions";
import type { AssignmentInput } from "@/lib/db/assignments";
import { parseProgramDate } from "@/lib/week";

/**
 * Form parsing shared by the student's and the consultant's assignment actions,
 * so both sides accept exactly the same entries.
 */

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Checked before querying: Postgres rejects a malformed uuid with an error, not a miss. */
export function assignmentId(formData: FormData): string {
  const id = text(formData, "id");
  if (!UUID.test(id)) invalid("That assignment no longer exists.");
  return id;
}

export function parseAssignmentInput(formData: FormData): AssignmentInput {
  const title = text(formData, "title");
  const className = text(formData, "className");
  const date = parseProgramDate(text(formData, "date"));
  if (!title) invalid("Give it a title.");
  if (!className) invalid("Add the class it's for.");
  if (!date) invalid("Choose a date.");
  return {
    title,
    className,
    date,
    kind: oneOf(formData, "kind", ["plan", "due"] as const),
    notes: optionalText(formData, "notes"),
  };
}
