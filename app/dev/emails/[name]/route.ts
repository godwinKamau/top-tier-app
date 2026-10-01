import { readFile } from "node:fs/promises";
import path from "node:path";
import { emailPreviews } from "@/emails/registry";
import { emailColors } from "@/emails/theme";
import { renderEmail } from "@/lib/email/render";

/**
 * Dev-only preview for the email templates.
 *
 * Deliberately a Route Handler rather than the react-email CLI: this renders
 * through the exact bundler, webpack layer and aliases production uses, so the
 * rsc-layer constraints (no React.Component, no hooks, the react-dom/server
 * alias) fail here with a stack trace instead of after a deploy. It also costs
 * no extra dependencies and no second dev server.
 */

type TokenMismatch = { token: string; css: string; email: string };

/** globals.css token name -> the emails/theme.ts key that mirrors it. */
const MIRRORED_TOKENS: Record<string, keyof typeof emailColors> = {
  navy: "navy",
  "navy-light": "navyLight",
  gold: "gold",
  "gold-light": "goldLight",
  ivory: "ivory",
  "ivory-dark": "ivoryDark",
  laurel: "laurel",
  border: "border",
  "muted-foreground": "mutedForeground",
};

/**
 * emails/theme.ts is a hand-kept copy of the @theme block (email clients cannot
 * read CSS custom properties). Nothing enforces that at compile time, so warn
 * here when the two drift. Dev-only; never runs in a deployed build.
 */
async function warnOnTokenDrift(): Promise<void> {
  try {
    const css = await readFile(path.join(process.cwd(), "app/globals.css"), "utf8");
    const mismatches: TokenMismatch[] = [];

    for (const [cssName, themeKey] of Object.entries(MIRRORED_TOKENS)) {
      const match = css.match(new RegExp(`--color-${cssName}:\\s*(#[0-9a-fA-F]{6})`));
      if (!match) continue;
      const cssValue = match[1].toLowerCase();
      const themeValue = emailColors[themeKey].toLowerCase();
      if (cssValue !== themeValue) {
        mismatches.push({ token: cssName, css: cssValue, email: themeValue });
      }
    }

    if (mismatches.length > 0) {
      console.warn(
        "[emails] theme.ts has drifted from globals.css:\n" +
          mismatches
            .map((m) => `  --color-${m.token}: globals.css ${m.css} vs theme.ts ${m.email}`)
            .join("\n")
      );
    }
  } catch {
    // Preview convenience only — never fail the render over the drift check.
  }
}

export async function GET(request: Request, ctx: RouteContext<"/dev/emails/[name]">) {
  if (process.env.NODE_ENV === "production") {
    return new Response(null, { status: 404 });
  }

  const { name } = await ctx.params;
  const build = emailPreviews[name];

  if (!build) {
    return new Response(
      `Unknown template "${name}". Available: ${Object.keys(emailPreviews).join(", ")}`,
      { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } }
    );
  }

  await warnOnTokenDrift();

  // Reading searchParams keeps this request-time rather than a prerender
  // candidate, which matters if cacheComponents is ever enabled.
  const wantsText = new URL(request.url).searchParams.get("format") === "text";
  const { html, text } = await renderEmail(build());

  return new Response(wantsText ? text : html, {
    headers: {
      "content-type": wantsText ? "text/plain; charset=utf-8" : "text/html; charset=utf-8",
    },
  });
}
