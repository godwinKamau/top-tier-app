import { Resend } from "resend";
import { content } from "@/lib/content";
import { insertApplicant, recordConfirmation } from "@/lib/db/applicants";
import { parseApplicationSubmission } from "@/lib/email/application";
import { renderApplicationConfirmation } from "@/lib/email/applicationEmail";

// Constructed per request rather than at module scope: the Resend constructor
// throws on a missing key, which at module scope took the whole route down with
// an HTML error page instead of a JSON 500 the form can show a message for.
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Email clients cannot resolve a relative /logo.png, so images need an
// absolute origin. Falling back to the production host keeps a missing env var
// from silently shipping a broken image.
function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://toptierscholarsystems.com").replace(
    /\/$/,
    ""
  );
}

const FROM = `${content.brand.name} <onboarding@toptierscholarsystems.com>`;

export async function POST(request: Request) {
  const parsed = parseApplicationSubmission(await request.json().catch(() => null));
  if (!parsed.ok) {
    return Response.json(
      { error: "Missing required fields.", missing: parsed.missing },
      { status: 400 }
    );
  }
  const { submission } = parsed;

  // Stored before anything can fail the request, and never allowed to fail it
  // itself: a lead that reached the form is worth more than its confirmation, so
  // neither a database outage nor a missing email key is permitted to discard a
  // submission. A failed insert returns null and logs the whole submission for
  // recovery by hand. This sits above the Resend check for that reason — a
  // misconfigured email key used to mean the submission was simply dropped.
  const applicantId = await insertApplicant(submission);

  const resend = getResend();
  if (!resend) {
    console.error("RESEND_API_KEY is not set; application email was not sent.");
    return Response.json({ error: "Email is not configured." }, { status: 500 });
  }

  try {
    // Rendered here rather than handed to Resend as `react:`. Resend's react
    // path only ever produces `html`, so a plain-text part would be impossible,
    // and a template throw would surface as an opaque Resend failure instead of
    // landing in this try/catch. The rsc layer gives templates no error
    // boundary, so this catch is the only thing standing under them.
    const { html, text, subject } = await renderApplicationConfirmation(
      submission,
      getBaseUrl()
    );

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: submission.email,
      subject,
      html,
      text,
    });

    // Logged either way, so the dashboard can distinguish a family that was
    // confirmed from one whose application was only recorded. Awaited rather
    // than fired and forgotten: a serverless instance can be frozen the moment
    // this handler returns, and a dangling promise would simply never run.
    if (error) {
      console.error("Resend send failed", error);
      if (applicantId) {
        await recordConfirmation(applicantId, submission.email, subject, {
          status: "failed",
          error: error.message,
        });
      }
      return Response.json({ error: error.message }, { status: 502 });
    }

    if (applicantId) {
      await recordConfirmation(applicantId, submission.email, subject, {
        status: "sent",
        resendId: data?.id ?? null,
        renderedHtml: html,
      });
    }

    console.log(`Application confirmation queued: ${data?.id} -> ${submission.email}`);
    return Response.json({ id: data?.id, email: submission.email });
  } catch (error) {
    // Reached when rendering throws, which is before there is a subject to log
    // a send row against — so this one stays a log line only.
    console.error("Application confirmation failed", error);
    return Response.json({ error: "Could not send confirmation." }, { status: 500 });
  }
}
