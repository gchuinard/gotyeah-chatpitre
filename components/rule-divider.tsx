import { cn } from "@/lib/utils";

/// Filet de séparation : continu ou avec libellé central. Trois épaisseurs
/// (regular, heavy) et trois tons (ink, cobalt, paprika). Plus chaud que
/// la version brutalist (libellé en sentence case avec italique sur
/// Newsreader plutôt que mono caps).
export function RuleDivider({
  label,
  className,
  weight = "regular",
  tone = "ink",
}: {
  label?: string;
  className?: string;
  weight?: "regular" | "heavy";
  tone?: "ink" | "cobalt" | "paprika" | "canari" | "feuille";
}) {
  const ruleColor = {
    ink: "bg-cp-ink",
    cobalt: "bg-cp-cobalt",
    paprika: "bg-cp-paprika",
    canari: "bg-cp-canari-deep",
    feuille: "bg-cp-feuille",
  }[tone];

  const labelColor = {
    ink: "text-cp-ink-soft",
    cobalt: "text-cp-cobalt",
    paprika: "text-cp-paprika",
    canari: "text-cp-canari-deep",
    feuille: "text-cp-feuille",
  }[tone];

  const ruleClass = cn(
    weight === "heavy" ? "h-[2px]" : "h-px",
    ruleColor,
  );

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("flex items-center gap-5", className)}
    >
      <span aria-hidden className={cn("flex-1", ruleClass)} />
      {label && (
        <span
          className={cn(
            "font-display text-base italic leading-none",
            labelColor,
          )}
        >
          {label}
        </span>
      )}
      <span aria-hidden className={cn("flex-1", ruleClass)} />
    </div>
  );
}
