"use client";

import { useEffect, useState, useTransition } from "react";
import { Pause, Play } from "lucide-react";
import { startFocusAction, stopFocusAction } from "@/app/portal/actions";
import { Button } from "@/components/ui/button";

/**
 * The clock on screen is only a display. The minutes that count are computed on
 * the server from its own start and stop timestamps, so closing the tab,
 * changing the laptop clock or editing this component cannot add focus time.
 *
 * `serverNow` lets the display correct for a laptop clock that is off: elapsed
 * time is measured from the server's start time using the offset between the
 * two clocks when the page rendered.
 */
export function FocusTimer({
  startedAt,
  serverNow,
  maxMinutes,
}: {
  startedAt: string | null;
  serverNow: string;
  maxMinutes: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!startedAt) return;
    const offset = Date.parse(serverNow) - Date.now();
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt, serverNow]);

  const elapsed = startedAt && now !== null ? Math.max(0, now - Date.parse(startedAt)) : 0;
  const capped = elapsed >= maxMinutes * 60_000;

  function run(action: () => Promise<{ error: string | null }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="text-center">
      <p
        className="font-[family-name:var(--font-playfair)] text-[clamp(3.5rem,14vw,6rem)] leading-none font-bold text-gold-soft tabular-nums"
        aria-live="off"
      >
        {formatClock(startedAt ? elapsed : 0)}
      </p>
      <p className="mx-auto mt-4 max-w-sm text-[0.8125rem] text-white/75 text-pretty" role="status">
        {!startedAt
          ? "Press start when you sit down to work."
          : capped
            ? `Sessions count for up to ${maxMinutes / 60} hours. Stop and start a new one if you're still going.`
            : "Focusing. Stop when you take a break; your minutes are saved then."}
      </p>
      <div className="mt-7 flex justify-center">
        {startedAt ? (
          <Button size="portal" variant="line" className="h-11 border-white/30 bg-transparent px-6 text-white hover:border-gold-soft hover:bg-white/10" disabled={pending} onClick={() => run(stopFocusAction)}>
            <Pause aria-hidden /> Stop and save
          </Button>
        ) : (
          <Button size="portal" variant="on-ink" className="h-11 px-6" disabled={pending} onClick={() => run(startFocusAction)}>
            <Play aria-hidden /> Start focusing
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-[#f3b4a8]">
          {error}
        </p>
      )}
    </div>
  );
}

function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
