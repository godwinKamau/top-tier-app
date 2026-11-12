# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: **consultants/administrators at Top-Tier Scholar Systems**, a tutoring and academic-coaching company. They run a roster of students day to day, decide who needs attention this week, assign weekly S.O.A.R. goals, and track progress across many families at once.

Secondary users:
- **Students**, working through their weekly goals, logging focus time with a timer, and writing a weekly study log, all in their own portal at `/portal`.
- **Parents** (planned, not built): monitoring their child's weekly progress, assignments and billing.

The admin area also holds the **Applicants** pipeline: families who applied through the public site's form.

## Product Purpose

A client portal that keeps independent study accountable *between* tutoring sessions. Admins see which students are behind, set short weekly goals, and watch them complete. Students get a clear list for the week and tools to do the work (focus timer, study log). Success means fewer things falling through the cracks between sessions and no ambiguity about what was expected and what got done.

## Positioning

The differentiator is the **accountability loop**, not scheduling or invoicing: admin assigns weekly goals → student does the work in the portal (focus sessions, study log, check-offs) → progress is computed from that activity and shown identically to student and admin. A generic tutoring CRM or LMS handles rosters and billing but doesn't close this loop between sessions; that loop is the product's reason to exist.

## Operating Context

- Admin area (`/berfday`), behind Clerk sign-in plus an `admin` row in `users`. Tabs: **Students** (the default and priority view) and **Applicants**. Each student has a detail page with their weekly goals, focus sessions and study logs.
- Student portal (`/portal`): This week (S.O.A.R. goals), Focus (server-timed sessions), Study log (four questions per week).
- **S.O.A.R.** = **S**mall Wins, **O**rganization, **A**ccountability, **R**igor. The admin picks a category for each goal; separately, the goal's type determines how progress is measured.
- Weeks run Monday–Sunday in **America/Chicago**; the company is Chicago-based. A closed week is locked and read-only.

## Capabilities and Constraints

- Built: Next.js 16 app router, Clerk auth (sign-up is invite-only), Neon Postgres via Drizzle, Resend for email.
- Goal types today: focus minutes (an absolute target per goal), weekly study log, manual check-off. Calendar updates and assignment turn-in are planned as new goal types.
- Progress is always computed from activity records, never typed in, and a focus session counts for at most 3 hours.
- Deferred: the parent role, billing/retainers, the calendar, the "Needs you" triage queue, assignments with comment threads, notifications.

## Brand Commitments

- Company name in product UI: **Top-Tier Scholar Systems**.
- The client-approved prototype (`~/Downloads/Multi-role assignment platform design/portalv2/Portal Prototype v2.dc.html`) is the binding visual reference for the portal: a royal-blue header (`#21408d`) with gold (`#c9a227` / `#e8cd6b`) accents, ivory ground (`#faf6ee`), navy ink (`#17274f`), Playfair Display headings and Manrope UI text.

## Evidence on Hand

No real testimonials, pricing, student counts or logo assets have been provided. Prototype names and numbers ("Marcus Whitfield", "Amara") are placeholders and must not ship as real content.

## Product Principles

1. Close the loop between sessions: every feature ties back to goal assignment, student follow-through, or admin visibility.
2. One truth, two views: student and admin always see the same progress, computed from the same records.
3. Each role sees only what it needs to act on.
4. Honest data: no fabricated progress, and no placeholder figures presented as real.

## Accessibility & Inclusion

No formal standard set. The prototype critique found contrast below 4.5:1, functional text under 11px, unlabeled inputs and no responsive layout; the built portal must not repeat these.
