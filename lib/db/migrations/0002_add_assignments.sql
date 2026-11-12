-- The student planner and calendar: entries written by the student or by a
-- consultant, each one a plan (when they'll work on it) or a due date. Purely additive.
CREATE TYPE "public"."assignment_kind" AS ENUM('plan', 'due');
CREATE TYPE "public"."assignment_author" AS ENUM('student', 'admin');

CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"title" text NOT NULL,
	"class_name" text NOT NULL,
	"date" date NOT NULL,
	"kind" "assignment_kind" NOT NULL,
	"notes" text,
	"completed_at" timestamp with time zone,
	"author" "assignment_author" DEFAULT 'student' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assignments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade
);

CREATE INDEX "assignments_student_date_idx" ON "assignments" USING btree ("student_id", "date");
