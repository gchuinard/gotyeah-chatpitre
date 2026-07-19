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
import { resolveTab, UrlTabs, type UrlTabItem } from "@/components/url-tabs";
import { ARCHIVE_AFTER_DAYS, isBookingArchived } from "@/lib/api";
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

export default async function AdminBookingsListPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string }>;
}) {
  const all = await getAllBookings();

  // L'archive est un FILTRE CALCULÉ, pas un statut stocké. Un statut aurait dû
  // être posé par quelque chose : le projet n'a aucune tâche planifiée, et
  // personne n'irait cliquer « archiver » sur des séjours vieux de trente
  // jours. Calculé, le rangement est juste dès l'ouverture de la page.
  const archived: typeof all = [];
  const current: typeof all = [];
  for (const b of all) {
    (isBookingArchived(b.status, b.closedAt) ? archived : current).push(b);
  }

  const tabs: UrlTabItem<"courants" | "archive">[] = [
    { value: "courants", label: "Séjours courants", count: current.length },
    { value: "archive", label: "Archive", count: archived.length },
  ];
  const onglet = resolveTab((await searchParams).onglet, tabs);
  const bookings = onglet === "archive" ? archived : current;

  // Les compteurs suivent l'onglet actif : calculés sur la totalité, ils
  // mentiraient au-dessus d'une liste qui n'en montre qu'une partie.
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
    // paidAmount est la somme des versements, tenue à jour à chaque écriture :
    // rien à agréger ici. Sans devis, l'encaissement n'a pas de sens à afficher,
    // il n'y a rien à devoir.
    const paid = total === null ? null : Number(b.paidAmount ?? 0);
    const balance = total === null || paid === null ? null : total - paid;
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
      paid,
      paidLabel: paid === null ? null : `${formatEuros(paid)}€`,
      balanceLabel:
        balance === null
          ? null
          : balance > 0
            ? `reste ${formatEuros(balance)}€`
            : balance < 0
              ? `trop-perçu ${formatEuros(-balance)}€`
              : "soldé",
      balanceTone:
        balance === null
          ? null
          : balance > 0
            ? ("due" as const)
            : balance < 0
              ? ("over" as const)
              : ("settled" as const),
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
          {bookings.length} entrée{bookings.length > 1 ? "s" : ""}
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Séjours
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {onglet === "archive"
            ? `Annulés, refusés ou terminés depuis plus de ${ARCHIVE_AFTER_DAYS} jours. Ils restent consultables, et une demande refusée reste ouverte à l'échange.`
            : "Tous nos séjours, ordonnés par priorité de traitement."}
        </p>
      </header>

      <UrlTabs
        items={tabs}
        active={onglet}
        basePath="/admin/bookings"
        ariaLabel="Séjours courants ou archivés"
        className="mt-10"
      />

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
        title="Tableau des séjours"
        kicker="Filtrez, triez, puis ouvrez une ligne pour traiter la décision."
        className="mt-14"
      />

      {/* `key` sur l'onglet : recherche, tri et filtre du tableau sont un état
          interne, et doivent repartir à zéro quand on change de liste. */}
      <AdminBookingsTable key={onglet} bookings={rows} />
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
