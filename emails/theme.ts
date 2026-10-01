import type { CSSProperties } from "react";

/**
 * Email-only mirror of the brand tokens in app/globals.css `@theme inline`.
 *
 * Tailwind v4 is CSS-first: those tokens compile to custom properties that only
 * exist once a browser has loaded the stylesheet. An email client loads no
 * stylesheet and cannot be trusted with var(), so every value has to be a
 * literal hex inlined on the element. There is no JS config to import, so this
 * list is a hand-kept copy — keep it minimal so it stays auditable, and move it
 * whenever globals.css moves. The dev preview route warns when the two drift.
 */
export const emailColors = {
  navy: "#0f1f3d",
  navyLight: "#1c3260",
  gold: "#c9a227",
  goldLight: "#e6c65c",
  ivory: "#faf6ee",
  ivoryDark: "#f1ece1",
  laurel: "#4a6b4f",
  border: "#ddd6c7",
  mutedForeground: "#6f6a5e",
  white: "#ffffff",
} as const;

/**
 * Playfair Display, Manrope and Caveat are all webfonts. Outlook ignores
 * @font-face outright, so the site's type is approximated by stack alone:
 * Georgia stands in for Playfair, a system sans for Manrope.
 */
export const emailFonts = {
  display: "Georgia, 'Times New Roman', serif",
  body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;

export const emailLayout = { maxWidth: 600, gutter: 24 } as const;

export const emailText = {
  h1: {
    margin: "0 0 8px",
    color: emailColors.navy,
    fontFamily: emailFonts.display,
    fontSize: "24px",
    lineHeight: "1.25",
    fontWeight: 700,
  },
  h2: {
    margin: "0 0 8px",
    color: emailColors.navy,
    fontFamily: emailFonts.display,
    fontSize: "16px",
    lineHeight: "1.3",
    fontWeight: 700,
  },
  lead: {
    margin: "0 0 20px",
    color: emailColors.mutedForeground,
    fontFamily: emailFonts.body,
    fontSize: "15px",
    lineHeight: "1.6",
  },
  body: {
    margin: "0 0 12px",
    color: emailColors.navy,
    fontFamily: emailFonts.body,
    fontSize: "15px",
    lineHeight: "1.6",
  },
  label: {
    margin: 0,
    color: emailColors.mutedForeground,
    fontFamily: emailFonts.body,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    lineHeight: "1.5",
  },
  value: {
    margin: 0,
    color: emailColors.navy,
    fontFamily: emailFonts.body,
    fontSize: "14px",
    lineHeight: "1.5",
  },
  footnote: {
    margin: 0,
    color: emailColors.ivory,
    fontFamily: emailFonts.body,
    fontSize: "12px",
    lineHeight: "1.7",
  },
} satisfies Record<string, CSSProperties>;

/**
 * content.brand.phone/email/address are still literal "(TODO: …)" strings. A
 * footer that prints them unguarded mails "(TODO: EMAIL)" to applicants.
 */
export function isPlaceholder(value: string | undefined): boolean {
  return !value || value.trim().length === 0 || value.includes("(TODO");
}
