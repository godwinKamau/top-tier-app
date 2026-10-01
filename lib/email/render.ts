import { plainTextSelectors, render, toPlainText } from "@react-email/render";
import type { ReactElement } from "react";

export type RenderedEmail = { html: string; text: string };

/**
 * Renders a template to both MIME parts.
 *
 * Imported from the root @react-email/render (2.1.0) rather than through the
 * @react-email/components barrel, which carries a nested 2.0.6 copy. Only the
 * root version is verified to guard `if (!React.Component)` — the react-server
 * build of React in Next's rsc layer has no Component, so an unguarded error
 * boundary would throw on construction.
 *
 * `render(node, { plainText: true })` is the documented alternative but renders
 * the tree a second time; toPlainText reuses the HTML already produced.
 * plainTextSelectors is not optional-flavoured — without it the text part is
 * href dumps and alt-text noise.
 */
export async function renderEmail(node: ReactElement): Promise<RenderedEmail> {
  const html = await render(node, { pretty: false });
  return { html, text: toPlainText(html, { selectors: plainTextSelectors }) };
}
