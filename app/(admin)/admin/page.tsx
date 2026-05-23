import Link from "next/link";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { CurrentResidentsWall } from "@/components/current-residents-wall";
import { LibraryStamp } from "@/components/library-stamp";
import { OccupancyCalendar, type Occupancy } from "@/components/occupancy-calendar";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { BOOKINGS, CATS, CLIENTS, getCat, getClient } from "@/lib/fixtures";

/// Tableau de bord administration. Vue d'ensemble brutalist editorial :
/// stats compactes, file de décisions à traiter, calendrier d'occupation,
/// activité récente.

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  // Décompte des statuts pour les stats hautes
  const pendingDecisions = BOOKINGS.filter((b) =>
    ["PENDING", "QUESTION_ASKED"].includes(b.status),
  );
  const acceptedActive = BOOKINGS.filter((b) => b.status === "ACCEPTED");

  // Calendrier — mars 2026 (mois le plus chargé des fixtures). Données
  // statiques panachées pour montrer jours pleins / jours vides.
  const marsOccupancy: Occupancy[] = [
    { day: 14, count: 2, intensity: "low" },
    { day: 15, count: 2, intensity: "low" },
    { day: 16, count: 2, intensity: "low" },
    { day: 17, count: 4, intensity: "medium" }, // arrivée d'un autre groupe
    { day: 18, count: 5, intensity: "medium" },
    { day: 19, count: 7, intensity: "high" },
    { day: 20, count: 7, intensity: "high" },
    { day: 21, count: 5, intensity: "medium" },
    { day: 22, count: 3, intensity: "low" },
    { day: 23, count: 3, intensity: "low" },
    { day: 28, count: 2, intensity: "low" },
    { day: 29, count: 2, intensity: "low" },
    { day: 30, count: 2, intensity: "low" },
    { day: 31, count: 2, intensity: "low" },
  ];

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
          en attente, {acceptedActive.length} séjour{acceptedActive.length > 1 ? "s" : ""}{" "}
          confirmé{acceptedActive.length > 1 ? "s" : ""}. La maison tourne.
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
          gloss="Pending + Question posée"
          accent
        />
        <StatTile
          label="Séjours confirmés"
          value={acceptedActive.length.toString().padStart(2, "0")}
          gloss="Statut ACCEPTED"
        />
        <StatTile
          label="Comptes inscrits"
          value={CLIENTS.length.toString().padStart(2, "0")}
          gloss="Propriétaires actifs"
        />
        <StatTile
          label="Pensionnaires"
          value={CATS.length.toString().padStart(2, "0")}
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
            title="Décisions en attente"
            kicker="À traiter en priorité — délai cible 48 h."
            className="flex-1"
          />
          <Link
            href="/admin/bookings"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Voir tous les séjours →
          </Link>
        </div>

        {pendingDecisions.length === 0 ? (
          <RuledBox variant="deep">
            <p className="font-display text-2xl italic text-cp-ink">
              Pas de décision à prendre — bien joué.
            </p>
          </RuledBox>
        ) : (
          <ul className="border-t border-cp-ink">
            {pendingDecisions.map((b) => {
              const client = getClient(b.ownerId);
              const cats = b.catIds
                .map((id) => getCat(id))
                .filter((c): c is NonNullable<typeof c> => Boolean(c));
              return (
                <li
                  key={b.id}
                  className="grid gap-3 border-b border-cp-ink/30 py-5 sm:grid-cols-[6rem_2fr_2fr_auto_auto] sm:items-center sm:gap-5"
                >
                  <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-cp-paprika">
                    N° {b.reference}
                  </p>
                  <div className="space-y-0.5">
                    <p className="font-display text-lg italic leading-tight text-cp-ink">
                      {b.startDate} → {b.endDate}
                    </p>
                    <p className="font-body text-xs text-cp-ink-soft">
                      {b.nights} nuit{b.nights > 1 ? "s" : ""} · {cats.map((c) => c.name).join(" · ")}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink">
                      {client ? `${client.firstName} ${client.lastName}` : "—"}
                    </p>
                    <p className="font-body text-xs text-cp-ink-soft">
                      {client?.email}
                    </p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                  <Link
                    href={`/admin/bookings/${b.reference}`}
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    Ouvrir →
                  </Link>
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
          kicker="Vue d'ensemble du mois courant — capacité maximale : 7 chambres."
        />
        <OccupancyCalendar
          monthLabel="Mars"
          year={2026}
          monthIndex={2}
          firstWeekday={6} // 1er mars 2026 = dimanche
          daysInMonth={31}
          todayDay={20}
          occupancies={marsOccupancy}
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
