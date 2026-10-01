import Image from "next/image";
import { cn } from "@/lib/utils";
import { content } from "@/lib/content";

type LogoProps = {
  className?: string;
  /**
   * `light` renders the mark in light ink for dark surfaces; `dark`/`auto`
   * keeps the artwork as-is for light surfaces.
   */
  variant?: "light" | "dark" | "auto";
  size?: "sm" | "md" | "lg";
};

// Intrinsic dimensions of public/logo.png — the artwork already contains the
// "Top-Tier Scholar Systems" wordmark, so the component renders no text.
const LOGO_WIDTH = 512;
const LOGO_HEIGHT = 156;

const sizeMap = {
  sm: "h-9",
  md: "h-11",
  lg: "h-14",
};

export function Logo({ className, variant = "auto", size = "md" }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={`${content.brand.name} logo`}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      loading="eager"
      className={cn(
        "w-auto",
        sizeMap[size],
        variant === "light" && "brightness-0 invert",
        className
      )}
    />
  );
}
