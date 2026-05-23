import Link from "next/link";

import { BookingCard } from "@/components/booking-card";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { buttonVariants } from "@/components/ui/button";
import {
  CURRENT_OWNER_ID,
  getBookingsByOwner,
  getCat,
} from "@/lib/fixtures";

/// Liste des séjours du client : tous statuts confondus, ordonnés par
/// statut puis date. Sépare visuellement « en cours » et « passés ».

export default function BookingsListPage() {
  const all = getBookingsByOwner(CURRENT_OWNER_ID);
  const active = all.filter(
    (b) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status),
  );
  const closed = all.filter((b) =>
    ["COMPLETED", "CANCELLED", "REJECTED"].includes(b.status),
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
                  reference={b.reference}
                  status={b.status}
                  startDate={b.startDate}
                  endDate={b.endDate}
                  nights={b.nights}
                  catNames={b.catIds
                    .map((id) => getCat(id)?.name)
                    .filter((n): n is string => Boolean(n))}
                  total={b.total}
                  notes={b.notes}
                  messageCount={b.messages.length}
                  href={`/dashboard/bookings/${b.reference}`}
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
                  reference={b.reference}
                  status={b.status}
                  startDate={b.startDate}
                  endDate={b.endDate}
                  nights={b.nights}
                  catNames={b.catIds
                    .map((id) => getCat(id)?.name)
                    .filter((n): n is string => Boolean(n))}
                  total={b.total}
                  messageCount={b.messages.length}
                  href={`/dashboard/bookings/${b.reference}`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
