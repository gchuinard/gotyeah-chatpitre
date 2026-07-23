import Link from "next/link";
import { notFound } from "next/navigation";

import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { CAPACITY, OCCUPANCY_LABEL, occupancyState } from "@/lib/occupancy";
import { displayRef, formatDate, readSettings } from "@/lib/repository";
import { formatTime, formatWindow } from "@/lib/settings";

/// Détail d'une journée : qui arrive, qui repart, qui reste.
///
/// Le calendrier d'occupation montrait un taux de remplissage sans dire de qui
/// il s'agissait : on voyait qu'un 14 août était chargé, sans pouvoir savoir
/// qui arrivait. Il fallait ouvrir la liste des séjours et recouper les dates
/// à la main.

/// « 2026-08-14 » et rien d'autre. Une URL bricolée ne doit pas produire une
/// page en erreur ni une date fantaisiste que JavaScript accepterait.
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseDay(raw: string): Date | null {
  const m = DATE_PATTERN.exec(raw);
  if (!m) return null;
  const [, y, mo, d] = m;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  // Vérifie que la date existe vraiment : un 31 février donnerait un 3 mars.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export default async function AdminDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date: rawDate } = await params;
  const day = parseDay(rawDate);
  if (!day) notFound();

  const dayEnd = new Date(day.getTime() + 24 * 60 * 60 * 1000);
  const settings = await readSettings();

  // Une seule requête : tous les séjours acceptés qui touchent cette journée,
  // qu'ils y commencent, s'y terminent ou l'enjambent.
  const bookings = await prisma.booking.findMany({
    where: {
      status: "ACCEPTED",
      startDate: { lt: dayEnd },
      endDate: { gte: day },
    },
    include: {
      user: { select: { firstName: true, lastName: true, phone: true } },
      cats: { include: { cat: { select: { id: true, name: true } } } },
    },
    orderBy: { startDate: "asc" },
  });

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const arrivals = bookings.filter((b) => sameDay(b.startDate, day));
  const departures = bookings.filter((b) => sameDay(b.endDate, day));
  // Ni arrivée ni départ : les chats déjà là, qui ne bougent pas aujourd'hui.
  const staying = bookings.filter(
    (b) => !sameDay(b.startDate, day) && !sameDay(b.endDate, day),
  );

  // Le décompte suit exactement la règle du calendrier : le jour du départ, la
  // chambre est rendue et ne compte plus. Sans cette cohérence, la page
  // afficherait un autre nombre que la case sur laquelle on vient de cliquer.
  const presentCount = bookings
    .filter((b) => b.startDate <= day && day < b.endDate)
    .reduce((sum, b) => sum + b.cats.length, 0);
  const state = occupancyState(presentCount);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-paprika">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Journée</span>
      </nav>

      <Link
        href="/admin"
        className={buttonVariants({ variant: "outline", className: "mb-6" })}
      >
        ← Retour au tableau de bord
      </Link>

      <header className="space-y-5">
        <LibraryStamp boxed>
          {OCCUPANCY_LABEL[state]}, {presentCount} sur {CAPACITY}
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          {formatDate(day)}.
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {arrivals.length} arrivée{arrivals.length > 1 ? "s" : ""},{" "}
          {departures.length} départ{departures.length > 1 ? "s" : ""},{" "}
          {staying.length} séjour{staying.length > 1 ? "s" : ""} en cours.
        </p>
      </header>

      <RuleDivider className="my-12" tone="paprika" />

      {bookings.length === 0 ? (
        <RuledBox variant="deep">
          <p className="font-display text-2xl italic text-cp-ink">
            Personne ce jour-là. La maison est vide.
          </p>
        </RuledBox>
      ) : (
        <div className="space-y-14">
          <Group
            title="Arrivées"
            kicker={`Accueil ${formatWindow(settings.arrival_window_start, settings.arrival_window_end)}, sauf horaire convenu.`}
            tone="paprika"
            bookings={arrivals}
            timeOf={(b) => b.arrivalTime}
          />
          <Group
            title="Départs"
            kicker={`Départs ${formatWindow(settings.departure_window_start, settings.departure_window_end)}, sauf horaire convenu.`}
            tone="cobalt"
            bookings={departures}
            timeOf={(b) => b.departureTime}
          />
          <Group
            title="En séjour"
            kicker="Déjà là, et ne bougent pas aujourd'hui."
            tone="feuille"
            bookings={staying}
            timeOf={() => null}
          />
        </div>
      )}
    </div>
  );
}

type DayBooking = {
  id: string;
  arrivalTime: string | null;
  departureTime: string | null;
  user: { firstName: string; lastName: string; phone: string | null };
  cats: { cat: { id: string; name: string } }[];
};

function Group({
  title,
  kicker,
  tone,
  bookings,
  timeOf,
}: {
  title: string;
  kicker: string;
  tone: "paprika" | "cobalt" | "feuille";
  bookings: DayBooking[];
  timeOf: (b: DayBooking) => string | null;
}) {
  // Ordonné par heure, ceux qui suivent le créneau habituel en fin de liste.
  // Les chaînes « HH:MM » se comparent correctement dans l'ordre alphabétique,
  // c'est précisément ce que garantit le zéro initial du format.
  const sorted = [...bookings].sort((a, b) => {
    const ta = timeOf(a);
    const tb = timeOf(b);
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    return ta.localeCompare(tb);
  });

  // Un groupe vide n'est pas masqué : voir « Arrivées, aucune » vaut mieux que
  // se demander si la section a été oubliée.
  return (
    <section className="space-y-6">
      <SectionHeading title={title} kicker={kicker} tone={tone} />
      {sorted.length === 0 ? (
        <p className="font-body text-sm text-cp-ink-soft">Aucune ce jour-là.</p>
      ) : (
        <ul className="border-t border-cp-ink">
          {sorted.map((b) => {
            const time = timeOf(b);
            return (
              <li key={b.id} className="border-b border-cp-ink/30">
                <Link
                  href={`/admin/bookings/${b.id}`}
                  className="grid gap-3 py-5 pr-4 transition-colors hover:bg-cp-paper-deep/40 sm:grid-cols-[5rem_2fr_2fr_auto] sm:items-center sm:gap-5"
                >
                  <p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-cp-paprika">
                    N°{displayRef(b.id)}
                  </p>
                  <p className="font-display text-lg italic leading-tight text-cp-ink">
                    {b.cats.map((c) => c.cat.name).join(" · ")}
                  </p>
                  <div className="space-y-0.5">
                    <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink">
                      {b.user.firstName} {b.user.lastName}
                    </p>
                    {/* Le téléphone est ici et pas ailleurs : c'est le jour même
                        qu'on appelle un propriétaire en retard. */}
                    {b.user.phone && (
                      <p className="font-body text-xs text-cp-ink-soft">
                        {b.user.phone}
                      </p>
                    )}
                  </div>
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cp-ink-soft sm:text-right">
                    {time ? `à ${formatTime(time)}` : "horaire habituel"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
