import { PHOTO_RETENTION_DAYS } from "@/lib/cat-photos";

/// Galerie des photos d'un chat, côté propriétaire.
///
/// Le délai restant est affiché sur CHAQUE photo, et pas seulement en tête de
/// page : le propriétaire doit savoir, au moment où il la regarde, qu'il lui
/// reste peu de temps pour l'enregistrer s'il veut la garder.

export type GalleryPhoto = {
  id: string;
  /// Nombre de jours avant effacement, calculé côté serveur.
  daysLeft: number;
  catName: string;
};

export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  if (photos.length === 0) {
    return (
      <p className="border border-cp-ink/30 bg-cp-paper-deep/40 p-8 text-center font-display text-xl italic text-cp-ink-soft">
        Pas encore de photo. Nous en déposons pendant les séjours.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-cp-ink-soft">
        Les photos restent disponibles {PHOTO_RETENTION_DAYS} jours, puis elles
        sont effacées. Enregistrez celles que vous voulez garder.
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p) => (
          <li key={p.id} className="space-y-1">
            <a
              href={`/api/photos/${p.id}`}
              target="_blank"
              rel="noopener"
              className="block overflow-hidden rounded-md border border-cp-ink outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cp-paprika"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${p.id}`}
                alt={`Photo de ${p.catName}`}
                // loading paresseux : un séjour de trois semaines peut porter
                // plusieurs dizaines de photos, les charger toutes d'un coup
                // sur un téléphone en 4G serait pénible.
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </a>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-cp-ink-soft">
              {p.daysLeft === 0
                ? "effacée aujourd'hui"
                : `encore ${p.daysLeft} jour${p.daysLeft > 1 ? "s" : ""}`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
