import { Column, Row, Section } from "@react-email/components";
import { Text } from "@react-email/components";
import { emailColors, emailText } from "@/emails/theme";
import { MultilineText } from "./MultilineText";

export type DetailRow = { label: string; value: string };

type DetailTableProps = {
  rows: readonly DetailRow[];
};

/**
 * Label/value panel used for "here is what you sent us". Kept free of any
 * content.ts import so a future internal notification can reuse it verbatim
 * with a different row set.
 */
export function DetailTable({ rows }: DetailTableProps) {
  return (
    <Section
      style={{
        backgroundColor: emailColors.ivory,
        border: `1px solid ${emailColors.border}`,
        padding: 16,
      }}
    >
      {rows.map(({ label, value }, index) => (
        <Row
          key={label}
          style={index > 0 ? { borderTop: `1px solid ${emailColors.border}` } : undefined}
        >
          <Column style={{ padding: "8px 16px 8px 0", verticalAlign: "top", width: "38%" }}>
            <Text style={emailText.label}>{label}</Text>
          </Column>
          <Column style={{ padding: "8px 0", verticalAlign: "top" }}>
            <MultilineText value={value} style={emailText.value} />
          </Column>
        </Row>
      ))}
    </Section>
  );
}
