import { cn } from "@/lib/utils";

const TONES = {
  gold: "bg-gold-wash text-gold-deep ring-gold/40",
  done: "bg-done-wash text-done ring-done/30",
  muted: "bg-muted text-subtle ring-line-strong",
  alert: "bg-[#f8e7e3] text-[#8a2f22] ring-[#8a2f22]/25",
  ink: "bg-ink text-gold-soft ring-ink",
} as const;

export type PillTone = keyof typeof TONES;

/**
 * The prototype's status chip, held to an 11px floor: its 9–9.5px originals were
 * the single largest finding in the critique of that file.
 */
export function Pill({
  tone,
  children,
  className,
}: {
  tone: PillTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.6875rem] leading-4 font-bold tracking-[0.06em] whitespace-nowrap uppercase ring-1 ring-inset",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
