"use client";

import { useState } from "react";
import { Accordion } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";

type TopTierSolutionsProps = {
  items: readonly { q: string; a: string }[];
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
      {items.map(({ q, a }) => (
        <Accordion.Item
          key={q}
          value={q}
          className="border-b border-gold/15"
          onMouseEnter={() => setOpen([q])}
        >
          <Accordion.Header>
            {/* No font-family here on purpose — the header inherits the
                section's Playfair. Size and weight stay local. */}
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 py-5 text-left text-xl font-semibold text-ivory transition hover:text-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              {q}
              <Plus
                className="size-4 shrink-0 text-gold transition-transform duration-200 group-data-panel-open:rotate-45"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
            {/* Answers stay on the body face rather than inheriting Playfair. */}
            <p
              className="pb-5 pr-10 text-sm leading-relaxed text-ivory/70"
              style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}
            >
              {a}
            </p>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
