import * as React from "react"

import { cn } from "@/lib/utils"

// Libellé « entrée de catalogue » : mono caps espacées, encre douce.
// Composant sans hooks → server-compatible.
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-cp-ink select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
