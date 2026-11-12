import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** The frame the new and edit pages share. */
export function AssignmentPage({
  title,
  backHref,
  children,
}: {
  title: string;
  backHref: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[640px] flex-1 px-4 pt-6 pb-20 sm:px-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 pb-3 text-xs font-semibold text-subtle hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden /> Back
      </Link>
      <section
        aria-labelledby="assignment-heading"
        className="grid gap-5 rounded-[10px] border-[1.5px] border-t-[5px] border-gold bg-card px-4 pt-5 pb-5 shadow-[0_2px_10px_rgba(23,39,79,0.07)] sm:px-6"
      >
        <h1
          id="assignment-heading"
          className="font-[family-name:var(--font-playfair)] text-[1.5rem] font-bold text-ink"
        >
          {title}
        </h1>
        {children}
      </section>
    </main>
  );
}
