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

  // Sans libellé, UN SEUL trait.
  //
  // Le composant en rendait deux dans tous les cas, séparés par le gap-5 prévu
  // pour encadrer un libellé. Sans libellé, ce gap laissait un blanc de 20px au
  // milieu : le trait de gauche s'arrêtait avant celui de droite, ce qui se lit
  // comme un défaut d'alignement. Le défaut touchait TOUS les séparateurs sans
  // libellé de l'application, pas seulement celui du télé-rendez-vous où
  // Gautier l'a repéré.
  if (!label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn("flex items-center", className)}
      >
        <span aria-hidden className={cn("flex-1", ruleClass)} />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("flex items-center gap-5", className)}
    >
      <span aria-hidden className={cn("flex-1", ruleClass)} />
      <span
        className={cn("font-display text-base italic leading-none", labelColor)}
      >
        {label}
      </span>
      <span aria-hidden className={cn("flex-1", ruleClass)} />
    </div>
  );
}
