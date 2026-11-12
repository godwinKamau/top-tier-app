-- The "Complete N assignments" goal type. Purely additive.
--
-- Run the ALTER TYPE on its own first: Postgres will not let a new enum value
-- be used (here, by the check constraint) in the transaction that added it.
ALTER TYPE "public"."goal_type" ADD VALUE 'assignments';

-- Then, in one transaction:
BEGIN;
ALTER TABLE "weekly_goals" ADD COLUMN "target_count" integer;
ALTER TABLE "weekly_goals" ADD COLUMN "final_target" integer;
ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_assignments_target_check"
	CHECK ("weekly_goals"."type" <> 'assignments' OR "weekly_goals"."target_count" > 0);
COMMIT;
