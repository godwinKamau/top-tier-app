import { Heading, Hr, Text } from "@react-email/components";
import { content } from "@/lib/content";
import { APPLICATION_FIELDS, type ApplicationSubmission } from "@/lib/email/application";
import { DetailTable, type DetailRow } from "./_components/DetailTable";
import { EmailLayout } from "./_components/EmailLayout";
import { emailColors, emailText } from "./theme";

export type ApplicationReceivedEmailProps = {
  submission: ApplicationSubmission;
  baseUrl: string;
};

/** The subject lives next to the body it belongs to, not in the route. */
export function applicationReceivedSubject(submission: ApplicationSubmission): string {
  const firstName = submission.parentName.trim().split(/\s+/)[0];
  return firstName
    ? `${firstName}, we received your application — ${content.brand.name}`
    : `We received your application — ${content.brand.name}`;
}

export default function ApplicationReceivedEmail({
  submission,
  baseUrl,
}: ApplicationReceivedEmailProps) {
  const labels = content.apply.fields;

  // Empty values are dropped rather than rendered as a blank row: `message` is
  // optional on the form, and a parent may skip it.
  const rows: DetailRow[] = APPLICATION_FIELDS.map((field) => ({
    label: labels[field],
    value: submission[field].trim(),
  })).filter((row) => row.value.length > 0);

  return (
    <EmailLayout
      title="Application received"
      preview={`We've got ${submission.studentName || "your student"}'s application — here's what you sent us.`}
      baseUrl={baseUrl}
      brandName={content.brand.name}
      footerCopyright={content.footer.copyright}
      footerContact={{
        location: content.footer.location,
        email: content.brand.email,
        phone: content.brand.phone,
      }}
    >
      <Heading as="h1" style={emailText.h1}>
        Application received
      </Heading>
      <Text style={emailText.lead}>
        Thanks for applying to {content.brand.name}. Here&apos;s what you sent us — we&apos;ll be in
        touch within 1–2 business days to schedule your consultation.
      </Text>

      <DetailTable rows={rows} />

      <Hr style={{ borderColor: emailColors.border, margin: "24px 0 16px" }} />

      <Heading as="h2" style={emailText.h2}>
        What happens next
      </Heading>
      {content.apply.steps.map((step, index) => (
        <Text key={step.title} style={emailText.body}>
          <strong style={{ color: emailColors.navy }}>
            {index + 1}. {step.title}
          </strong>
          <br />
          <span style={{ color: emailColors.mutedForeground }}>{step.body}</span>
        </Text>
      ))}

      <Text style={{ ...emailText.lead, margin: "16px 0 0", fontSize: "12px" }}>
        {content.apply.privacyNote}
      </Text>
    </EmailLayout>
  );
}

/** Fixture for the dev preview route (and `react-email dev`, if ever adopted). */
ApplicationReceivedEmail.PreviewProps = {
  baseUrl: "http://localhost:3000",
  submission: {
    parentName: "Amara Johnson",
    email: "amara@example.com",
    phone: "(312) 555-0142",
    studentName: "Zion Johnson",
    grade: "8th",
    challenge: "Organization & time management",
    message:
      "He's bright but loses track of deadlines.\nWe want a system he can keep up himself.",
  },
} satisfies ApplicationReceivedEmailProps;
