import Link from "next/link";

import { AdminBookingsTable } from "@/components/admin-bookings-table";
import {
  BookingStatusBadge,
  BOOKING_STATUS_ORDER,
  type BookingStatus,
} from "@/components/booking-status-badge";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import {
  displayRef,
  formatDate,
  formatEuros,
  getAllBookings,
  nightsBetween,
} from "@/lib/repository";

/// Liste admin des séjours : tableau filtrable et triable, ordonné par
/// priorité de traitement par défaut (l'ordre des statuts vit dans
/// `booking-status-badge`, partagé avec les chips de comptage).

export default async function AdminBookingsListPage() {
  const bookings = await getAllBookings();

  const counts: Record<BookingStatus, number> = {
    PENDING: 0,
    QUESTION_ASKED: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    CANCELLED: 0,
    COMPLETED: 0,
  };
  for (const b of bookings) counts[b.status] += 1;

  // Filtre et tri se font côté client sur la liste complète : on passe des
  // lignes déjà formatées, plus une date ISO et un total brut pour trier.
  const rows = bookings.map((b) => {
    const total = b.totalAmount === null ? null : Number(b.totalAmount);
    return {
      id: b.id,
      reference: displayRef(b.id),
      status: b.status,
      clientName: `${b.user.firstName} ${b.user.lastName}`,
      clientEmail: b.user.email,
      startISO: b.startDate.toISOString(),
      startLabel: formatDate(b.startDate),
      endLabel: formatDate(b.endDate),
      nights: nightsBetween(b.startDate, b.endDate),
      catNames: b.cats.map((link) => link.cat.name).join(" · "),
      total,
      totalLabel: total === null ? null : `${formatEuros(total)}€`,
    };
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-paprika">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Séjours</span>
      </nav>

      <header className="space-y-4">
        <LibraryStamp boxed>
          Tous les séjours, {bookings.length} entrée{bookings.length > 1 ? "s" : ""}
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Séjours
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          Tous nos séjours, ordonnés par priorité de traitement.
        </p>
      </header>

      <RuleDivider className="my-12" />

      {/* Chips de comptage par statut */}
      <section
        aria-label="Répartition par statut"
        className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink sm:grid-cols-3 lg:grid-cols-6"
      >
        {BOOKING_STATUS_ORDER.map((s) => (
          <StatusChip key={s} status={s} count={counts[s]} />
        ))}
      </section>

      <SectionHeading
        number="01"
        title="Tableau des séjours"
        kicker="Filtrez, triez, puis ouvrez une ligne pour traiter la décision."
        className="mt-14"
      />

      <AdminBookingsTable bookings={rows} />
    </div>
  );
}

/* ----- Helpers -------------------------------------------------------- */

function StatusChip({
  status,
  count,
}: {
  status: BookingStatus;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-2 bg-cp-paper p-5">
      <BookingStatusBadge status={status} />
      <p className="font-display text-3xl font-bold leading-none text-cp-ink">
        {count.toString().padStart(2, "0")}
      </p>
    </div>
  );
}
