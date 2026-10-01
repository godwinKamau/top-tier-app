"use server"
import { Resend } from "resend";
import { content } from "@/lib/content";

// Constructed per request rather than at module scope: the Resend constructor
// throws on a missing key, which at module scope took the whole route down with
// an HTML error page instead of a JSON 500 the form can show a message for.
function getResend() {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    return new Resend(key);
}

const f = content.apply.fields;

// Submitted field -> the label a human reads in the email, in the order the
// form asks for them. Anything not listed here is ignored (React appends
// $ACTION_* keys to the FormData).
const FIELD_LABELS: Record<string, string> = {
    parentName: f.parentName,
    email: f.email,
    phone: f.phone,
    studentName: f.studentName,
    grade: f.grade,
    challenge: f.challenge,
    message: f.message,
};

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function buildSummary(body: Record<string, unknown>) {
    const rows = Object.entries(FIELD_LABELS)
        .map(([key, label]) => [label, String(body[key] ?? "").trim()] as const)
        .filter(([, value]) => value.length > 0)
        .map(
            ([label, value]) =>
                `<tr><td style="padding:4px 16px 4px 0;color:#6f6a5e;font:600 12px/1.5 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${escapeHtml(
                    label
                )}</td><td style="padding:4px 0;color:#0f1f3d;font:14px/1.5 system-ui,sans-serif">${escapeHtml(
                    value
                ).replace(/\n/g, "<br/>")}</td></tr>`
        )
        .join("");

    return `<div style="background:#faf6ee;padding:24px">
  <h1 style="margin:0 0 4px;color:#0f1f3d;font:700 20px/1.3 Georgia,serif">Application received</h1>
  <p style="margin:0 0 20px;color:#6f6a5e;font:14px/1.5 system-ui,sans-serif">Thanks for applying to ${escapeHtml(
      content.brand.name
  )}. Here is what you sent us — we'll be in touch within 1–2 business days.</p>
  <table style="border-collapse:collapse">${rows}</table>
</div>`;
}

export async function POST( request:Request ){
    const resend = getResend()
    if (!resend) {
        console.error("RESEND_API_KEY is not set; application email was not sent.")
        return Response.json({ error: "Email is not configured." }, { status: 500 });
    }

    const body = await request.json()
    const email = body.email
    const parentName = body.parentName

    try {
        const { data : sendData, error: sendError } = await resend.emails.send({
        from: 'Acme <onboarding@toptierscholarsystems.com>',
        to: `${email}`,
        subject: `Hello ${parentName}`,
        html: buildSummary(body),
        });

        if ( sendError ) {
            console.error( sendError )
            return Response.json({ sendError }, { status: 500 });
        }

        const { data: statusData, error: statusError } = await resend.emails.get(
            sendData?.id ?? ""
        );

        if ( statusError ) {
            console.error( statusError )
        } else {
            console.log(statusData)
        }

        return Response.json( {sendData, email} );

    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
