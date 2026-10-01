"use client";

import { useState } from "react";
import { Accordion } from "@base-ui/react/accordion";
import {
  Plus,
  Gauge,
  CalendarClock,
  NotebookPen,
  Target,
  FolderTree,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import { content } from "@/lib/content";

const iconMap: Record<
  (typeof content.topTierSolutions.items)[number]["icon"],
  LucideIcon
> = {
  gauge: Gauge,
  calendarClock: CalendarClock,
  notebookPen: NotebookPen,
  target: Target,
  folderTree: FolderTree,
  lifeBuoy: LifeBuoy,
};

type TopTierSolutionsProps = {
  items: readonly {
    q: string;
    a: string;
    icon: keyof typeof iconMap;
  }[];
};

export function TopTierSolutions({ items }: TopTierSolutionsProps) {
  // Controlled so hover can drive which panel is open. Clicks and keyboard
  // still work — they come through onValueChange like any uncontrolled usage.
  const [open, setOpen] = useState<string[]>(items.length ? [items[0].q] : []);

  return (
    <Accordion.Root
      value={open}
      onValueChange={(value) => setOpen(value as string[])}
      className="mt-12 border-t border-gold/15"
    >
      {items.map(({ q, a, icon }) => {
        const Icon = iconMap[icon];

        return (
          <Accordion.Item
            key={q}
            value={q}
            className="border-b border-gold/15"
            onMouseEnter={() => setOpen([q])}
          >
            <Accordion.Header>
              {/* No font-family here on purpose — the header inherits the
                  section's Playfair. Size and weight stay local. */}
              <Accordion.Trigger className="group flex w-full items-center gap-3 py-5 text-left text-lg font-semibold text-ivory transition hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:gap-4 sm:text-xl">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-gold/30 bg-gold/10 text-gold transition duration-200 group-hover:border-gold/60 group-data-panel-open:bg-gold group-data-panel-open:text-navy sm:size-10">
                  <Icon className="size-4 sm:size-5" aria-hidden />
                </span>
                <span className="flex-1">{q}</span>
                <Plus
                  className="size-4 shrink-0 text-gold transition-transform duration-200 group-data-panel-open:rotate-45"
                  aria-hidden
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
              {/* Answers stay on the body face rather than inheriting Playfair.
                  Left padding lines them up under the trigger's text, not its icon. */}
              <p
                className="pb-5 pl-12 pr-4 text-sm leading-relaxed text-ivory/70 sm:pl-14 sm:pr-10"
                style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
              >
                {a}
              </p>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
