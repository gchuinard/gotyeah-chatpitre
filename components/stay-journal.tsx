import { CatIllustration } from "@/components/cat-illustration";
import { Field } from "@/components/field";
import { LibraryStamp } from "@/components/library-stamp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getCat,
  getStayUpdates,
  type FixtureStayUpdate,
} from "@/lib/fixtures";

/// « Carnet de séjour » — timeline d'entrées photo + note pour un séjour.
/// Server-rendu, lit les fixtures triées de la plus récente à la plus
/// ancienne. La photo est une illustration Charley Harper en attendant
/// l'upload réel.
///
/// `canAdd=true` (côté admin) ajoute un formulaire de nouvelle entrée en
/// haut de la timeline. Le formulaire est no-op pour l'instant (renvoie
/// à la liste des séjours admin), il prouve la mise en page.

export function StayJournal({
  bookingId,
  catIdsScope,
  canAdd = false,
  emptyLabel = "Aucune entrée pour l'instant. La maison postera une note dès l'arrivée.",
}: {
  bookingId: string;
  /** Si fourni, restreint aux entrées concernant ces chats (utile pour
   *  les séjours multi-chats où on voudrait filtrer par chat à terme). */
  catIdsScope?: string[];
  canAdd?: boolean;
  emptyLabel?: string;
}) {
  const all = getStayUpdates(bookingId);
  const updates = catIdsScope
    ? all.filter((u) => catIdsScope.includes(u.catId))
    : all;

  return (
    <div className="space-y-8">
      {canAdd && <NewEntryForm />}

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
              <JournalEntry entry={entry} isMostRecent={i === 0} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function JournalEntry({
  entry,
  isMostRecent,
}: {
  entry: FixtureStayUpdate;
  isMostRecent: boolean;
}) {
  const cat = getCat(entry.catId);
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-md border border-cp-ink bg-cp-paper p-4 sm:flex-row sm:gap-6 sm:p-5",
        isMostRecent && "shadow-[6px_6px_0_0_var(--color-cp-cobalt)]",
      )}
    >
      <div className="shrink-0">
        <div className="overflow-hidden rounded-md border border-cp-ink/40">
          <CatIllustration
            variant={entry.imageVariant}
            pose={entry.imagePose}
            ariaLabel={cat ? `Photo de ${cat.name}` : "Photo du carnet"}
            className="size-32 sm:size-40"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-display text-2xl italic leading-tight text-cp-ink">
            {cat?.name ?? "Pensionnaire"}
          </p>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cp-cobalt">
            {entry.postedAt}
          </p>
        </header>
        <p className="font-body text-base leading-relaxed text-cp-ink">
          {entry.caption}
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

function NewEntryForm() {
  return (
    <form
      action="/admin/bookings"
      method="get"
      className="space-y-4 rounded-md border border-cp-cobalt bg-cp-cobalt p-6 text-cp-paper sm:p-8"
    >
      <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cp-canari">
        Nouvelle entrée du carnet
      </p>
      <Field label="Note du jour" htmlFor="journal-body">
        <Textarea
          id="journal-body"
          name="body"
          rows={3}
          placeholder="Salami a dormi sur le frigo toute la matinée…"
          className="border-cp-paper/30 bg-cp-cobalt-deep text-cp-paper placeholder:text-cp-paper/40 focus-visible:outline-cp-canari"
        />
      </Field>
      <p className="font-body text-xs italic text-cp-paper/70">
        Photo réelle à venir — pour l&apos;instant le carnet utilise une
        illustration choisie au hasard.
      </p>
      <div className="flex justify-end">
        <Button
          type="submit"
          size="default"
          className="border-cp-canari bg-cp-canari text-cp-ink hover:bg-cp-canari-deep hover:border-cp-canari-deep"
        >
          Publier l&apos;entrée →
        </Button>
      </div>
    </form>
  );
}
