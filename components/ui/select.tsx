import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * A native <select> rather than a JS-driven listbox: it gets the OS picker on
 * touch devices, needs no extra client bundle, and `required` on an empty value
 * is enforced by the browser. Class contract mirrors ui/input.tsx so a select
 * and an input sitting side by side in a grid row line up optically.
 *
 * The caller supplies the placeholder as a disabled empty option and sets
 * `defaultValue=""`.
 */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-8 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent py-1 pl-2.5 pr-8 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
          // An unanswered select reads as placeholder text, not as an answer.
          "[&:has(option[value='']:checked)]:text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 opacity-60"
        aria-hidden
      />
    </div>
  )
}

export { Select }
