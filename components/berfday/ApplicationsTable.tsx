"use client";

import { Fragment, useState } from "react";
import { ChevronRight, Inbox, MailCheck, MailX } from "lucide-react";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Rows arrive pre-formatted from the server rather than as Date objects.
 * Formatting a date inside a Client Component renders it in the server's
 * timezone during SSR and the browser's on hydration, which React reports as a
 * hydration mismatch — and would show two different times to two staff members
 * in different places. The page pins the zone instead.
 */
export type ApplicationView = {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  studentName: string;
  grade: string;
  challenge: string;
  message: string;
  /**
   * The applicant_stage enum the existing schema already tracks. Shown in the
   * detail panel rather than as a column: until something advances it, every row
   * reads "new", and a column of identical values is noise.
   */
  stage: string;
  confirmationSent: boolean;
  receivedAt: string;
  receivedAtShort: string;
};

const f = content.apply.fields;

export function ApplicationsTable({ rows }: { rows: ApplicationView[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (rows.length === 0) {
    return (
      <div className="border border-border bg-card p-12 text-center">
        <Inbox className="mx-auto mb-4 size-10 text-muted-foreground/60" aria-hidden />
        <p className="font-semibold text-navy">No applications yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Submissions from the apply form will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border bg-card">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">
          Applications received, newest first. Each row expands to show the full submission.
        </caption>
        <thead>
          <tr className="border-b border-border bg-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
            <th scope="col" className="w-8" />
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Received
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Parent
            </th>
            <th scope="col" className="px-3 py-2.5 font-semibold">
              Student
            </th>
            <th scope="col" className="hidden px-3 py-2.5 font-semibold sm:table-cell">
              Grade
            </th>
            <th scope="col" className="hidden px-3 py-2.5 font-semibold md:table-cell">
              Challenge
            </th>
            <th scope="col" className="px-3 py-2.5 text-center font-semibold">
              <span className="sr-only">Confirmation email</span>
              <span aria-hidden>Conf.</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const open = openId === row.id;

            return (
              // Keyed on the Fragment, not the <tr>: a key on a child of the
              // returned element is not the list key React needs.
              <Fragment key={row.id}>
                <tr
                  className={cn(
                    "border-b border-border/70 transition-colors",
                    open ? "bg-ivory" : "hover:bg-muted/40"
                  )}
                >
                  <td className="pl-2">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : row.id)}
                      aria-expanded={open}
                      aria-controls={`detail-${row.id}`}
                      className="grid size-6 place-items-center rounded text-navy/50 transition-colors hover:text-navy focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <span className="sr-only">
                        {open ? "Hide" : "Show"} the full application from {row.parentName}
                      </span>
                      <ChevronRight
                        className={cn("size-4 transition-transform", open && "rotate-90")}
                        aria-hidden
                      />
                    </button>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground tabular-nums">
                    {row.receivedAtShort}
                  </td>
                  <td className="px-3 py-2.5 font-medium text-navy">{row.parentName}</td>
                  <td className="px-3 py-2.5 text-navy/80">{row.studentName || "—"}</td>
                  <td className="hidden px-3 py-2.5 whitespace-nowrap text-navy/80 sm:table-cell">
                    {row.grade || "—"}
                  </td>
                  <td className="hidden max-w-[22ch] truncate px-3 py-2.5 text-navy/80 md:table-cell">
                    {row.challenge || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {row.confirmationSent ? (
                      <MailCheck className="inline size-4 text-laurel" aria-label="Confirmation sent" />
                    ) : (
                      <MailX
                        className="inline size-4 text-destructive"
                        aria-label="Confirmation not sent"
                      />
                    )}
                  </td>
                </tr>

                {open && (
                  <tr id={`detail-${row.id}`} className="border-b border-border">
                    <td />
                    <td colSpan={6} className="px-3 pt-1 pb-5">
                      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                        <Detail label="Received">{row.receivedAt}</Detail>
                        <Detail label="Stage">
                          <span className="inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-xs font-semibold tracking-wide text-navy uppercase">
                            {row.stage.replace(/_/g, " ")}
                          </span>
                        </Detail>
                        <Detail label={f.parentName}>{row.parentName}</Detail>
                        <Detail label={f.email}>
                          <a
                            href={`mailto:${row.email}`}
                            className="text-navy underline decoration-gold/60 underline-offset-2 hover:decoration-gold"
                          >
                            {row.email}
                          </a>
                        </Detail>
                        <Detail label={f.phone}>
                          {row.phone ? (
                            <a
                              href={`tel:${row.phone.replace(/[^\d+]/g, "")}`}
                              className="text-navy underline decoration-gold/60 underline-offset-2 hover:decoration-gold"
                            >
                              {row.phone}
                            </a>
                          ) : (
                            "—"
                          )}
                        </Detail>
                        <Detail label={f.studentName}>{row.studentName || "—"}</Detail>
                        <Detail label={f.grade}>{row.grade || "—"}</Detail>
                        <Detail label={f.challenge} className="sm:col-span-2">
                          {row.challenge || "—"}
                        </Detail>
                        <Detail label={f.message} className="sm:col-span-2">
                          {/* whitespace-pre-line: the goals field is a textarea, so the
                              family's own line breaks are part of what they wrote. */}
                          <span className="whitespace-pre-line">{row.message || "—"}</span>
                        </Detail>
                        {!row.confirmationSent && (
                          <p className="sm:col-span-2 flex items-start gap-2 border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive">
                            <MailX className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                            No confirmation email was recorded for this application — they may not
                            know it arrived.
                          </p>
                        )}
                      </dl>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Detail({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm leading-relaxed text-navy/90 text-pretty">{children}</dd>
    </div>
  );
}
