import Link from "next/link";

import { BookingPinToggle } from "@/components/booking-pin-toggle";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CurrentResidentsWall } from "@/components/current-residents-wall";
import { LibraryStamp } from "@/components/library-stamp";
import { OccupancyCalendar } from "@/components/occupancy-calendar";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  countClients,
  displayRef,
  formatDate,
  getMonthOccupancy,
  nightsBetween,
} from "@/lib/repository";

/// Tableau de bord administration — entièrement Prisma : décisions en
/// attente, stats globales, calendrier d'occupation du mois courant,
/// pensionnaires actuellement en séjour.

const FRENCH_MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  // Mois courant pour le calendrier d'occupation.
  const today = new Date();
  const monthIndex = today.getMonth();
  const year = today.getFullYear();
  const monthLabel = FRENCH_MONTHS[monthIndex];
  const firstOfMonth = new Date(year, monthIndex, 1);
  // Lundi = 0, dimanche = 6
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const [
    pendingDecisions,
    acceptedActiveCount,
    clientCount,
    catCount,
    occupancies,
  ] = await Promise.all([
    prisma.booking.findMany({
      // La file rassemble tout ce qui demande une action : les demandes à
      // trancher, les séjours portant un message client non lu, et ceux qu'on a
      // épinglés pour y revenir. Un séjour clôturé n'y entre jamais, même avec
      // un message non lu : sa fiche est en lecture seule, il n'y a rien à y
      // traiter.
      where: {
        OR: [
          { status: { in: ["PENDING", "QUESTION_ASKED"] } },
          { pinnedForAdmin: true },
          {
            status: { notIn: ["CANCELLED", "COMPLETED"] },
            messages: { some: { isFromAdmin: false, readAt: null } },
          },
        ],
      },
      orderBy: { startDate: "asc" },
      include: {
        // Même ordre stable que `BOOKING_INCLUDE` : sans `orderBy`, Postgres
        // renvoie l'ordre physique des lignes, qui change à chaque mise à jour.
        cats: { include: { cat: true }, orderBy: { cat: { name: "asc" } } },
        user: true,
        // Un seul message suffit à savoir qu'il y en a : inutile de tous les
        // charger pour afficher une pastille.
        messages: {
          where: { isFromAdmin: false, readAt: null },
          select: { id: true },
          take: 1,
        },
      },
    }),
    prisma.booking.count({ where: { status: "ACCEPTED" } }),
    countClients(),
    prisma.cat.count(),
    getMonthOccupancy(year, monthIndex),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
      {/* En-tête */}
      <header className="space-y-5">
        <LibraryStamp tone="paprika" boxed>
          Administration · N° d&apos;établissement 047
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl lg:text-7xl">
          Bonjour, {user?.firstName ?? "patronne"}.
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {pendingDecisions.length} décision{pendingDecisions.length > 1 ? "s" : ""}{" "}
          en attente, {acceptedActiveCount} séjour{acceptedActiveCount > 1 ? "s" : ""}{" "}
          confirmé{acceptedActiveCount > 1 ? "s" : ""}. Ça tourne.
        </p>
      </header>

      <RuleDivider className="my-12" tone="paprika" />

      {/* Stats */}
      <section
        aria-label="Indicateurs clés"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatTile
          label="À traiter"
          value={pendingDecisions.length.toString().padStart(2, "0")}
          gloss="En attente + Question posée"
          accent
        />
        <StatTile
          label="Séjours confirmés"
          value={acceptedActiveCount.toString().padStart(2, "0")}
          gloss="Statut ACCEPTED"
        />
        <StatTile
          label="Comptes inscrits"
          value={clientCount.toString().padStart(2, "0")}
          gloss="Propriétaires actifs"
        />
        <StatTile
          label="Pensionnaires"
          value={catCount.toString().padStart(2, "0")}
          gloss="Toutes fiches confondues"
        />
      </section>

      <RuleDivider className="my-14" />

      {/* Pensionnaires actuellement en séjour */}
      <CurrentResidentsWall variant="compact" />

      <RuleDivider className="my-14" />

      {/* Décisions en attente */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            number="01"
            title="À traiter"
            kicker="Demandes à trancher, messages non lus, et ce que vous avez épinglé."
            className="flex-1"
          />
          {/* Bouton plein plutôt que discret : c'est le raccourci le plus
              utilisé depuis le tableau de bord. */}
          <Link
            href="/admin/bookings"
            className={buttonVariants({
              size: "default",
              className: "shrink-0 px-6",
            })}
          >
            Voir tous les séjours →
          </Link>
        </div>

        {pendingDecisions.length === 0 ? (
          <RuledBox variant="deep">
            <p className="font-display text-2xl italic text-cp-ink">
              Rien à traiter, bien joué.
            </p>
          </RuledBox>
        ) : (
          <ul className="border-t border-cp-ink">
            {pendingDecisions.map((b) => {
              const cats = b.cats.map((link) => link.cat);
              const nights = nightsBetween(b.startDate, b.endDate);
              return (
                <li
                  key={b.id}
                  className="flex items-center gap-2 border-b border-cp-ink/30 pr-3"
                >
                  {/* Ligne entièrement cliquable. On garde un vrai lien plutôt
                      qu'un gestionnaire de clic : le clavier, le ctrl-clic et le
                      clic milieu marchent, et la page reste un composant
                      serveur. L'épingle est SŒUR du lien et non dedans : un
                      bouton dans une ancre est du HTML invalide. */}
                  <Link
                    href={
                      b.messages.length > 0
                        ? `/admin/bookings/${b.id}?onglet=contact`
                        : `/admin/bookings/${b.id}`
                    }
                    className="grid min-w-0 flex-1 gap-3 py-5 pr-4 transition-colors hover:bg-cp-paper-deep/40 sm:grid-cols-[6rem_2fr_2fr_auto] sm:items-center sm:gap-5"
                  >
                    <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-cp-paprika">
                      N°{displayRef(b.id)}
                    </p>
                    <div className="space-y-0.5">
                      <p className="font-display text-lg italic leading-tight text-cp-ink">
                        {formatDate(b.startDate)} → {formatDate(b.endDate)}
                      </p>
                      <p className="font-body text-xs text-cp-ink-soft">
                        {nights} nuit{nights > 1 ? "s" : ""} · {cats.map((c) => c.name).join(" · ")}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink">
                        {b.user.firstName} {b.user.lastName}
                      </p>
                      <p className="font-body text-xs text-cp-ink-soft">
                        {b.user.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <BookingStatusBadge status={b.status} />
                      {b.messages.length > 0 && (
                        <span className="inline-flex items-center rounded-full border border-cp-paprika bg-cp-paprika px-2.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-paper">
                          Message non lu
                        </span>
                      )}
                    </div>
                  </Link>
                  <BookingPinToggle bookingId={b.id} pinned={b.pinnedForAdmin} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <RuleDivider className="my-14" />

      {/* Calendrier */}
      <section className="space-y-8">
        <SectionHeading
          number="02"
          title="Calendrier d'occupation"
          kicker="Vue du mois courant, capacité maximale : 7 chambres."
        />
        <OccupancyCalendar
          monthLabel={monthLabel}
          year={year}
          monthIndex={monthIndex}
          firstWeekday={firstWeekday}
          daysInMonth={daysInMonth}
          todayDay={today.getDate()}
          occupancies={occupancies}
        />
      </section>
    </div>
  );
}

function StatTile({
  label,
  value,
  gloss,
  accent = false,
}: {
  label: string;
  value: string;
  gloss: string;
  accent?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1 rounded-md border border-cp-ink ${accent ? "bg-cp-paprika text-cp-paper" : "bg-cp-paper text-cp-ink"} p-6 sm:p-8`}>
      <p
        className={`font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] ${
          accent ? "text-cp-paper/85" : "text-cp-paprika"
        }`}
      >
        {label}
      </p>
      <p className="font-display text-6xl font-semibold leading-none tracking-tight sm:text-7xl">
        {value}
      </p>
      <p
        className={`font-body text-sm ${
          accent ? "text-cp-paper/85" : "text-cp-ink-soft"
        }`}
      >
        {gloss}
      </p>
    </div>
  );
}
