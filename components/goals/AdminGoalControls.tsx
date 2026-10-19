"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteGoalAction, setOverrideAction } from "@/app/berfday/students/[id]/actions";
import { Button } from "@/components/ui/button";
import type { GoalView } from "@/lib/goals/view";
import { ActionForm } from "./ActionForm";
import { GoalForm } from "./GoalForm";

/**
 * Per-goal staff controls. Overrides stay available after the week closes —
 * they are how a closed week gets corrected — while editing and deleting are
 * only offered for the weeks an admin can still plan.
 */
export function AdminGoalControls({
  goal,
  studentId,
  weekStart,
  editable,
}: {
  goal: GoalView;
  studentId: string;
  weekStart: string;
  editable: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div data-editing className="w-full border-t border-line pt-3">
        <GoalForm
          studentId={studentId}
          weekStart={weekStart}
          goal={goal}
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  const ids = (
    <>
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="goalId" value={goal.id} />
    </>
  );

  return (
    <>
      <ActionForm action={setOverrideAction} className="flex flex-wrap items-center gap-2">
        {ids}
        {goal.override ? (
          <Button type="submit" name="override" value="none" variant="line" size="portal-sm">
            Clear {goal.override === "excused" ? "excuse" : "override"}
          </Button>
        ) : (
          <>
            {goal.status !== "done" && (
              <Button type="submit" name="override" value="complete" variant="line" size="portal-sm">
                Mark complete
              </Button>
            )}
            <Button type="submit" name="override" value="excused" variant="line" size="portal-sm">
              Excuse
            </Button>
          </>
        )}
      </ActionForm>

      {editable && (
        <>
          <Button type="button" variant="ghost" size="portal-sm" className="text-ink" onClick={() => setEditing(true)}>
            <Pencil aria-hidden /> Edit
          </Button>
          <ActionForm action={deleteGoalAction} className="flex flex-wrap items-center gap-2">
            {ids}
            <Button type="submit" variant="ghost" size="portal-sm" className="text-destructive hover:bg-destructive/10">
              <Trash2 aria-hidden /> Delete
            </Button>
          </ActionForm>
        </>
      )}
    </>
  );
}
