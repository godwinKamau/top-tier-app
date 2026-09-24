"use client";

import { useCallback, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type CarouselSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  imageAlt: string;
  image: StaticImageData;
};

type CarouselProps = {
  slides: readonly CarouselSlide[];
  label: string;
  className?: string;
};

/** How far an off-screen slide sits from the card, in px. */
const SLIDE_OFFSET = 24;

export function Carousel({ slides, label, className }: CarouselProps) {
  const reduce = useReducedMotion();
  const count = slides.length;
  const [{ index, previous, direction }, setPosition] = useState({
    index: 0,
    previous: -1,
    direction: 1,
  });

  const goTo = useCallback(
    (next: number, dir: number) =>
      setPosition((current) => ({
        index: ((next % count) + count) % count,
        previous: current.index,
        direction: dir,
      })),
    [count],
  );

  const goPrev = useCallback(() => goTo(index - 1, -1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    }
  }

  // The outgoing slide leaves against the travel direction; every other
  // inactive slide waits on the side the next one should arrive from.
  function restingX(slideIndex: number) {
    if (reduce || slideIndex === index) return 0;
    if (slideIndex === previous) return -direction * SLIDE_OFFSET;
    return direction * SLIDE_OFFSET;
  }

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        "mx-auto grid max-w-6xl grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-5 px-4 sm:gap-x-5 sm:px-6",
        className,
      )}
    >
      <ArrowButton
        direction="prev"
        onClick={goPrev}
        className="col-start-1 row-start-2 lg:row-start-1"
      />

      <div className="col-span-3 row-start-1 grid rounded-2xl bg-navy/60 p-2 shadow-[0_1px_2px_rgba(0,0,0,0.35),0_10px_24px_-10px_rgba(0,0,0,0.55),0_28px_56px_-28px_rgba(0,0,0,0.65)] lg:col-span-1 lg:col-start-2">
        {slides.map((slide, i) => {
          const isActive = i === index;
          const imageFirst = i % 2 === 0;

          return (
            <motion.div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!isActive}
              inert={!isActive}
              initial={false}
              animate={{ opacity: isActive ? 1 : 0, x: restingX(i) }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      // Sides alternate, so the outgoing slide must clear the
                      // card before the incoming one fades in — otherwise the
                      // next slide's text sits on top of the current photo.
                      opacity: {
                        duration: 0.16,
                        delay: isActive ? 0.16 : 0,
                        ease: [0.2, 0, 0, 1],
                      },
                      x: {
                        type: "spring",
                        duration: 0.3,
                        bounce: 0,
                        delay: isActive ? 0.16 : 0,
                      },
                    }
              }
              className={cn(
                "grid gap-5 [grid-area:1/1] sm:gap-7 lg:items-center lg:gap-8",
                // The picture keeps 65% of the row whichever side it lands on.
                imageFirst
                  ? "lg:grid-cols-[65fr_35fr]"
                  : "lg:grid-cols-[35fr_65fr]",
              )}
            >
              <div
                className={cn(
                  "relative aspect-3/2 w-full overflow-hidden rounded-lg bg-navy/30 outline-1 -outline-offset-1 outline-[oklch(1_0_0/0.1)]",
                  imageFirst ? "lg:order-1" : "lg:order-2",
                )}
              >
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  sizes="(min-width: 1152px) 608px, (min-width: 1024px) 58vw, 100vw"
                  placeholder="blur"
                  className="object-contain"
                />
              </div>

              <div
                className={cn(
                  "flex flex-col justify-center px-2 pb-3 lg:px-6 lg:pb-0",
                  imageFirst ? "lg:order-2" : "lg:order-1",
                )}
              >
                <p className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
                  {slide.eyebrow}
                </p>
                <h3
                  className="mt-3 text-2xl font-bold text-balance sm:text-3xl"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {slide.title}
                </h3>
                <p className="mt-4 text-pretty text-ivory/80">{slide.body}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="col-start-2 row-start-2 flex items-center justify-center">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goTo(i, i > index ? 1 : -1)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
            className="group inline-flex size-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <span
              className={cn(
                "h-1.5 rounded-full transition-[width,background-color] duration-200 ease-out",
                i === index
                  ? "w-6 bg-gold"
                  : "w-1.5 bg-ivory/30 group-hover:bg-ivory/60",
              )}
            />
          </button>
        ))}
      </div>

      <ArrowButton
        direction="next"
        onClick={goNext}
        className="col-start-3 row-start-2 lg:row-start-1"
      />

      <p aria-live="polite" className="sr-only">
        {`Slide ${index + 1} of ${count}: ${slides[index].title}`}
      </p>
    </div>
  );
}

function ArrowButton({
  direction,
  onClick,
  className,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  className?: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-navy/60 text-gold transition-[background-color,color,border-color,scale] duration-200 ease-out hover:border-gold hover:bg-gold hover:text-navy active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none",
        className,
      )}
    >
      {/* Chevrons read off-centre in a circle; nudge them back optically. */}
      <Icon
        aria-hidden
        strokeWidth={2}
        className={cn("size-5", direction === "prev" ? "-translate-x-px" : "translate-x-px")}
      />
    </button>
  );
}
