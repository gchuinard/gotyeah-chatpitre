import { cn } from "@/lib/utils";

/// Carte tarifaire — montant énorme Newsreader, fond paper ou cobalt
/// (variant "feature" pour la formule recommandée). Notes en colonne
/// pour la lisibilité.

export type PriceCardProps = {
  reference: string;
  title: string;
  amount: string;
  unit: string;
  notes?: string[];
  variant?: "regular" | "feature";
  className?: string;
};

export function PriceCard({
  reference,
  title,
  amount,
  unit,
  notes,
  variant = "regular",
  className,
}: PriceCardProps) {
  const isFeature = variant === "feature";
  return (
    <article
      className={cn(
        "flex flex-col gap-6 rounded-md border border-cp-ink p-8 sm:p-10",
        isFeature ? "bg-cp-cobalt text-cp-paper" : "bg-cp-paper text-cp-ink",
        className,
      )}
    >
      <header>
        <span
          className={cn(
            "font-mono text-xs font-bold uppercase tracking-[0.18em]",
            isFeature ? "text-cp-paper/80" : "text-cp-paprika",
          )}
        >
          Tarif {reference}
        </span>
      </header>

      <h3
        className={cn(
          "font-display text-2xl font-semibold leading-tight sm:text-3xl",
          isFeature ? "text-cp-paper" : "text-cp-ink",
        )}
      >
        {title}
      </h3>

      <p className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-display text-7xl font-semibold leading-none tracking-tight sm:text-8xl",
            isFeature ? "text-cp-paper" : "text-cp-ink",
          )}
        >
          {amount}
        </span>
        <span
          className={cn(
            "font-mono text-sm font-semibold uppercase tracking-[0.14em]",
            isFeature ? "text-cp-paper/80" : "text-cp-ink-soft",
          )}
        >
          / {unit}
        </span>
      </p>

      {notes && notes.length > 0 && (
        <ul
          className={cn(
            "space-y-2 border-t pt-5 font-body text-sm leading-relaxed",
            isFeature
              ? "border-cp-paper/30 text-cp-paper/90"
              : "border-cp-ink/20 text-cp-ink",
          )}
        >
          {notes.map((n) => (
            <li key={n} className="flex gap-2">
              <span aria-hidden className="select-none">
                —
              </span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
