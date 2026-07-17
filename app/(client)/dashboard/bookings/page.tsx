import Link from "next/link";

import { BookingCard } from "@/components/booking-card";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import {
  displayRef,
  formatDate,
  getBookingsByOwner,
  nightsBetween,
} from "@/lib/repository";

/// Liste des séjours du client : tous statuts confondus, ordonnés par
/// statut puis date. Sépare visuellement « en cours » et « passés ».

const CLOSED_STATUSES = ["COMPLETED", "CANCELLED", "REJECTED"] as const;

export default async function BookingsListPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { cancelled } = await searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const all = await getBookingsByOwner(user.id);
  const active = all.filter(
    (b) => !CLOSED_STATUSES.includes(b.status as (typeof CLOSED_STATUSES)[number]),
  );
  const closed = all.filter((b) =>
    CLOSED_STATUSES.includes(b.status as (typeof CLOSED_STATUSES)[number]),
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/dashboard" className="hover:text-cp-paprika">
          Mon espace
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Séjours</span>
      </nav>

      {cancelled === "1" && (
        <div
          role="status"
          className="mb-8 rounded-md border border-cp-paprika bg-cp-paprika-light/40 px-4 py-3 font-body text-sm text-cp-ink"
        >
          Séjour annulé. Votre demande a bien été retirée.
        </div>
      )}

      <header className="flex flex-wrap items-end justify-between gap-8">
        <div className="space-y-4">
          <LibraryStamp boxed>
            Mes représentations — {all.length} entrée{all.length > 1 ? "s" : ""}
          </LibraryStamp>
          <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
            Mes séjours
          </h1>
          <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
            Tous vos séjours, en cours et passés. Chaque entrée garde son
            historique de messages et son statut figé une fois clôturée.
          </p>
        </div>

        <Link
          href="/dashboard/bookings/new"
          className={buttonVariants({ size: "lg", className: "px-8" })}
        >
          + Réserver un séjour
        </Link>
      </header>

      <RuleDivider className="my-14" />

      <section aria-labelledby="active-title" className="space-y-6">
        <h2
          id="active-title"
          className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cp-paprika"
        >
          Actifs — {active.length}
        </h2>

        {active.length === 0 ? (
          <p className="border border-cp-ink/30 bg-cp-paper-deep/40 p-8 text-center font-display text-xl italic text-cp-ink-soft">
            Aucun séjour actif. Réservez quand vous êtes prêt.
          </p>
        ) : (
          <ul className="grid gap-6 lg:grid-cols-2">
            {active.map((b) => (
              <li key={b.id}>
                <BookingCard
                  reference={displayRef(b.id)}
                  status={b.status}
                  startDate={formatDate(b.startDate)}
                  endDate={formatDate(b.endDate)}
                  nights={nightsBetween(b.startDate, b.endDate)}
                  catNames={b.cats.map((link) => link.cat.name)}
                  total={b.totalAmount === null ? null : Number(b.totalAmount)}
                  notes={b.clientNotes ?? undefined}
                  messageCount={b.messages.length}
                  href={`/dashboard/bookings/${b.id}`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <RuleDivider className="my-14" />

      <section aria-labelledby="closed-title" className="space-y-6">
        <h2
          id="closed-title"
          className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cp-ink-soft"
        >
          Clôturés — {closed.length}
        </h2>

        {closed.length === 0 ? (
          <p className="border border-cp-ink/30 bg-cp-paper-deep/40 p-8 text-center font-display text-xl italic text-cp-ink-soft">
            Aucun séjour clôturé pour l&apos;instant.
          </p>
        ) : (
          <ul className="grid gap-6 lg:grid-cols-2">
            {closed.map((b) => (
              <li key={b.id}>
                <BookingCard
                  reference={displayRef(b.id)}
                  status={b.status}
                  startDate={formatDate(b.startDate)}
                  endDate={formatDate(b.endDate)}
                  nights={nightsBetween(b.startDate, b.endDate)}
                  catNames={b.cats.map((link) => link.cat.name)}
                  total={b.totalAmount === null ? null : Number(b.totalAmount)}
                  messageCount={b.messages.length}
                  href={`/dashboard/bookings/${b.id}`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
