import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Boutons « Chat-Pitre » : capitales espacées, ombres dures (presse),
// focus doré. Les variantes principales sont `default` (rouge cramoisi,
// CTA fort), `secondary` (filet doré, alternatif) et `ticket` (coins
// crantés, billet). Les autres restent disponibles pour les besoins
// utilitaires (logout, liens éditoriaux, actions destructives).
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-body text-xs font-semibold uppercase tracking-[0.14em] transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-cp-brass focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:translate-y-px [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Cramoisi plein, ombre dure noire d'encre — la grande CTA.
        default:
          "border border-cp-crimson-dark bg-cp-crimson text-cp-cream shadow-[2px_2px_0_0_var(--color-cp-ink)] hover:bg-cp-crimson-dark hover:shadow-[1px_1px_0_0_var(--color-cp-ink)]",
        // Filet doré sur fond crème — l'option alternative.
        secondary:
          "border-2 border-cp-brass bg-transparent text-cp-ink hover:bg-cp-brass/15",
        // Billet : coins crantés, double bordure, focus en ring-inset
        // (un ring externe serait coupé par le clip-path).
        ticket:
          "cp-ticket-clip border-2 border-cp-ink bg-cp-cream text-cp-ink shadow-[inset_0_0_0_1px_var(--color-cp-cream)] hover:bg-cp-paper focus-visible:ring-inset focus-visible:ring-offset-0",
        // Nuit profonde — contre-poids du cramoisi (CTA secondaire forte).
        midnight:
          "border border-cp-ink bg-cp-midnight text-cp-cream shadow-[2px_2px_0_0_var(--color-cp-ink)] hover:bg-cp-ink",
        // Filet d'encre neutre.
        outline:
          "border-2 border-cp-ink/40 bg-transparent text-cp-ink hover:border-cp-ink hover:bg-cp-ink/5",
        // Sans cadre.
        ghost:
          "text-cp-ink hover:bg-cp-ink/8",
        // Lien éditorial.
        link:
          "tracking-normal normal-case text-cp-crimson underline-offset-4 hover:underline",
        // Action destructive.
        destructive:
          "border border-cp-crimson-dark bg-transparent text-cp-crimson hover:bg-cp-crimson/10",
      },
      size: {
        sm: "h-9 px-4 text-[0.65rem]",
        default: "h-11 px-6",
        lg: "h-13 px-9 text-sm",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
