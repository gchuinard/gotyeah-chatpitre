import type { Cat } from "@prisma/client";

import { CatIllustration } from "@/components/cat-illustration";
import { LibraryStamp } from "@/components/library-stamp";
import { NewStayUpdateForm } from "@/components/new-stay-update-form";
import { cn } from "@/lib/utils";
import { formatDateTime, getStayUpdates } from "@/lib/repository";

/// « Carnet de séjour » — timeline d'entrées photo + note pour un séjour.
/// Server-rendu, lit Prisma trié de la plus récente à la plus ancienne.
/// La photo est une illustration Charley Harper en attendant l'upload réel.
///
/// `canAdd=true` (côté admin) ajoute en haut le formulaire de nouvelle
/// entrée qui POST réellement sur /api/admin/bookings/[id]/stay-updates.

export async function StayJournal({
  bookingId,
  cats,
  canAdd = false,
  emptyLabel = "Aucune entrée pour l'instant. La maison postera une note dès l'arrivée.",
}: {
  bookingId: string;
  /** Chats concernés par le séjour — requis si `canAdd` (pour la sélection). */
  cats?: Cat[];
  canAdd?: boolean;
  emptyLabel?: string;
}) {
  const updates = await getStayUpdates(bookingId);

  return (
    <div className="space-y-8">
      {canAdd && cats && cats.length > 0 && (
        <NewStayUpdateForm bookingId={bookingId} cats={cats} />
      )}

      {updates.length === 0 ? (
        <div className="rounded-md border border-cp-ink/30 bg-cp-paper-deep/40 p-8 text-center">
          <LibraryStamp tone="cobalt">carnet vide</LibraryStamp>
          <p className="mt-4 font-display text-xl italic text-cp-ink-soft">
            {emptyLabel}
          </p>
        </div>
      ) : (
        <ol className="space-y-6">
          {updates.map((entry, i) => (
            <li key={entry.id}>
              <JournalEntry
                catName={entry.cat.name}
                content={entry.content}
                createdAt={entry.createdAt}
                imageVariant={entry.imageVariant}
                imagePose={entry.imagePose}
                imageUrl={entry.imageUrl}
                isMostRecent={i === 0}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function JournalEntry({
  catName,
  content,
  createdAt,
  imageVariant,
  imagePose,
  imageUrl,
  isMostRecent,
}: {
  catName: string;
  content: string;
  createdAt: Date;
  imageVariant: "COBALT" | "PAPRIKA" | "CANARI" | "FEUILLE";
  imagePose: "SITTING" | "SLEEPING" | "STANDING" | "WATCHING";
  imageUrl: string | null;
  isMostRecent: boolean;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-md border border-cp-ink bg-cp-paper p-4 sm:flex-row sm:gap-6 sm:p-5",
        isMostRecent && "shadow-[6px_6px_0_0_var(--color-cp-cobalt)]",
      )}
    >
      <div className="shrink-0">
        <div className="overflow-hidden rounded-md border border-cp-ink/40">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`Photo de ${catName}`}
              className="size-32 object-cover sm:size-40"
            />
          ) : (
            <CatIllustration
              variant={imageVariant.toLowerCase() as "cobalt" | "paprika" | "canari" | "feuille"}
              pose={imagePose.toLowerCase() as "sitting" | "sleeping" | "standing" | "watching"}
              ariaLabel={`Illustration de ${catName}`}
              className="size-32 sm:size-40"
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-display text-2xl italic leading-tight text-cp-ink">
            {catName}
          </p>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cp-cobalt">
            {formatDateTime(createdAt)}
          </p>
        </header>
        <p className="font-body text-base leading-relaxed text-cp-ink">
          {content}
        </p>
        {isMostRecent && (
          <LibraryStamp tone="paprika" className="mt-1 self-start">
            Dernière note
          </LibraryStamp>
        )}
      </div>
    </article>
  );
}
