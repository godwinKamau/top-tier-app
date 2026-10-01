"use client";

import { useCallback, useId, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type CarouselSlide = {
  id: string;
  /** Short noun that names the screen; doubles as the tab label. */
  tab: string;
  title: string;
  /** Second line of the headline, set in gold italic. */
  titleAccent: string;
  body: string;
  detail: string;
  imageAlt: string;
  image: StaticImageData;
};

type CarouselProps = {
  slides: readonly CarouselSlide[];
  label: string;
  className?: string;
};

/** How far a resting slide sits from the card, in px. */
const SLIDE_OFFSET = 20;

export function Carousel({ slides, label, className }: CarouselProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const count = slides.length;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [{ index, previous, direction }, setPosition] = useState({
    index: 0,
    previous: -1,
    direction: 1,
  });

  const tabId = (i: number) => `${uid}-tab-${slides[i].id}`;
  const panelId = (i: number) => `${uid}-panel-${slides[i].id}`;

  const goTo = useCallback(
    (next: number, dir: number) =>
      setPosition((current) => ({
        index: ((next % count) + count) % count,
        previous: current.index,
        direction: dir,
      })),
    [count],
  );

  // Tabs with automatic activation: the arrow keys move focus and selection
  // together, so the panel always matches the tab the reader is standing on.
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number | undefined> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: count - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;

    event.preventDefault();
    const wrapped = ((next % count) + count) % count;
    goTo(wrapped, wrapped > index ? 1 : -1);
    tabRefs.current[wrapped]?.focus();
  }

  // The outgoing panel leaves against the travel direction; every other
  // resting panel waits on the side the next one should arrive from.
  function restingX(slideIndex: number) {
    if (reduce || slideIndex === index) return 0;
    if (slideIndex === previous) return -direction * SLIDE_OFFSET;
    return direction * SLIDE_OFFSET;
  }

  return (
    <div className={cn("mx-auto w-full max-w-[86rem] px-4 sm:px-6", className)}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="flex flex-wrap border-b border-gold/20"
      >
        {slides.map((slide, i) => {
          const isActive = i === index;

          return (
            <button
              key={slide.id}
              ref={(node) => {
                tabRefs.current[i] = node;
              }}
              type="button"
              role="tab"
              id={tabId(i)}
              aria-selected={isActive}
              aria-controls={panelId(i)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => goTo(i, i > index ? 1 : -1)}
              className={cn(
                "relative px-5 py-4 text-xs font-bold tracking-[0.18em] uppercase transition-colors duration-200 ease-out first:pl-0 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none",
                isActive ? "text-gold" : "text-ivory/50 hover:text-ivory/85",
              )}
            >
              {slide.tab}
              {isActive && (
                <motion.span
                  layoutId={`${uid}-tab-underline`}
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-gold"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", duration: 0.4, bounce: 0 }
                  }
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid lg:mt-14">
        {slides.map((slide, i) => {
          const isActive = i === index;

          return (
            <motion.div
              key={slide.id}
              role="tabpanel"
              id={panelId(i)}
              aria-labelledby={tabId(i)}
              aria-hidden={!isActive}
              inert={!isActive}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0, x: restingX(i) }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      // The outgoing panel clears the stack before the incoming
                      // one fades up, so two headlines never overlap mid-swap.
                      opacity: {
                        duration: 0.18,
                        delay: isActive ? 0.16 : 0,
                        ease: [0.2, 0, 0, 1],
                      },
                      x: {
                        type: "spring",
                        duration: 0.34,
                        bounce: 0,
                        delay: isActive ? 0.16 : 0,
                      },
                    }
              }
              className="grid gap-8 [grid-area:1/1] lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center lg:gap-14"
            >
              <div className="flex flex-col justify-center">
                <h3
                  className="text-[2.125rem] leading-[1.03] font-bold tracking-[-0.02em] text-balance sm:text-[2.625rem] lg:text-[3.125rem]"
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                  }}
                >
                  {slide.title}
                  <span className="block text-gold italic">
                    {slide.titleAccent}
                  </span>
                </h3>
                <p className="mt-6 text-lg leading-relaxed text-pretty text-ivory/85">
                  {slide.body}
                </p>
                <div
                  className="mt-8 h-px w-24 bg-gradient-to-r from-gold to-transparent"
                  aria-hidden
                />
                <p className="mt-8 text-base leading-relaxed text-pretty text-ivory/60">
                  {slide.detail}
                </p>
              </div>

              {/* Stacked, the screen leads: the tab above it already named
                  what it is, so the headline reads as a caption for it.
                  The frame takes its height from the image's own intrinsic
                  ratio rather than an aspect utility — with `fill`, the height
                  lives only in the stylesheet, and an image that decodes before
                  the CSS applies measures zero. */}
              <div className="order-first w-full overflow-hidden rounded-xl bg-navy/50 shadow-[0_2px_4px_rgba(0,0,0,0.4),0_18px_40px_-16px_rgba(0,0,0,0.6),0_44px_80px_-40px_rgba(0,0,0,0.8)] outline-1 -outline-offset-1 outline-[oklch(1_0_0/0.12)] lg:order-none">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  sizes="(min-width: 1536px) 896px, (min-width: 1024px) 60vw, 100vw"
                  placeholder="blur"
                  className="h-auto w-full"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
