import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

// Champ « fiche bibliothèque » : trait noir 1.5px, fond bone, focus en
// outline sanguine extérieure. Pas de radius, pas d'ombre.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 border border-cp-ink bg-cp-paper px-3 py-2 font-body text-base text-cp-ink transition-colors outline-none placeholder:font-body placeholder:italic placeholder:text-cp-mute focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-sanguine disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-cp-paper-deep/60 aria-invalid:border-cp-sanguine aria-invalid:outline aria-invalid:outline-2 aria-invalid:outline-offset-[3px] aria-invalid:outline-cp-sanguine file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-cp-ink md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
