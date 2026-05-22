import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 border-2 border-cp-ink/30 bg-cp-cream px-3 py-2 font-body text-base text-cp-ink transition-colors outline-none placeholder:font-body placeholder:text-cp-ink-soft/55 focus-visible:border-cp-crimson focus-visible:ring-2 focus-visible:ring-cp-crimson/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-cp-paper/60 aria-invalid:border-cp-crimson aria-invalid:ring-2 aria-invalid:ring-cp-crimson/25 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-cp-ink md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
