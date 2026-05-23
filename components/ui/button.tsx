import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Boutons « mid-century illustré » : sentence case, weight medium, légère
// rondeur (3px), focus paprika franc. Le default est paprika (l'action
// festive) ; le secondary est cobalt (l'alternative institutionnelle).
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-body font-semibold tracking-[0.01em] outline-none transition-colors select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cp-paprika disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Paprika plein — l'action festive principale.
        default:
          "border border-cp-paprika bg-cp-paprika text-cp-paper hover:bg-cp-paprika-deep hover:border-cp-paprika-deep",
        // Cobalt plein — l'alternative institutionnelle (créer un compte,
        // accéder à un espace, etc.).
        secondary:
          "border border-cp-cobalt bg-cp-cobalt text-cp-paper hover:bg-cp-cobalt-deep hover:border-cp-cobalt-deep",
        // Cadre noir fin — pour barres d'actions secondaires.
        outline:
          "border border-cp-ink/45 bg-transparent text-cp-ink hover:border-cp-ink hover:bg-cp-ink hover:text-cp-paper",
        // Sans cadre — souligne en paprika au survol.
        ghost:
          "text-cp-ink underline-offset-[5px] decoration-[1.5px] hover:underline hover:decoration-cp-paprika hover:text-cp-paprika",
        // Lien éditorial paprika souligné.
        link:
          "tracking-normal font-medium text-cp-paprika underline underline-offset-[5px] decoration-[1.5px] hover:decoration-[2.5px]",
        // Destructive — encre pleine, clairement distincte du paprika.
        destructive:
          "border border-cp-ink bg-cp-ink text-cp-paper hover:bg-cp-ink-soft hover:border-cp-ink-soft",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-11 px-5 text-sm",
        lg: "h-13 px-8 text-base",
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
