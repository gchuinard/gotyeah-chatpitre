import { cn } from "@/lib/utils";

/// Les quatre exigences d'admission, chacune dans son bloc coloré
/// jewel-tone. Composition Charley Harper : grands blocs aplats avec
/// typo dessus, pas d'illustration (l'aplat de couleur fait le travail).

const CRITERIA: {
  number: string;
  label: string;
  gloss: string;
  bg: string;
  text: string;
}[] = [
  {
    number: "01",
    label: "Stérilisé",
    gloss: "Pour la quiétude de la maison et celle des autres pensionnaires.",
    bg: "bg-cp-cobalt",
    text: "text-cp-paper",
  },
  {
    number: "02",
    label: "Identifié",
    gloss: "Puce ou tatouage à jour, conforme au registre national.",
    bg: "bg-cp-paprika",
    text: "text-cp-paper",
  },
  {
    number: "03",
    label: "Vacciné",
    gloss: "Typhus, coryza et leucose recommandés ; carnet à présenter.",
    bg: "bg-cp-feuille",
    text: "text-cp-paper",
  },
  {
    number: "04",
    label: "Sociable",
    gloss: "Avec ses congénères et les humains de la maison.",
    bg: "bg-cp-canari",
    text: "text-cp-ink",
  },
];

export function AdmissionCriteria({ className }: { className?: string }) {
  return (
    <ol
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {CRITERIA.map((c, i) => (
        <li
          key={c.number}
          className={cn(
            "cp-reveal flex flex-col gap-3 rounded-md border border-cp-ink p-7 sm:p-8",
            c.bg,
            c.text,
          )}
          style={{ "--cp-delay": `${i * 80}ms` } as React.CSSProperties}
        >
          <span
            className={cn(
              "font-mono text-xs font-bold uppercase tracking-[0.18em]",
              c.text === "text-cp-paper" ? "text-cp-paper/85" : "text-cp-ink/75",
            )}
          >
            n° {c.number}
          </span>
          <h3 className="font-display text-3xl font-semibold leading-none tracking-tight sm:text-4xl">
            {c.label}
          </h3>
          <p
            className={cn(
              "font-display text-lg italic leading-snug",
              c.text === "text-cp-paper" ? "text-cp-paper/90" : "text-cp-ink/85",
            )}
          >
            {c.gloss}
          </p>
        </li>
      ))}
    </ol>
  );
}
