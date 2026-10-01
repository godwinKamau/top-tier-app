import { content } from "@/lib/content";

export type ApplicationField = keyof typeof content.apply.fields;

/**
 * Doubles as the request-body allowlist and the row order in the email.
 * content.apply.fields declares the fields in the order the form asks for them
 * and object key order is insertion order, so one declaration drives all three
 * facts: which keys are accepted, what order they render in, and their labels.
 */
export const APPLICATION_FIELDS = Object.keys(content.apply.fields) as ApplicationField[];

/** Every field is a string; optional ones are "" so empty rows can be filtered. */
export type ApplicationSubmission = Readonly<Record<ApplicationField, string>>;

const REQUIRED_FIELDS = ["parentName", "email"] as const satisfies readonly ApplicationField[];

export type ParseResult =
  | { ok: true; submission: ApplicationSubmission }
  | { ok: false; missing: ApplicationField[] };

/**
 * Builds the submission by *picking* known keys rather than spreading the
 * parsed body. That is what makes the $ACTION_* keys React appends to FormData
 * a non-problem structurally, instead of something a filter has to remember.
 */
export function parseApplicationSubmission(input: unknown): ParseResult {
  const source = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;

  const submission = Object.fromEntries(
    APPLICATION_FIELDS.map((field) => {
      const raw = source[field];
      return [field, typeof raw === "string" ? raw.trim() : ""];
    })
  ) as ApplicationSubmission;

  const missing = REQUIRED_FIELDS.filter((field) => submission[field].length === 0);

  return missing.length > 0 ? { ok: false, missing: [...missing] } : { ok: true, submission };
}
