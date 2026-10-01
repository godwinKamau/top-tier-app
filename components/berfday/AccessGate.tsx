"use client";

import { useActionState } from "react";
import { KeyRound, TriangleAlert } from "lucide-react";
import { submitAccessCode } from "@/app/berfday/actions";
import { INITIAL_GATE_STATE } from "@/app/berfday/gateState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AccessGate() {
  const [state, formAction, isPending] = useActionState(submitAccessCode, INITIAL_GATE_STATE);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy px-4 py-16">
      <form
        action={formAction}
        className="w-full max-w-sm border border-gold/30 bg-navy-light/60 p-8 text-ivory shadow-[0_24px_60px_-28px_rgba(7,13,26,0.85)]"
      >
        <KeyRound className="mb-5 size-8 text-gold" aria-hidden />
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl">Applications</h1>
        <p className="mt-1.5 text-sm text-ivory/60">Enter the access code to continue.</p>

        {state.error && (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2.5 border border-destructive/50 bg-destructive/15 p-3 text-sm leading-relaxed text-pretty"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {state.error}
          </p>
        )}

        <div className="mt-5 grid gap-1.5">
          <Label htmlFor="code" className="text-ivory/80">
            Access code
          </Label>
          <Input
            // Re-keyed per attempt so a rejected code is cleared rather than
            // left for the next guess to be typed on the end of.
            key={`attempt-${state.attempt}`}
            id="code"
            name="code"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            required
            className="h-10 border-gold/30 bg-navy/40 text-ivory caret-gold placeholder:text-ivory/40 tabular-nums tracking-[0.3em]"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isPending}
          className="mt-6 h-11 w-full border border-gold bg-gradient-to-r from-gold to-gold-light text-base font-bold text-navy transition-[filter,scale] duration-200 ease-out hover:brightness-110 active:scale-[0.99] focus-visible:ring-gold"
        >
          {isPending ? "Checking…" : "Unlock"}
        </Button>
      </form>
    </main>
  );
}
