import {
  CatIllustration,
  pickCatIllustration,
} from "@/components/cat-illustration";
import { LibraryStamp } from "@/components/library-stamp";
import { cn } from "@/lib/utils";
import { getCurrentResidents } from "@/lib/fixtures";

/// « En séjour cette semaine » — mur des pensionnaires actuellement dans
/// la maison. Pour chaque chat : illustration géométrique tirée du nom,
/// nom Newsreader italique, propriétaire (prénom seulement, vie privée),
/// dates du séjour. Filtre : bookings ACCEPTED dont la plage chevauche
/// aujourd'hui. Données venant de `getCurrentResidents()`.

export function CurrentResidentsWall({
  variant = "full",
  className,
}: {
  /**
   * `full` — sur /le-lieu : titre + intro + grille.
   * `compact` — sur /admin : titre court + grille compacte.
   */
  variant?: "full" | "compact";
  className?: string;
}) {
  const residents = getCurrentResidents();

  if (residents.length === 0) {
    return (
      <div
        className={cn(
          "rounded-md border border-cp-ink/40 bg-cp-paper-deep/60 p-8 text-center",
          className,
        )}
      >
        <LibraryStamp tone="cobalt">en séjour cette semaine</LibraryStamp>
        <p className="mt-4 font-display text-xl italic text-cp-ink-soft">
          Personne en ce moment. La maison est en sommeil.
        </p>
      </div>
    );
  }

  const isCompact = variant === "compact";

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <LibraryStamp tone="cobalt">
            En séjour cette semaine — {residents.length} pensionnaire{residents.length > 1 ? "s" : ""}
          </LibraryStamp>
          {!isCompact && (
            <p className="mt-4 max-w-2xl font-display text-2xl italic leading-snug text-cp-ink-soft sm:text-3xl">
              La maison vit. Voici qui dort, mange et joue ici en ce moment.
            </p>
          )}
        </div>
      </div>

      <ul
        className={cn(
          "grid gap-4",
          isCompact
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        )}
      >
        {residents.map(({ cat, booking, owner }) => {
          const picked = pickCatIllustration(cat.name);
          return (
            <li
              key={cat.id}
              className="overflow-hidden rounded-md border border-cp-ink bg-cp-paper"
            >
              <CatIllustration
                variant={picked.variant}
                pose={picked.pose}
                ariaLabel={`Illustration de ${cat.name}`}
                className="aspect-square w-full"
              />
              <div className="flex flex-col gap-1 px-3 py-2.5">
                <p className="font-display text-lg italic leading-tight text-cp-ink">
                  {cat.name}
                </p>
                {!isCompact && (
                  <p className="font-body text-xs text-cp-ink-soft">
                    {cat.breed} · {cat.ageLabel}
                  </p>
                )}
                <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-cp-paprika">
                  Jusqu&apos;au {booking.endDate}
                </p>
                {owner && !isCompact && (
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-cp-ink-soft">
                    chez {owner.firstName}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
