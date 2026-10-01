import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { emailColors, emailFonts, emailLayout, emailText, isPlaceholder } from "@/emails/theme";

export type EmailFooterContact = {
  /** e.g. "Chicago, IL". Dropped when absent or still a TODO placeholder. */
  location?: string;
  email?: string;
  phone?: string;
};

export type EmailLayoutProps = {
  /**
   * Inbox preheader. Required rather than optional: when it is absent clients
   * scrape the first body text instead, which here would be the recipient's
   * own name.
   */
  preview: string;
  /** Absolute origin for images. No relative URL survives an inbox. */
  baseUrl: string;
  /** Document title; some clients use it for "view in browser". */
  title: string;
  brandName: string;
  footerCopyright: string;
  footerContact?: EmailFooterContact;
  children: ReactNode;
};

/**
 * The branded shell every Top-Tier email renders inside.
 *
 * Deliberately imports nothing from lib/content.ts — brand strings arrive as
 * props. That keeps it renderable from fixture data in the dev preview and lets
 * a future internal notification pass a different footer without forking it.
 *
 * Plain function component with no hooks: Route Handlers compile in Next's
 * `rsc` webpack layer, where the react-server build of React exports neither
 * Component nor any hook.
 */
export function EmailLayout({
  preview,
  baseUrl,
  title,
  brandName,
  footerCopyright,
  footerContact,
  children,
}: EmailLayoutProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>{title}</title>
        {/* Stops Gmail and Outlook dark mode from auto-inverting navy and gold. */}
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>
      <Body
        style={{
          margin: 0,
          padding: "24px 0",
          backgroundColor: emailColors.ivoryDark,
          fontFamily: emailFonts.body,
        }}
      >
        <Container
          style={{
            maxWidth: emailLayout.maxWidth,
            margin: "0 auto",
            backgroundColor: emailColors.white,
            border: `1px solid ${emailColors.border}`,
          }}
        >
          {/*
            Header band is ivory, not navy. public/logo.png is dark ink on a
            transparent background; the site gets its light variant from the CSS
            filter `brightness-0 invert`, which no email client applies.
          */}
          <Section
            style={{
              padding: `${emailLayout.gutter}px`,
              backgroundColor: emailColors.ivory,
              textAlign: "center",
            }}
          >
            <Img
              src={`${baseUrl}/logo.png`}
              width={192}
              height={59}
              alt={brandName}
              style={{ display: "block", margin: "0 auto", border: 0 }}
            />
          </Section>

          {/* Carries the brand when images are blocked — Outlook's default. */}
          <Section
            style={{
              height: 3,
              lineHeight: "3px",
              fontSize: 0,
              backgroundColor: emailColors.gold,
            }}
          >
            {" "}
          </Section>

          <Section style={{ padding: `${emailLayout.gutter}px` }}>{children}</Section>

          <Section
            style={{
              padding: `20px ${emailLayout.gutter}px`,
              backgroundColor: emailColors.navy,
            }}
          >
            <Text style={emailText.footnote}>
              <strong style={{ color: emailColors.goldLight }}>{brandName}</strong>
              {!isPlaceholder(footerContact?.location) ? ` · ${footerContact?.location}` : null}
            </Text>
            {!isPlaceholder(footerContact?.email) ? (
              <Text style={emailText.footnote}>{footerContact?.email}</Text>
            ) : null}
            {!isPlaceholder(footerContact?.phone) ? (
              <Text style={emailText.footnote}>{footerContact?.phone}</Text>
            ) : null}
            <Text style={{ ...emailText.footnote, marginTop: 8, color: emailColors.ivoryDark }}>
              {footerCopyright}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
