import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Boutons brutalist editorial : rectangles plats, capitales serrées, zéro
// radius, transition d'inversion encre/papier au survol. La variante par
// défaut est noire pleine (CTA institutionnelle) ; la sanguine est réservée
// aux actions destructives ou aux alertes (refus de séjour, suppression).
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-body font-medium uppercase tracking-[0.16em] outline-none transition-colors select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cp-sanguine disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Encre pleine — CTA principale, sans ornement.
        default:
          "border border-cp-ink bg-cp-ink text-cp-paper hover:bg-cp-sanguine hover:border-cp-sanguine",
        // Cadre encre, fond bone — alternative neutre, inversion au survol.
        secondary:
          "border border-cp-ink bg-cp-paper text-cp-ink hover:bg-cp-ink hover:text-cp-paper",
        // Cadre seul, plus fin — pour barres d'actions secondaires.
        outline:
          "border border-cp-ink/55 bg-transparent text-cp-ink hover:border-cp-ink hover:bg-cp-ink hover:text-cp-paper",
        // Sans cadre, juste du texte. Souligne au survol.
        ghost:
          "text-cp-ink underline-offset-[6px] decoration-[1.5px] hover:underline hover:decoration-cp-sanguine hover:text-cp-sanguine",
        // Lien éditorial sanguine souligné.
        link:
          "normal-case tracking-normal font-normal text-cp-sanguine underline underline-offset-[5px] decoration-[1.5px] hover:decoration-[2.5px]",
        // Action destructive — sanguine.
        destructive:
          "border border-cp-sanguine bg-cp-sanguine text-cp-paper hover:bg-cp-sanguine-deep hover:border-cp-sanguine-deep",
      },
      size: {
        sm: "h-8 px-3 text-[0.65rem]",
        default: "h-11 px-6 text-[0.72rem]",
        lg: "h-13 px-9 text-[0.8rem]",
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
