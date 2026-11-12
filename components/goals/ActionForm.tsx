"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionResult } from "@/lib/actions";
import { cn } from "@/lib/utils";

type FormAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/**
 * A form bound to a portal action: disables itself while the action runs and
 * shows the action's refusal ("this week is closed") next to the controls
 * instead of failing silently. The children can stay server-rendered.
 */
export function ActionForm({
  action,
  children,
  className,
  onSuccess,
}: {
  action: FormAction;
  children: ReactNode;
  className?: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (prev, formData) => {
      const result = await action(prev, formData);
      if (!result.error) onSuccess?.();
      return result;
    },
    { error: null }
  );

  return (
    <form action={formAction} className={className}>
      <fieldset disabled={pending} className={cn("contents", pending && "[&_*]:cursor-wait")}>
        {children}
      </fieldset>
      {state.error && (
        <p role="alert" className="basis-full text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
