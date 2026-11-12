"use client";

import { useId, useState } from "react";
import { Trash2 } from "lucide-react";
import { ActionForm } from "@/components/goals/ActionForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/actions";
import type { Assignment } from "@/lib/db/assignments";

type FormAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

/** Who is filling the form in: the student for themselves, or a consultant for them. */
type Audience = "student" | "admin";

const KINDS = [
  { value: "due", label: "Due date", hint: { student: "When it has to be turned in", admin: "When it has to be turned in" } },
  { value: "plan", label: "Plan", hint: { student: "When you'll work on it", admin: "When they should work on it" } },
] as const;

/** Inputs the action needs beyond the form's own, such as the student's ID on the dashboard. */
function Hidden({ fields }: { fields: Record<string, string> }) {
  return Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />);
}

/**
 * Adding or editing one planner entry. Saving returns to the page it came from.
 * The student's pages and the consultant's pass their own actions, each scoped
 * to the entries that side wrote.
 */
export function AssignmentForm({
  action,
  assignment,
  defaultDate,
  classNames,
  returnTo,
  hidden = {},
  audience = "student",
}: {
  action: FormAction;
  /** Present when editing. */
  assignment?: Assignment;
  defaultDate: string;
  classNames: string[];
  returnTo: string;
  hidden?: Record<string, string>;
  audience?: Audience;
}) {
  const id = useId();
  return (
    <ActionForm action={action} className="grid gap-4">
      {assignment && <input type="hidden" name="id" value={assignment.id} />}
      <input type="hidden" name="returnTo" value={returnTo} />
      <Hidden fields={hidden} />

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Type</legend>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((k) => (
            <label
              key={k.value}
              className="cursor-pointer rounded-md border-[1.5px] border-line-strong bg-card px-3 py-2.5 has-checked:border-ink has-checked:bg-gold-wash has-focus-visible:ring-2 has-focus-visible:ring-gold"
            >
              <input
                type="radio"
                name="kind"
                value={k.value}
                defaultChecked={(assignment?.kind ?? "due") === k.value}
                className="sr-only"
                required
              />
              <span className="block text-[0.8125rem] font-bold text-ink">{k.label}</span>
              <span className="block text-xs text-subtle">{k.hint[audience]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-title`}>Title</Label>
        <Input
          id={`${id}-title`}
          name="title"
          required
          maxLength={200}
          defaultValue={assignment?.title}
          placeholder="Practice set 4.2, problems 1–15"
          className="h-10 bg-card"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-class`}>Class</Label>
          <Input
            id={`${id}-class`}
            name="className"
            required
            maxLength={80}
            list={`${id}-classes`}
            autoComplete="off"
            defaultValue={assignment?.className}
            placeholder="Algebra I"
            className="h-10 bg-card"
          />
          <datalist id={`${id}-classes`}>
            {classNames.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-date`}>Date</Label>
          <Input
            id={`${id}-date`}
            name="date"
            type="date"
            required
            defaultValue={assignment?.date ?? defaultDate}
            className="h-10 bg-card"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-notes`}>
          Notes <span className="font-normal text-subtle">(optional)</span>
        </Label>
        <Textarea
          id={`${id}-notes`}
          name="notes"
          maxLength={2000}
          defaultValue={assignment?.notes ?? ""}
          placeholder="Instructions, page numbers, what to bring…"
          className="min-h-24 bg-card"
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button type="submit" variant="ink" size="portal">
          {assignment ? "Save changes" : "Add assignment"}
        </Button>
        {audience === "admin" && !assignment && (
          <p className="text-xs text-subtle">The student gets an email about it.</p>
        )}
      </div>
    </ActionForm>
  );
}

/** Two clicks to delete, so a stray tap can't lose an entry. */
export function DeleteAssignment({
  action,
  id,
  returnTo,
  hidden = {},
}: {
  action: FormAction;
  id: string;
  returnTo: string;
  hidden?: Record<string, string>;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <ActionForm action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <Hidden fields={hidden} />
      {confirming ? (
        <>
          <Button type="submit" size="portal" className="bg-[#8c3b2e] font-bold text-white hover:bg-[#7a3327]">
            <Trash2 aria-hidden /> Confirm delete
          </Button>
          <Button type="button" variant="line" size="portal" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
        </>
      ) : (
        <Button
          type="button"
          variant="line"
          size="portal"
          onClick={() => setConfirming(true)}
          className="text-[#7a3327]"
        >
          <Trash2 aria-hidden /> Delete
        </Button>
      )}
    </ActionForm>
  );
}
