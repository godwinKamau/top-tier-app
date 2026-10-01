import { cn } from "@/lib/utils";

type FormattedTextProps = {
  children: string;
  className?: string;
  as?: "span" | "p";
};

/** Renders `**bold**`, `*italic*` and `==highlighted==` markers in shared copy strings. */
export function FormattedText({
  children,
  className,
  as: Tag = "span",
}: FormattedTextProps) {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|==(.+?)==/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(children)) !== null) {
    if (match.index > lastIndex) {
      parts.push(children.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <strong key={key++} className="font-semibold text-inherit">
          {match[1]}
        </strong>
      );
    } else if (match[2]) {
      parts.push(
        <em key={key++} className="italic text-inherit">
          {match[2]}
        </em>
      );
    } else if (match[3]) {
      parts.push(
        <mark
          key={key++}
          // <mark> ships with a UA yellow background and black text; both have
          // to go before the marker swipe below is the only thing showing.
          // box-decoration-break:clone re-draws the swipe on each line so a
          // phrase that wraps gets two strokes rather than one stretched box.
          // Text goes navy inside the swipe. A translucent gold over the dark
          // page desaturates to khaki, so the ink has to be near-opaque to read
          // as gold — and ivory on gold is only ~2.9:1, while navy on gold is
          // 6.4:1, the same pairing as the gold badges elsewhere on the page.
          className="bg-transparent text-navy [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
          style={{
            // A highlighter lays down ink over part of the line, not a full
            // block: the band sits low, stops short of the cap height, and
            // fades at both ends the way a marker does as it lifts.
            backgroundImage: `linear-gradient(to right,
              color-mix(in srgb, var(--color-gold) 0%, transparent) 0%,
              color-mix(in srgb, var(--color-gold) 92%, transparent) 6%,
              color-mix(in srgb, var(--color-gold) 84%, transparent) 50%,
              color-mix(in srgb, var(--color-gold) 92%, transparent) 94%,
              color-mix(in srgb, var(--color-gold) 0%, transparent) 100%)`,
            backgroundSize: "100% 100%",
            backgroundPosition: "0 50%",
            backgroundRepeat: "no-repeat",
            // The background box is the font's full em box, so it already spans
            // ascender to descender; this padding is optical headroom on top of
            // that. Kept at 0.12em so the swipe still fits inside the line box —
            // vertical padding on an inline element overflows rather than
            // growing the line, and a taller band would collide with the swipe
            // on the next line once the copy wraps.
            padding: "0.12em 0.28em",
            margin: "0 -0.16em",
          }}
        >
          {match[3]}
        </mark>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < children.length) {
    parts.push(children.slice(lastIndex));
  }

  return <Tag className={cn(className)}>{parts}</Tag>;
}
