import { LibraryStamp } from "@/components/library-stamp";
import { cn } from "@/lib/utils";

/// Carte tarifaire principale : un montant énorme en Bodoni Moda, un
/// libellé mono, un détail. Variante outline (par défaut) ou inverse
/// (encre pleine) pour les formules en avant. Maquette statique : les
/// montants viendront plus tard du modèle `Setting`.

export type PriceCardProps = {
  /** Numéro d'entrée du tarif dans le catalogue (« A », « B », « 01 »). */
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
        "flex flex-col gap-6 border border-cp-ink p-8 sm:p-10",
        isFeature ? "bg-cp-ink text-cp-paper" : "bg-cp-paper text-cp-ink",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "font-mono text-xs font-bold uppercase tracking-[0.22em]",
            isFeature ? "text-cp-paper/70" : "text-cp-sanguine",
          )}
        >
          Tarif {reference}
        </span>
        {isFeature && (
          <LibraryStamp
            className={cn(
              "border border-cp-paper/50 px-2.5 py-1 text-cp-paper/85",
            )}
          >
            Formule recommandée
          </LibraryStamp>
        )}
      </header>

      <h3
        className={cn(
          "font-display text-2xl font-medium leading-tight sm:text-3xl",
          isFeature ? "text-cp-paper" : "text-cp-ink",
        )}
      >
        {title}
      </h3>

      <p className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-display text-7xl font-bold leading-none tracking-tight sm:text-8xl",
            isFeature ? "text-cp-paper" : "text-cp-ink",
          )}
        >
          {amount}
        </span>
        <span
          className={cn(
            "font-mono text-xs font-bold uppercase tracking-[0.18em]",
            isFeature ? "text-cp-paper/70" : "text-cp-ink-soft",
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
              ? "border-cp-paper/30 text-cp-paper/85"
              : "border-cp-ink/20 text-cp-ink-soft",
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
