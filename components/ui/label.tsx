import * as React from "react"

import { cn } from "@/lib/utils"

// Petites capitales espacées en sépia foncé — ton « libellé d'affiche ».
// Composant sans hooks → server-compatible.
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-[0.12em] text-cp-ink-soft select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
