"use client";

import { useId, useState } from "react";
import { createGoalAction, updateGoalAction } from "@/app/berfday/students/[id]/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { GOAL_TYPES, SOAR_CATEGORIES, type GoalType } from "@/lib/goals/catalog";
import type { GoalView } from "@/lib/goals/view";
import { ActionForm } from "./ActionForm";

/**
 * Adding or editing one goal. The title is optional: left blank it is generated
 * from the type and target ("Log 4 hrs of focus time"), shown as the
 * placeholder so the admin sees what the student will read before saving.
 */
export function GoalForm({
  studentId,
  weekStart,
  goal,
  onDone,
}: {
  studentId: string;
  weekStart: string;
  /** Present when editing. The type cannot change once a goal exists. */
  goal?: GoalView;
  onDone?: () => void;
}) {
  const id = useId();
  const [type, setType] = useState<GoalType>(goal?.type ?? "focus_minutes");
  const [hours, setHours] = useState(
    goal?.targetMinutes ? String(goal.targetMinutes / 60) : "4"
  );
  const def = GOAL_TYPES[type];
  const previewMinutes = Math.round(Number(hours) * 60) || 0;

  return (
    <ActionForm
      action={goal ? updateGoalAction : createGoalAction}
      onSuccess={onDone}
      className="grid gap-3 sm:grid-cols-2"
    >
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="weekStart" value={weekStart} />
      {goal && <input type="hidden" name="goalId" value={goal.id} />}

      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-category`}>S.O.A.R. category</Label>
        <Select id={`${id}-category`} name="category" defaultValue={goal?.category ?? ""} required>
          <option value="" disabled>
            Choose…
          </option>
          {SOAR_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.letter} · {c.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-type`}>Measured by</Label>
        {goal ? (
          <>
            <input type="hidden" name="type" value={goal.type} />
            <Input id={`${id}-type`} value={def.label} disabled readOnly />
          </>
        ) : (
          <Select
            id={`${id}-type`}
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as GoalType)}
          >
            {(Object.keys(GOAL_TYPES) as GoalType[]).map((key) => (
              <option key={key} value={key}>
                {GOAL_TYPES[key].label}
              </option>
            ))}
          </Select>
        )}
      </div>

      {def.hasTarget && (
        <div className="grid gap-1.5">
          <Label htmlFor={`${id}-hours`}>Target (hours this week)</Label>
          <Input
            id={`${id}-hours`}
            name="targetHours"
            type="number"
            inputMode="decimal"
            min={0.25}
            max={40}
            step={0.25}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
          />
        </div>
      )}

      <div className={def.hasTarget ? "grid gap-1.5" : "grid gap-1.5 sm:col-span-2"}>
        <Label htmlFor={`${id}-title`}>
          Title{type === "manual" ? "" : " (optional)"}
        </Label>
        <Input
          id={`${id}-title`}
          name="title"
          defaultValue={goal?.title}
          placeholder={def.defaultTitle(previewMinutes) || "e.g. Ask one question on the lab report"}
          required={type === "manual"}
        />
      </div>

      <div className="grid gap-1.5 sm:col-span-2">
        <Label htmlFor={`${id}-detail`}>Detail (optional)</Label>
        <Input
          id={`${id}-detail`}
          name="detail"
          defaultValue={goal?.detail ?? ""}
          placeholder="One line of context"
        />
      </div>

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" variant="ink" size="portal">
          {goal ? "Save goal" : "Add goal"}
        </Button>
        {onDone && goal && (
          <Button type="button" variant="line" size="portal" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </ActionForm>
  );
}
