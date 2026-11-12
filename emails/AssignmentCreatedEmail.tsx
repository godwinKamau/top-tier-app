import { Button, Heading, Section, Text } from "@react-email/components";
import { content } from "@/lib/content";
import type { AssignmentInput } from "@/lib/db/assignments";
import { formatDayLabel, weekStartOfDate } from "@/lib/week";
import { DetailTable, type DetailRow } from "./_components/DetailTable";
import { EmailLayout } from "./_components/EmailLayout";
import { emailColors, emailFonts, emailText } from "./theme";

export type AssignmentCreatedEmailProps = {
  studentName: string;
  assignment: AssignmentInput;
  baseUrl: string;
};

export function assignmentCreatedSubject(assignment: AssignmentInput): string {
  return `New assignment: ${assignment.title}`;
}

/** Sent to a student when their consultant adds work to their planner. */
export default function AssignmentCreatedEmail({ studentName, assignment, baseUrl }: AssignmentCreatedEmailProps) {
  const firstName = studentName.trim().split(/\s+/)[0];
  const when = formatDayLabel(assignment.date, "EEEE, MMMM d");
  const rows: DetailRow[] = [
    { label: "Assignment", value: assignment.title },
    { label: "Class", value: assignment.className },
    { label: assignment.kind === "due" ? "Due" : "Work on it", value: when },
    { label: "Notes", value: assignment.notes?.trim() ?? "" },
  ].filter((row) => row.value.length > 0);
  const calendarUrl = `${baseUrl}/portal/calendar?view=week&week=${weekStartOfDate(assignment.date)}`;

  return (
    <EmailLayout
      title="New assignment"
      preview={`${assignment.title} — ${assignment.kind === "due" ? "due" : "planned for"} ${when}.`}
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
        New assignment
      </Heading>
      <Text style={emailText.lead}>
        {`${firstName ? `Hi ${firstName}, your` : "Your"} consultant added this to your planner. It's on your calendar now, and you can check it off there when it's done.`}
      </Text>

      <DetailTable rows={rows} />

      <Section style={{ marginTop: "24px" }}>
        <Button
          href={calendarUrl}
          style={{
            backgroundColor: emailColors.navy,
            color: emailColors.goldLight,
            fontFamily: emailFonts.body,
            fontSize: "14px",
            fontWeight: 700,
            borderRadius: "6px",
            padding: "12px 20px",
            textDecoration: "none",
          }}
        >
          Open my calendar
        </Button>
      </Section>
    </EmailLayout>
  );
}

/** Fixture for the dev preview route. */
AssignmentCreatedEmail.PreviewProps = {
  baseUrl: "http://localhost:3000",
  studentName: "Zion Johnson",
  assignment: {
    title: "Practice set 4.2, problems 1–15",
    className: "Algebra I",
    date: "2026-10-30",
    kind: "due",
    notes: "Show your work on the word problems.\nBring the packet to Friday's session.",
  },
} satisfies AssignmentCreatedEmailProps;
