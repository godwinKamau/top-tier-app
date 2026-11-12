import { Resend } from "resend";
import { content } from "@/lib/content";

// Constructed per call rather than at module scope: the Resend constructor
// throws on a missing key, which at module scope took the whole route down with
// an HTML error page instead of a JSON 500 the form can show a message for.
export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Email clients cannot resolve a relative /logo.png, so images need an
// absolute origin. Falling back to the production host keeps a missing env var
// from silently shipping a broken image.
export function getBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://toptierscholarsystems.com").replace(
    /\/$/,
    ""
  );
}

export const FROM = `${content.brand.name} <onboarding@toptierscholarsystems.com>`;
