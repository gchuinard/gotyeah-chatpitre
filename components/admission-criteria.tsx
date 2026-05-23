import { cn } from "@/lib/utils";

/// Les quatre exigences d'admission, mises en grande typographie comme
/// dans une affiche d'établissement : un numéro, un titre, une glose.
/// Composition fiche catalogue — chaque critère porte son propre cadre.

const CRITERIA: { number: string; label: string; gloss: string }[] = [
  {
    number: "01",
    label: "Stérilisé",
    gloss: "Pour la quiétude de la maison et celle des autres pensionnaires.",
  },
  {
    number: "02",
    label: "Identifié",
    gloss: "Puce ou tatouage à jour, conforme au registre national.",
  },
  {
    number: "03",
    label: "Vacciné",
    gloss: "Typhus, coryza et leucose recommandés ; carnet à présenter.",
  },
  {
    number: "04",
    label: "Sociable",
    gloss: "Avec ses congénères et les humains de la maison.",
  },
];

export function AdmissionCriteria({ className }: { className?: string }) {
  return (
    <ol
      className={cn(
        "grid grid-cols-1 gap-px overflow-hidden border border-cp-ink bg-cp-ink sm:grid-cols-2",
        className,
      )}
    >
      {CRITERIA.map((c, i) => (
        <li
          key={c.number}
          className="cp-reveal flex flex-col gap-3 bg-cp-paper p-8 sm:p-10"
          style={{ "--cp-delay": `${i * 80}ms` } as React.CSSProperties}
        >
          <span className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cp-sanguine">
            {c.number} — exigence
          </span>
          <h3 className="font-display text-4xl font-bold uppercase leading-none tracking-[0.02em] text-cp-ink sm:text-5xl">
            {c.label}
          </h3>
          <p className="font-display text-lg italic leading-snug text-cp-ink-soft">
            {c.gloss}
          </p>
        </li>
      ))}
    </ol>
  );
}
