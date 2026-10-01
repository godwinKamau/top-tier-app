import type { ReactElement } from "react";
import ApplicationReceivedEmail from "./ApplicationReceivedEmail";

/** Adding a template is one line here; the preview route needs no change. */
export const emailPreviews: Record<string, () => ReactElement> = {
  "application-received": () => (
    <ApplicationReceivedEmail {...ApplicationReceivedEmail.PreviewProps} />
  ),
};
