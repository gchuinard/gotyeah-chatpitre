import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

// Champ « mid-century » : trait fin noir, fond paper, focus paprika
// extérieur. Léger radius pour ergonomie sans tomber dans la mollesse.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-cp-ink bg-cp-paper px-3 py-2 font-body text-base text-cp-ink transition-colors outline-none placeholder:font-body placeholder:italic placeholder:text-cp-mute focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-paprika disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-cp-paper-deep/60 aria-invalid:border-cp-paprika aria-invalid:outline aria-invalid:outline-2 aria-invalid:outline-offset-[3px] aria-invalid:outline-cp-paprika file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-cp-ink md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
