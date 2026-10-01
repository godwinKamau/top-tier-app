"use client";

import { useActionState } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";

type ApplyFormProps = {
  className?: string;
  variant?: "default" | "dark" | "warm" | "minimal";
};

type ApplyState =
  | { status: "success"; email: string }
  | { status: "failure"; values: Record<string, string>; attempt: number }
  | null;

export function ApplyForm({ className, variant = "default" }: ApplyFormProps) {
  const [state, formAction, isPending] = useActionState<ApplyState, FormData>(
    async (_prev, formData) => {
      const json = Object.fromEntries(formData.entries())
      const email = String(formData.get('email'));

      const res = await fetch('/api/sendEmail', {
        method:'POST',
        headers: { 'Content-Type': 'application/json'},
        body:JSON.stringify(json)
      })

      if (res.status === 200) {
        return { status: "success", email }
      }

      // React resets an uncontrolled form once its action settles, so the only
      // way the visitor keeps what they typed is to hand it back. The attempt
      // counter re-keys the form so those values arrive as a fresh mount's
      // defaultValue — Base UI's inputs warn if a default changes under them,
      // and a <select> ignores it outright.
      return {
        status: "failure",
        values: Object.fromEntries(
          Object.entries(json).map(([k, v]) => [k, String(v)])
        ),
        attempt: (_prev?.status === "failure" ? _prev.attempt : 0) + 1,
      };
    },
    null
  );

  const failed = state?.status === "failure" ? state : undefined;
  const kept = failed?.values;

  const dark = variant === "dark";

  const shell =
    variant === "dark"
      ? "border-gold/30 bg-navy-light/60 text-ivory"
      : variant === "warm"
        ? "border-laurel/20 bg-ivory-dark/80 text-navy"
        : variant === "minimal"
          ? "border-border bg-card text-card-foreground"
          : "border-gold/60 bg-white text-navy shadow-[0_24px_60px_-28px_rgba(7,13,26,0.85)]";

  // h-10 rather than the primitive's dense h-8: this is a conversion form, not
  // a settings panel. The caret is themed too — a browser default caret in a
  // branded field is the detail nobody draws.
  const fieldClass = dark
    ? "h-10 border-gold/30 bg-navy/40 text-ivory caret-gold placeholder:text-ivory/50"
    : "h-10 caret-navy";

  if ( state?.status === "success") {
    return (
      <div
        className={cn("border p-8 text-center", shell, className)}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto mb-4 size-12 text-laurel" aria-hidden />
        <p className="text-lg font-semibold text-balance">
          {content.apply.successMessage}
        </p>
        <p className={cn("mt-2 text-sm", dark ? "text-ivory/60" : "text-navy/60")}>
          We&apos;ve sent a confirmation to{" "}
          {/* Gold on white is ~2.4:1 — it only carries the accent on navy. */}
          <span className={cn("font-semibold", dark ? "text-gold" : "text-navy")}>
            {state.email}
          </span>
          .
        </p>
      </div>
    );
  }

  const f = content.apply.fields;

  return (
    <form
      key={`attempt-${failed?.attempt ?? 0}`}
      action={formAction}
      className={cn("border p-6 sm:p-8", shell, className)}
    >
      {failed && (
        <p
          role="alert"
          className={cn(
            "mb-5 flex items-start gap-2.5 border p-3 text-sm leading-relaxed text-pretty",
            dark
              ? "border-destructive/50 bg-destructive/15 text-ivory"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          )}
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {content.apply.failMessage}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.parentName} htmlFor="parentName" required dark={dark}>
          <Input id="parentName" name="parentName" required autoComplete="name" defaultValue={kept?.parentName ?? ""} className={fieldClass} />
        </Field>
        <Field label={f.email} htmlFor="email" required dark={dark}>
          <Input id="email" name="email" type="email" required autoComplete="email" defaultValue={kept?.email ?? ""} className={fieldClass} />
        </Field>
        <Field label={f.phone} htmlFor="phone" required dark={dark}>
          <Input id="phone" name="phone" type="tel" required autoComplete="tel" defaultValue={kept?.phone ?? ""} className={fieldClass} />
        </Field>
        <Field label={f.studentName} htmlFor="studentName" required dark={dark}>
          <Input id="studentName" name="studentName" required defaultValue={kept?.studentName ?? ""} className={fieldClass} />
        </Field>
        <Field label={f.grade} htmlFor="grade" required dark={dark}>
          <Select id="grade" name="grade" required defaultValue={kept?.grade ?? ""} className={fieldClass}>
            <option value="" disabled>
              {content.apply.gradePlaceholder}
            </option>
            {content.apply.gradeOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={f.challenge} htmlFor="challenge" required dark={dark}>
          <Select id="challenge" name="challenge" required defaultValue={kept?.challenge ?? ""} className={fieldClass}>
            <option value="" disabled>
              {content.apply.challengePlaceholder}
            </option>
            {content.apply.challengeOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={f.message} htmlFor="message" className="sm:col-span-2" dark={dark}>
          <Textarea
            id="message"
            name="message"
            rows={3}
            defaultValue={kept?.message ?? ""}
            placeholder={content.apply.messagePlaceholder}
            className={cn(
              dark
                ? "border-gold/30 bg-navy/40 text-ivory caret-gold placeholder:text-ivory/50"
                : "caret-navy"
            )}
          />
        </Field>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="mt-6 h-12 w-full border border-gold bg-gradient-to-r from-gold to-gold-light text-base font-bold text-navy transition-[filter,scale] duration-200 ease-out hover:brightness-110 active:scale-[0.99] focus-visible:ring-gold"
      >
        {isPending ? "Submitting…" : content.apply.submitLabel}
      </Button>
      <p
        className={cn(
          "mt-3 text-center text-xs leading-relaxed text-pretty",
          dark ? "text-ivory/50" : "text-navy/60"
        )}
      >
        {content.apply.privacyNote}
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className,
  required,
  dark,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className={cn("gap-1.5", dark ? "text-ivory/80" : "text-navy/80")}
      >
        {label}
        {!required && (
          <span
            className={cn(
              "text-xs font-normal",
              dark ? "text-ivory/45" : "text-navy/55"
            )}
          >
            optional
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}
