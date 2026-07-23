import {
  CatIllustration,
  pickCatIllustration,
  type CatIllustrationPose,
  type CatIllustrationVariant,
} from "@/components/cat-illustration";
import { LibraryStamp } from "@/components/library-stamp";
import { cn } from "@/lib/utils";

/// Carte « fiche de pensionnaire » version mid-century illustré : numéro
/// d'entrée + illustration Charley Harper de couleur unique par chat,
/// nom Newsreader italic, critères d'admission en ✓/—. Maquette (aucune
/// donnée Prisma — toutes les valeurs viennent des props).

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
  /** Chat disparu : la carte porte un bandeau sobre et se met en retrait. */
  passedAway?: boolean;
  /** Surcharge optionnelle — sinon l'illustration est dérivée du nom. */
  illustration?: { variant: CatIllustrationVariant; pose: CatIllustrationPose };
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
  passedAway = false,
  illustration,
  className,
}: CatCardProps) {
  const sexLabel = sex === "MALE" ? "♂" : sex === "FEMALE" ? "♀" : null;
  const subtitle = [breed, ageLabel].filter(Boolean).join(" · ");
  const picked = illustration ?? pickCatIllustration(name);

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-md border border-cp-ink bg-cp-paper text-cp-ink",
        className,
      )}
    >
      {/* Bandeau sobre, en encre et non en couleur d'accent : ni festif, ni
          alarmant. Il dit ce qu'il a à dire et se tait. */}
      {passedAway && (
        <p className="border-b border-cp-ink bg-cp-ink px-4 py-1.5 text-center font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-paper">
          En souvenir
        </p>
      )}
      {/* En-tête type fiche — numéro et sexe */}
      <header className="flex items-center justify-between border-b border-cp-ink px-4 py-2.5">
        <LibraryStamp tone="cobalt">
          {reference ? `Pensionnaire n° ${reference}` : "Pensionnaire"}
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

      {/* Portrait — illustration Charley Harper sauf si photoUrl */}
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={`Portrait de ${name}`}
          className="aspect-square w-full border-b border-cp-ink object-cover"
        />
      ) : (
        <div className="border-b border-cp-ink">
          <CatIllustration
            variant={picked.variant}
            pose={picked.pose}
            ariaLabel={`Illustration de ${name}`}
            className="aspect-square w-full"
          />
        </div>
      )}

      {/* Contenu */}
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
                  "flex items-center gap-2 font-body text-sm",
                  ok ? "text-cp-feuille" : "text-cp-paprika",
                )}
              >
                <span aria-hidden className="inline-block w-3 text-center font-bold">
                  {ok ? "✓" : "✕"}
                </span>
                <span className={cn("leading-none", !ok && "line-through decoration-[1.5px]")}>
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
