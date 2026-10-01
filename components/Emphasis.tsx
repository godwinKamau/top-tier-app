import { cn } from "@/lib/utils";

/**
 * The two places this block is used want the same voice at very different
 * weights, so each scale carries every measurement that has to move together:
 * the two type steps, the swash thickness, the measure, and the frame. Tuning
 * one of them alone is what makes a handwriting block fall apart.
 *
 * `display` owns a viewport — the hero, where it is the loudest thing on the
 * page. `aside` sits in a column beside body copy and is sized to read as a
 * peer of the heading cluster next to it rather than as a second hero.
 *
 * On the measure: Caveat's `0` is extremely narrow, so a `ch` measure resolves
 * to roughly half the width the same number reads as in the body face — a
 * 22ch measure here is 158px, which shreds a sentence into nine lines. Both
 * scales set the measure in rem for that reason. Keep it in rem when
 * overriding; two lines per phrase is the shape this block is built around.
 *
 * On the frame: the block is rotated, so the padding is also the clearance the
 * corners need to swing into. At `aside`'s measure a -10deg tilt throws the
 * corners about 27px past the layout box, which is what `py-8` is covering.
 */
const SCALES = {
  display: {
    lead: "text-3xl sm:text-4xl lg:text-5xl",
    accent: "text-4xl sm:text-5xl lg:text-6xl",
    swash: "-bottom-3 h-3 sm:-bottom-4 sm:h-4",
    measure: "max-w-2xl",
    frame: "px-6 py-16 sm:py-20",
  },
  aside: {
    lead: "text-xl sm:text-2xl",
    accent: "text-2xl sm:text-3xl",
    // The stroke tracks the type size, or it reads as a rule rather than a pen
    // mark once the text comes down this far.
    swash: "-bottom-2 h-2 sm:-bottom-2.5 sm:h-2.5",
    measure: "max-w-xs",
    frame: "px-0 py-8",
  },
} as const;

type EmphasisProps = {
  /** The opening line — set in the handwriting face, unaccented. */
  children: React.ReactNode;
  /** The payoff line. Runs larger and picks up the gold swash underneath. */
  accent?: React.ReactNode;
  /**
   * Which surface this sits on. `dark` for the navy page and photo blocks,
   * `light` for the cream sections — gold text fails contrast on cream, so
   * the light tone keeps both lines navy and lets the swash carry the accent.
   */
  tone?: "dark" | "light";
  /**
   * How much room the block is entitled to. `display` for a block that owns a
   * viewport, `aside` for one sitting in a column next to body copy. See
   * `SCALES` — this picks type, swash, measure and frame as a set.
   */
  scale?: keyof typeof SCALES;
  /** Degrees of tilt. The accent line takes a little less so the two lines
   *  don't read as one rigid block. */
  tilt?: number;
  /** Set false to drop the hand-drawn underline. */
  swash?: boolean;
  /**
   * Shadow color — any CSS color. Defaults to the tone's own surface color,
   * which behaves as legibility insurance: it stays invisible until the
   * backdrop is brighter than it, then separates the glyphs. Over a dark photo
   * that default has nothing to contrast against, so pass a color that opposes
   * what is actually behind the block to make the shadow read as a glow —
   * `"rgb(250 246 238 / 0.55)"` gives an ivory halo on a dark backdrop.
   */
  shade?: string;
  /** Outer block — padding, height, placement. */
  className?: string;
  /** The text block itself. Mainly for measure: a narrower `max-w-*` wraps the
   *  lines the way a pull quote does. */
  contentClassName?: string;
};

export function Emphasis({
  children,
  accent,
  tone = "dark",
  scale = "display",
  tilt = -4,
  swash = true,
  shade,
  className,
  contentClassName,
}: EmphasisProps) {
  const dark = tone === "dark";
  const step = SCALES[scale];
  // No backdrop at all — legibility comes from a shadow carried by the glyphs
  // themselves, tinted to the surface the block sits on rather than pure black.
  const shadeColor = shade ?? (dark ? "var(--color-navy)" : "#F7FAF0");
  // Three layers doing different jobs: a tight offset that separates the glyph
  // from whatever is directly under it, a mid blur that reads as depth, and a
  // wide low-alpha bloom that works the area immediately around the text.
  const shadow = [
    `0 1px 2px color-mix(in srgb, ${shadeColor} 92%, transparent)`,
    `0 2px 10px color-mix(in srgb, ${shadeColor} 80%, transparent)`,
    `0 0 26px color-mix(in srgb, ${shadeColor} 62%, transparent)`,
  ].join(", ");

  return (
    <div
      className={cn(
        "relative flex",
        step.frame,
        className,
      )}
    >
      <div
        className={cn("text-center", step.measure, contentClassName)}
        style={{
          transform: `rotate(${tilt}deg)`,
          fontFamily: "var(--font-caveat), ui-rounded, cursive",
          // Set once here so both lines inherit it.
          textShadow: shadow,
        }}
      >
        <p
          className={cn(
            "leading-tight text-balance",
            step.lead,
            dark ? "text-ivory" : "text-navy",
          )}
        >
          {children}
        </p>

        {accent && (
          <p
            className={cn(
              // inline-block so the box hugs the words — the swash below is
              // sized off this box, and a full-width box would leave the stroke
              // hanging out past the text on both sides.
              "relative mt-3 inline-block leading-tight text-balance",
              step.accent,
              dark ? "text-gold-light" : "text-navy",
            )}
            style={{ transform: `rotate(${(tilt * -0.4).toFixed(2)}deg)` }}
          >
            {accent}
            {swash && (
              <svg
                aria-hidden
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                fill="none"
                className={cn(
                  "absolute -left-[4%] w-[108%] text-gold",
                  step.swash,
                )}
                // text-shadow doesn't reach an SVG stroke, so the swash gets the
                // equivalent as a filter or it floats unsupported over a photo.
                style={{
                  filter: `drop-shadow(0 1px 2px color-mix(in srgb, ${shadeColor} 92%, transparent)) drop-shadow(0 2px 8px color-mix(in srgb, ${shadeColor} 70%, transparent))`,
                }}
              >
                {/* One uneven stroke with a rising tail — a ruler-straight
                    line next to handwriting reads as a mistake. */}
                <path
                  d="M3 10.5C58 5.2 121 2.8 186 3.4c39 .4 73 1.9 111 4.6"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
