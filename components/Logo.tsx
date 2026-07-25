import Image from "next/image";
import { cn } from "@/lib/utils";
import { content } from "@/lib/content";

/**
 * TODO: Drop the real logo asset at `public/logo.png` and set
 * `LOGO_AVAILABLE` to `true` so every design picks it up automatically.
 */
const LOGO_AVAILABLE = false;

type LogoProps = {
  className?: string;
  variant?: "light" | "dark" | "auto";
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { img: 36, text: "text-sm" },
  md: { img: 44, text: "text-base" },
  lg: { img: 56, text: "text-lg" },
};

export function Logo({
  className,
  variant = "auto",
  size = "md",
}: LogoProps) {
  const dims = sizeMap[size];
  const textColor =
    variant === "light"
      ? "text-ivory"
      : variant === "dark"
        ? "text-navy"
        : "text-navy";

  if (LOGO_AVAILABLE) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <Image
          src="/logo.png"
          alt={`${content.brand.name} logo — gold T in a shield with laurel wreaths`}
          width={dims.img}
          height={dims.img}
          className="h-auto w-auto"
          priority
        />
        <span
          className={cn(
            "font-semibold tracking-tight leading-tight",
            dims.text,
            textColor
          )}
        >
          {content.brand.name}
        </span>
      </span>
    );
  }

  // Text-lockup placeholder until logo.png is provided
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        className
      )}
      aria-label={content.brand.name}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md border-2 border-gold bg-navy font-serif font-bold text-gold shadow-sm",
          size === "sm" && "size-9 text-lg",
          size === "md" && "size-11 text-xl",
          size === "lg" && "size-14 text-2xl"
        )}
        aria-hidden
      >
        T
      </span>
      <span className={cn("leading-tight", textColor)}>
        <span
          className={cn(
            "block font-semibold tracking-tight",
            dims.text
          )}
        >
          Top-Tier Scholar
        </span>
        <span className="block text-[0.65em] font-medium uppercase tracking-[0.18em] text-gold">
          Systems
        </span>
      </span>
    </span>
  );
}
