/**
 * Mirrors the schema already live in the Neon database. The tables were created
 * outside drizzle (see ./migrations/README.md), so this file was generated with
 * `drizzle-kit pull` rather than written by hand, and it describes **every**
 * table on purpose: drizzle-kit diffs the live database against this file, so a
 * table missing from here reads as a table to DROP.
 *
 * Only two edits were made to the introspected output:
 *   1. `mode: 'string'` dropped from the timestamps, so they map to Date.
 *   2. `challenge` added to `applicants` — see the comment on that column.
 *
 * Everything below the "Student portal" marker is hand-written and new: it is
 * applied with `drizzle-kit push`, which should only ever report additions.
 */
import { sql } from "drizzle-orm"
import { pgTable, index, uniqueIndex, foreignKey, uuid, text, timestamp, jsonb, boolean, unique, integer, date, check, pgEnum } from "drizzle-orm/pg-core"

export const applicantSource = pgEnum("applicant_source", ['website', 'manual'])
export const applicantStage = pgEnum("applicant_stage", ['new', 'contacted', 'consult_scheduled', 'consult_completed', 'enrolled', 'declined', 'archived'])
export const emailSendStatus = pgEnum("email_send_status", ['scheduled', 'sent', 'delivered', 'bounced', 'failed', 'cancelled'])
export const meetingStatus = pgEnum("meeting_status", ['scheduled', 'completed', 'cancelled'])
export const userRole = pgEnum("user_role", ['admin', 'coach'])


export const applicants = pgTable("applicants", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	parentName: text("parent_name").notNull(),
	parentEmail: text("parent_email").notNull(),
	phone: text(),
	studentName: text("student_name").notNull(),
	grade: text(),
	message: text(),
	/**
	 * The apply form asks for a primary academic challenge and the original
	 * schema had nowhere to put it, so the answer was shown in the confirmation
	 * email and then discarded. Nullable because every row that predates the
	 * column genuinely has no answer, rather than an empty one.
	 */
	challenge: text(),
	stage: applicantStage().default('new').notNull(),
	source: applicantSource().default('website').notNull(),
	clerkUserId: text("clerk_user_id"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("applicants_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("applicants_stage_idx").using("btree", table.stage.asc().nullsLast().op("enum_ops")),
	foreignKey({
			columns: [table.clerkUserId],
			foreignColumns: [users.clerkUserId],
			name: "applicants_clerk_user_id_users_clerk_user_id_fk"
		}),
]);

export const applicantEvents = pgTable("applicant_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	type: text().notNull(),
	fromStage: text("from_stage"),
	toStage: text("to_stage"),
	actorId: text("actor_id"),
	payload: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("applicant_events_applicant_id_idx").using("btree", table.applicantId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.applicantId],
			foreignColumns: [applicants.id],
			name: "applicant_events_applicant_id_applicants_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [users.clerkUserId],
			name: "applicant_events_actor_id_users_clerk_user_id_fk"
		}),
]);

export const users = pgTable("users", {
	clerkUserId: text("clerk_user_id").primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	role: userRole().default('coach').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emailSends = pgTable("email_sends", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id"),
	meetingId: uuid("meeting_id"),
	templateId: uuid("template_id"),
	toAddress: text("to_address").notNull(),
	subject: text().notNull(),
	renderedHtml: text("rendered_html"),
	status: emailSendStatus().notNull(),
	isTest: boolean("is_test").default(false).notNull(),
	resendId: text("resend_id"),
	scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
	sentAt: timestamp("sent_at", { withTimezone: true }),
	canceledAt: timestamp("canceled_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	error: text(),
}, (table) => [
	foreignKey({
			columns: [table.applicantId],
			foreignColumns: [applicants.id],
			name: "email_sends_applicant_id_applicants_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.meetingId],
			foreignColumns: [meetings.id],
			name: "email_sends_meeting_id_meetings_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [emailTemplates.id],
			name: "email_sends_template_id_email_templates_id_fk"
		}),
]);

export const meetings = pgTable("meetings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicantId: uuid("applicant_id").notNull(),
	title: text().notNull(),
	startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
	endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
	timeZone: text("time_zone").default('America/Chicago').notNull(),
	location: text(),
	description: text(),
	status: meetingStatus().default('scheduled').notNull(),
	icsUid: text("ics_uid").notNull(),
	icsSequence: integer("ics_sequence").default(0).notNull(),
	googleEventId: text("google_event_id"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("meetings_starts_at_idx").using("btree", table.startsAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.applicantId],
			foreignColumns: [applicants.id],
			name: "meetings_applicant_id_applicants_id_fk"
		}).onDelete("cascade"),
	unique("meetings_ics_uid_unique").on(table.icsUid),
]);

export const emailTemplates = pgTable("email_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	key: text().notNull(),
	name: text().notNull(),
	subject: text().notNull(),
	body: text().notNull(),
	variables: jsonb(),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	unique("email_templates_key_unique").on(table.key),
]);

export const emailTriggers = pgTable("email_triggers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	templateId: uuid("template_id").notNull(),
	event: text().notNull(),
	delayMinutes: integer("delay_minutes").default(0).notNull(),
	enabled: boolean().default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [emailTemplates.id],
			name: "email_triggers_template_id_email_templates_id_fk"
		}).onDelete("cascade"),
]);

// ─── Student portal ──────────────────────────────────────────────────────────

/** Small Wins, Organization, Accountability, Rigor. Labels live in lib/goals/catalog.ts. */
export const soarCategory = pgEnum("soar_category", ['small_wins', 'organization', 'accountability', 'rigor'])
/** How progress is measured. Each value has a calculator in lib/goals/catalog.ts. */
export const goalType = pgEnum("goal_type", ['focus_minutes', 'study_log', 'manual'])
export const goalOverride = pgEnum("goal_override", ['complete', 'excused'])
export const focusSource = pgEnum("focus_source", ['timer', 'admin'])

/**
 * A student's profile. Deliberately not a `users` row: `users` is staff, and
 * getDashboardAccess() treats any row there as a candidate for /berfday.
 *
 * `clerk_user_id` starts null. The student is invited through Clerk, and their
 * first /portal visit links the account by matching the verified primary email
 * to `email` (stored lower-cased), so a profile can be set up and given goals
 * before the student has ever signed in.
 */
export const students = pgTable("students", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	grade: text(),
	school: text(),
	clerkUserId: text("clerk_user_id"),
	assignedConsultantId: text("assigned_consultant_id"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	unique("students_email_unique").on(table.email),
	unique("students_clerk_user_id_unique").on(table.clerkUserId),
	foreignKey({
			columns: [table.assignedConsultantId],
			foreignColumns: [users.clerkUserId],
			name: "students_assigned_consultant_id_users_clerk_user_id_fk"
		}).onDelete("set null"),
]);

/**
 * One S.O.A.R. goal for one student in one week. Progress is never stored while
 * the week is open: it is computed from the activity tables on read, so a
 * corrected focus session or an edited log fixes the goal without a sync step.
 *
 * `final_progress` / `final_status` / `locked_at` are written once, on the first
 * read after the week closes (see lib/goals/view.ts), and are the record from
 * then on. `final_status` is what the activity earned ('open' | 'done'); the
 * override is still applied on top, so it stays correctable.
 */
export const weeklyGoals = pgTable("weekly_goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	studentId: uuid("student_id").notNull(),
	/** Monday of the week, in America/Chicago. */
	weekStart: date("week_start", { mode: "string" }).notNull(),
	category: soarCategory().notNull(),
	type: goalType().notNull(),
	targetMinutes: integer("target_minutes"),
	title: text().notNull(),
	detail: text(),
	/** The student's own check on a `manual` goal. */
	manuallyCompletedAt: timestamp("manually_completed_at", { withTimezone: true }),
	override: goalOverride(),
	overrideBy: text("override_by"),
	finalProgress: integer("final_progress"),
	finalStatus: text("final_status"),
	lockedAt: timestamp("locked_at", { withTimezone: true }),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("weekly_goals_student_week_idx").on(table.studentId, table.weekStart),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "weekly_goals_student_id_students_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.overrideBy],
			foreignColumns: [users.clerkUserId],
			name: "weekly_goals_override_by_users_clerk_user_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.clerkUserId],
			name: "weekly_goals_created_by_users_clerk_user_id_fk"
		}),
	check("weekly_goals_focus_target_check", sql`${table.type} <> 'focus_minutes' OR ${table.targetMinutes} > 0`),
]);

/**
 * Timestamps are set by the server, never sent by the browser, so the minutes
 * a goal counts are minutes that actually elapsed. `minutes` is filled on stop
 * (capped in lib/db/focus.ts). A session counts toward the Chicago week its
 * `started_at` falls in.
 */
export const focusSessions = pgTable("focus_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	studentId: uuid("student_id").notNull(),
	startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
	endedAt: timestamp("ended_at", { withTimezone: true }),
	minutes: integer(),
	source: focusSource().default('timer').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index("focus_sessions_student_started_idx").on(table.studentId, table.startedAt),
	// At most one running timer per student, enforced by the database so two
	// tabs pressing Start cannot both open one.
	uniqueIndex("focus_sessions_one_open_idx").on(table.studentId).where(sql`${table.endedAt} IS NULL`),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "focus_sessions_student_id_students_id_fk"
		}).onDelete("cascade"),
]);

export const studyLogs = pgTable("study_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	studentId: uuid("student_id").notNull(),
	weekStart: date("week_start", { mode: "string" }).notNull(),
	completed: text().default('').notNull(),
	remaining: text().default('').notNull(),
	blockers: text().default('').notNull(),
	learned: text().default('').notNull(),
	submittedAt: timestamp("submitted_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	unique("study_logs_student_week_unique").on(table.studentId, table.weekStart),
	foreignKey({
			columns: [table.studentId],
			foreignColumns: [students.id],
			name: "study_logs_student_id_students_id_fk"
		}).onDelete("cascade"),
]);
