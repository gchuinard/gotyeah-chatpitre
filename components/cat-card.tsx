import { cn } from "@/lib/utils";
import { LibraryStamp } from "@/components/library-stamp";

/// Carte « fiche de pensionnaire » version brutalist editorial : numéro
/// d'entrée du catalogue, photo placeholder en silhouette trait noir,
/// critères d'admission en ✓/— mono caps. Maquette uniquement (aucune
/// donnée Prisma : toutes les valeurs sont passées en props).

export type CatCardCriteria = {
  sterilized: boolean;
  identified: boolean;
  vaccines: boolean;
  sociable: boolean;
};

export type CatCardProps = {
  /** Numéro de catalogue (« 003 »). Affiché en mono dans l'en-tête. */
  reference?: string;
  name: string;
  photoUrl?: string | null;
  sex?: "MALE" | "FEMALE";
  breed?: string | null;
  ageLabel?: string;
  criteria: CatCardCriteria;
  className?: string;
};

const CRITERIA: { key: keyof CatCardCriteria; label: string }[] = [
  { key: "sterilized", label: "Stérilisé" },
  { key: "identified", label: "Identifié" },
  { key: "vaccines", label: "Vaccins à jour" },
  { key: "sociable", label: "Sociable" },
];

export function CatCard({
  reference,
  name,
  photoUrl,
  sex,
  breed,
  ageLabel,
  criteria,
  className,
}: CatCardProps) {
  const sexLabel = sex === "MALE" ? "♂" : sex === "FEMALE" ? "♀" : null;
  const subtitle = [breed, ageLabel].filter(Boolean).join(" · ");

  return (
    <article
      className={cn(
        "flex flex-col border border-cp-ink bg-cp-paper text-cp-ink",
        className,
      )}
    >
      {/* En-tête type fiche : numéro de catalogue + sexe */}
      <header className="flex items-center justify-between border-b border-cp-ink px-4 py-2.5">
        <LibraryStamp>
          {reference ? `N° ${reference}` : "Pensionnaire"}
        </LibraryStamp>
        {sexLabel && (
          <span
            aria-hidden
            className="font-display text-xl leading-none text-cp-ink"
          >
            {sexLabel}
          </span>
        )}
      </header>

      <PhotoPlaceholder name={name} photoUrl={photoUrl} />

      <div className="flex flex-col gap-3 px-5 py-5">
        <h3 className="font-display text-3xl italic leading-tight text-cp-ink">
          {name}
        </h3>

        {subtitle && (
          <p className="font-body text-sm text-cp-ink-soft">{subtitle}</p>
        )}

        <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-cp-ink/30 pt-3">
          {CRITERIA.map(({ key, label }) => {
            const ok = criteria[key];
            return (
              <li
                key={key}
                className={cn(
                  "flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em]",
                  ok ? "text-cp-ink" : "text-cp-sanguine",
                )}
              >
                <span aria-hidden className="inline-block w-3 text-center">
                  {ok ? "✓" : "—"}
                </span>
                <span
                  className={cn(
                    "leading-none",
                    !ok && "line-through decoration-[1.5px]",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}

function PhotoPlaceholder({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl?: string | null;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={`Portrait de ${name}`}
        className="aspect-square w-full border-b border-cp-ink object-cover"
      />
    );
  }
  return (
    <div className="relative aspect-square w-full overflow-hidden border-b border-cp-ink bg-cp-paper-deep">
      <div className="absolute inset-3 flex flex-col items-center justify-center gap-3 border border-cp-ink/45">
        <CatSilhouette className="size-20 text-cp-ink/55" />
        <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft/90">
          Portrait à venir
        </span>
      </div>
    </div>
  );
}

/// Silhouette de chat trait noir simplifiée — placeholder en attendant
/// les illustrations gravure finales.
function CatSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M14 28 L18 12 L28 22" />
      <path d="M50 28 L46 12 L36 22" />
      <path d="M14 28 C 14 44 22 52 32 52 C 42 52 50 44 50 28" />
      <circle cx="25" cy="32" r="1.6" fill="currentColor" />
      <circle cx="39" cy="32" r="1.6" fill="currentColor" />
      <path d="M32 38 L30 41 L34 41 Z" fill="currentColor" />
      <path d="M32 41 L32 44" />
      <path d="M32 44 C 30 45.5 29 45 28.5 44" />
      <path d="M32 44 C 34 45.5 35 45 35.5 44" />
      <path d="M22 39 L14 38" />
      <path d="M22 41 L14 42" />
      <path d="M42 39 L50 38" />
      <path d="M42 41 L50 42" />
    </svg>
  );
}
