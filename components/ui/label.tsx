import * as React from "react"

import { cn } from "@/lib/utils"

// Libellé de formulaire — Manrope bold, taille confortable, pas de caps
// agressives. Composant sans hooks → server-compatible.
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 font-body text-sm font-semibold leading-snug text-cp-ink select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
