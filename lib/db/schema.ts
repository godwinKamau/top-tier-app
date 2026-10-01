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
 */
import { pgTable, index, foreignKey, uuid, text, timestamp, jsonb, boolean, unique, integer, pgEnum } from "drizzle-orm/pg-core"

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
