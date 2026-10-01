import ApplicationReceivedEmail, {
  applicationReceivedSubject,
} from "@/emails/ApplicationReceivedEmail";
import type { ApplicationSubmission } from "./application";
import { renderEmail, type RenderedEmail } from "./render";

export type PreparedEmail = RenderedEmail & { subject: string };

/**
 * Bridges the route to the template. Keeping the JSX here rather than in
 * route.ts means the Route Handler stays plain TypeScript and every file that
 * builds markup is a .tsx that reads as a template.
 */
export async function renderApplicationConfirmation(
  submission: ApplicationSubmission,
  baseUrl: string
): Promise<PreparedEmail> {
  const { html, text } = await renderEmail(
    <ApplicationReceivedEmail submission={submission} baseUrl={baseUrl} />
  );

  return { html, text, subject: applicationReceivedSubject(submission) };
}
