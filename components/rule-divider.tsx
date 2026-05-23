import { cn } from "@/lib/utils";

/// Filet horizontal brutaliste — remplace l'ornement Belle Époque.
/// Variante simple (filet continu) ou avec libellé centré en mono caps
/// (le filet se coupe pour laisser place au texte). Trait sur l'encre,
/// pas sur le doré : c'est la fiche, pas le programme.
export function RuleDivider({
  label,
  className,
  weight = "regular",
}: {
  label?: string;
  className?: string;
  weight?: "regular" | "heavy";
}) {
  const ruleClass =
    weight === "heavy" ? "h-[2px] bg-cp-ink" : "h-px bg-cp-ink";

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn("flex items-center gap-5", className)}
    >
      <span aria-hidden className={cn("flex-1", ruleClass)} />
      {label && (
        <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.28em] text-cp-ink-soft">
          {label}
        </span>
      )}
      <span aria-hidden className={cn("flex-1", ruleClass)} />
    </div>
  );
}
