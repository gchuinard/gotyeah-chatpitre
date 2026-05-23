import * as React from "react"

import { cn } from "@/lib/utils"

// Textarea « mid-century » : trait noir fin, focus paprika, léger radius.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-28 w-full rounded-md border border-cp-ink bg-cp-paper px-3 py-2.5 font-body text-base leading-relaxed text-cp-ink transition-colors outline-none placeholder:font-body placeholder:italic placeholder:text-cp-mute focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-paprika disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-cp-paper-deep/60 aria-invalid:border-cp-paprika aria-invalid:outline aria-invalid:outline-2 aria-invalid:outline-offset-[3px] aria-invalid:outline-cp-paprika md:text-sm",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
