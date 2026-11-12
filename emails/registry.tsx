import type { ReactElement } from "react";
import ApplicationReceivedEmail from "./ApplicationReceivedEmail";
import AssignmentCreatedEmail from "./AssignmentCreatedEmail";

/** Adding a template is one line here; the preview route needs no change. */
export const emailPreviews: Record<string, () => ReactElement> = {
  "application-received": () => (
    <ApplicationReceivedEmail {...ApplicationReceivedEmail.PreviewProps} />
  ),
  "assignment-created": () => <AssignmentCreatedEmail {...AssignmentCreatedEmail.PreviewProps} />,
};
