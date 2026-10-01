import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/FadeIn";

type PricingTiersProps = {
  tiers: readonly {
    id: string;
    name: string;
    priceLabel: string | null;
    price: string;
    priceSuffix: string | null;
    priceA11y: string | null;
    description: string;
    cta: string;
    featured: boolean;
  }[];
  badge: string;
  className?: string;
};

const serif = { fontFamily: "var(--font-playfair), Georgia, serif" };

export function PricingTiers({ tiers, badge, className }: PricingTiersProps) {
  return (
    // pt-4 reserves room for the featured card's badge, which hangs above the
    // card's own border box.
    <ul className={`grid gap-4 pt-4 md:grid-cols-3 ${className ?? ""}`}>
      {tiers.map((tier, i) => (
        <FadeIn key={tier.id} as="li" delay={i * 0.08} y={16} className="h-full">
          <article
            className={
              "relative flex h-full flex-col bg-white p-5 sm:p-6 " +
              (tier.featured
                ? "border-2 border-gold shadow-[0_18px_40px_-18px_rgba(201,162,39,0.55)] transition-shadow duration-300 ease-out hover:shadow-[0_26px_54px_-20px_rgba(201,162,39,0.7)]"
                : "border border-gold/25 transition-colors duration-300 ease-out hover:border-gold/60")
            }
          >
            {tier.featured && (
              <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold px-3 py-1 text-[10px] font-bold tracking-[0.22em] text-navy uppercase">
                {badge}
              </p>
            )}

            <h3
              className="text-lg leading-snug font-bold text-balance text-navy sm:text-xl md:min-h-[2lh]"
              style={serif}
            >
              {tier.name}
            </h3>

            <div className="mt-4">
              {/* Once the tiers sit side by side the empty label line is what
                  puts all three price figures on one baseline. Stacked, it is
                  just a hole, so it only exists from md up. */}
              {tier.priceLabel ? (
                <p className="text-xs font-semibold tracking-[0.18em] text-navy/70 uppercase">
                  {tier.priceLabel}
                </p>
              ) : (
                <p className="hidden text-xs tracking-[0.18em] uppercase md:block" aria-hidden>
                  &nbsp;
                </p>
              )}

              <p
                className={
                  "text-balance " +
                  (tier.priceSuffix
                    ? "text-2xl font-bold text-navy tabular-nums sm:text-3xl"
                    : "text-xl font-bold text-navy/80")
                }
                style={serif}
              >
                {/* "$499" + "/month" would be announced as "499 slash month". */}
                <span className="sr-only">{tier.priceA11y ?? tier.price}</span>
                <span aria-hidden>
                  {tier.price}
                  {tier.priceSuffix && (
                    <span className="text-sm font-medium text-navy/60">
                      {tier.priceSuffix}
                    </span>
                  )}
                </span>
              </p>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-pretty text-navy/70">
              {tier.description}
            </p>

            {/* mt-auto on the wrapper pins the button to the card floor, so the
                three CTAs align however unevenly the descriptions wrap. */}
            <div className="mt-auto pt-6">
              <a
                href="#apply"
                aria-label={`${tier.cta} — ${tier.name}`}
                className={
                  "group/cta inline-flex h-11 w-full items-center justify-center gap-2 text-sm font-bold transition-[filter,background-color,border-color,color,scale] duration-200 ease-out active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none " +
                  (tier.featured
                    ? "border border-gold bg-gradient-to-r from-gold to-gold-light text-navy hover:brightness-110"
                    : "border border-navy/25 text-navy hover:border-navy hover:bg-navy hover:text-ivory")
                }
              >
                {tier.cta}
                <ArrowRight
                  className="size-4 transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </div>
          </article>
        </FadeIn>
      ))}
    </ul>
  );
}
