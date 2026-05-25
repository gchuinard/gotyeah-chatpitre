import Link from "next/link";

import {
  BookingStatusBadge,
  type BookingStatus,
} from "@/components/booking-status-badge";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import {
  displayRef,
  formatDate,
  getAllBookings,
  nightsBetween,
} from "@/lib/repository";

// Ordre d'affichage : décisions en attente d'abord, puis acceptées,
// puis le reste (terminées, annulées, refusées).
const STATUS_ORDER: BookingStatus[] = [
  "QUESTION_ASKED",
  "PENDING",
  "ACCEPTED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

/// Liste admin des séjours : tableau brutalist, tri par priorité de statut.

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
          Tous les séjours — {bookings.length} entrée{bookings.length > 1 ? "s" : ""}
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Séjours
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          Tous les séjours de la maison, ordonnés par priorité de traitement.
        </p>
      </header>

      <RuleDivider className="my-12" />

      {/* Chips de comptage par statut */}
      <section
        aria-label="Répartition par statut"
        className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink sm:grid-cols-3 lg:grid-cols-6"
      >
        {STATUS_ORDER.map((s) => (
          <StatusChip key={s} status={s} count={counts[s]} />
        ))}
      </section>

      <SectionHeading
        number="01"
        title="Tableau des séjours"
        kicker="Ouvrez une ligne pour traiter la décision ou répondre."
        className="mt-14"
      />

      <div className="mt-8 overflow-x-auto rounded-md border border-cp-ink">
        <table className="w-full min-w-[60rem] border-collapse text-left">
          <thead className="bg-cp-paper-deep">
            <tr>
              <Th>N°</Th>
              <Th>Statut</Th>
              <Th>Client</Th>
              <Th>Dates</Th>
              <Th>Pensionnaires</Th>
              <Th className="text-right">Total</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const cats = b.cats.map((link) => link.cat);
              const nights = nightsBetween(b.startDate, b.endDate);
              const ref = displayRef(b.id);
              return (
                <tr
                  key={b.id}
                  className="border-t border-cp-ink/20 transition-colors hover:bg-cp-paper-deep/40"
                >
                  <Td>
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cp-paprika hover:text-cp-ink"
                    >
                      N° {ref}
                    </Link>
                  </Td>
                  <Td>
                    <BookingStatusBadge status={b.status} />
                  </Td>
                  <Td>
                    <p className="font-display text-lg italic leading-tight text-cp-ink">
                      {b.user.firstName} {b.user.lastName}
                    </p>
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
                      {b.user.email}
                    </p>
                  </Td>
                  <Td>
                    <p className="font-body text-sm leading-snug text-cp-ink">
                      {formatDate(b.startDate)}
                      <br />
                      <span className="text-cp-ink-soft">→ {formatDate(b.endDate)}</span>
                    </p>
                    <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
                      {nights} nuit{nights > 1 ? "s" : ""}
                    </p>
                  </Td>
                  <Td>
                    <p className="font-body text-sm text-cp-ink">
                      {cats.map((c) => c.name).join(" · ")}
                    </p>
                  </Td>
                  <Td className="text-right">
                    <p className="font-display text-2xl font-bold leading-none text-cp-ink">
                      {Number(b.totalAmount).toLocaleString("fr-FR")}€
                    </p>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/bookings/${b.id}`}
                      className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft hover:text-cp-paprika"
                    >
                      Ouvrir →
                    </Link>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----- Helpers -------------------------------------------------------- */

function Th({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`border-b border-cp-ink px-4 py-3 font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-4 align-top ${className ?? ""}`}>{children}</td>
  );
}

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
