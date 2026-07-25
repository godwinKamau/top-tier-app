"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";

type ApplyFormProps = {
  className?: string;
  /** Visual variant so designs can theme the form shell */
  variant?: "default" | "dark" | "warm" | "minimal";
};

export function ApplyForm({
  className,
  variant = "default",
}: ApplyFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle"
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    // TODO: Wire to a real backend / email / CRM — currently UI-only fake submit
    await new Promise((r) => setTimeout(r, 900));
    setStatus("success");
  }

  const shell =
    variant === "dark"
      ? "border-gold/30 bg-navy-light/60 text-ivory"
      : variant === "warm"
        ? "border-laurel/20 bg-ivory-dark/80 text-navy"
        : variant === "minimal"
          ? "border-border bg-card text-card-foreground"
          : "border-gold/40 bg-white text-navy shadow-sm";

  const fieldClass =
    variant === "dark"
      ? "border-gold/30 bg-navy/40 text-ivory placeholder:text-ivory/50"
      : "";

  if (status === "success") {
    return (
      <div
        className={cn(
          "rounded-xl border p-8 text-center",
          shell,
          className
        )}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2
          className="mx-auto mb-4 size-12 text-laurel"
          aria-hidden
        />
        <p className="text-lg font-semibold">
          {content.apply.successMessage}
        </p>
      </div>
    );
  }

  const f = content.apply.fields;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("rounded-xl border p-6 sm:p-8", shell, className)}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={f.parentName} htmlFor="parentName">
          <Input
            id="parentName"
            name="parentName"
            required
            autoComplete="name"
            className={fieldClass}
          />
        </Field>
        <Field label={f.email} htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </Field>
        <Field label={f.phone} htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={fieldClass}
          />
        </Field>
        <Field label={f.studentName} htmlFor="studentName">
          <Input
            id="studentName"
            name="studentName"
            required
            className={fieldClass}
          />
        </Field>
        <Field label={f.grade} htmlFor="grade" className="sm:col-span-2">
          <Input
            id="grade"
            name="grade"
            placeholder="e.g. 7th, 8th, 10th"
            required
            className={fieldClass}
          />
        </Field>
        <Field label={f.message} htmlFor="message" className="sm:col-span-2">
          <Textarea
            id="message"
            name="message"
            rows={3}
            className={fieldClass}
          />
        </Field>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="mt-6 h-11 w-full bg-gold text-navy hover:bg-gold-light focus-visible:ring-gold sm:w-auto sm:min-w-[200px]"
      >
        {status === "submitting"
          ? "Submitting…"
          : content.apply.submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
