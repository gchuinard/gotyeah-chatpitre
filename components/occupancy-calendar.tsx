import Link from "next/link";

import { OCCUPANCY_LABEL, occupancyState } from "@/lib/occupancy";
import { cn } from "@/lib/utils";

/// « 2026-08-14 » pour l'URL d'une journée.
///
/// Construit à la main plutôt que par toISOString() : cette dernière convertit
/// en UTC, et un 1er août à minuit heure de Paris y devient un 31 juillet. Le
/// jour affiché et le jour ouvert doivent être le même.
function dayHref(year: number, monthIndex: number, day: number): string {
  const mm = String(monthIndex + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/// Grille calendaire d'occupation : une cellule par jour du mois, avec
/// nombre de pensionnaires hébergés ce jour-là. CSS pur, accessibilité
/// via `<table>` sémantique. Lundi en premier jour de la semaine.

export type Occupancy = {
  /** Jour 1-31 du mois affiché. */
  day: number;
  /** Nombre de chats présents ce jour. */
  count: number;
  /** Statut de la cellule pour la couleur. */
  intensity?: "low" | "medium" | "high";
};

export function OccupancyCalendar({
  monthLabel,
  year,
  monthIndex, // 0..11
  firstWeekday, // 0 = Monday … 6 = Sunday
  daysInMonth,
  todayDay,
  occupancies,
  className,
}: {
  monthLabel: string;
  year: number;
  monthIndex: number;
  firstWeekday: number;
  daysInMonth: number;
  todayDay?: number;
  occupancies: Occupancy[];
  className?: string;
}) {
  const occByDay = new Map(occupancies.map((o) => [o.day, o]));

  // Construit la matrice 6×7 (max) avec offset de début et padding fin.
  const cells: ({ day: number; occ?: Occupancy } | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ day: d, occ: occByDay.get(d) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={cn("border border-cp-ink bg-cp-paper", className)}>
      <header className="flex items-baseline justify-between border-b border-cp-ink px-5 py-3">
        <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
          Calendrier d&apos;occupation
        </p>
        <p className="font-display text-2xl italic leading-none tracking-tight text-cp-ink sm:text-3xl">
          {monthLabel} {year}
        </p>
      </header>

      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">
          Occupation jour par jour, {monthLabel} {year}
        </caption>
        <thead>
          <tr>
            {WEEKDAYS.map((wd) => (
              <th
                key={wd}
                scope="col"
                className="border-b border-cp-ink/40 px-2 py-2 text-center font-mono text-[0.55rem] font-bold uppercase tracking-[0.2em] text-cp-ink-soft"
              >
                {wd}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chunk(cells, 7).map((row, rowIdx) => (
            <tr key={`r-${monthIndex}-${rowIdx}`}>
              {row.map((cell, colIdx) => {
                if (!cell) {
                  return (
                    <td
                      key={`empty-${rowIdx}-${colIdx}`}
                      className="aspect-square border border-transparent bg-cp-paper-deep/30"
                    />
                  );
                }
                const isToday = todayDay === cell.day;
                const isOccupied = !!cell.occ;
                // L'état vient du NOMBRE d'occupants, plus du champ `intensity`
                // calculé côté données : c'est ce qui garantit que les deux
                // calendriers de l'application classent une journée pareil.
                const state = occupancyState(cell.occ?.count ?? 0);
                const intensity =
                  state === "full" ? "high" : state === "last" ? "medium" : "low";

                return (
                  <td
                    key={`d-${cell.day}`}
                    // L'état est aussi porté par du TEXTE et pas seulement par
                    // la couleur : sans ça, un daltonien ne peut pas lire la
                    // différence entre « dernière place » et « complet ».
                    title={`${String(cell.day).padStart(2, "0")} : ${OCCUPANCY_LABEL[state]}${cell.occ ? ` (${cell.occ.count} sur 7)` : ""}`}
                    className={cn(
                      "relative aspect-square border border-cp-ink/15 align-top",
                      isOccupied && intensity === "low" && "bg-cp-paper-deep/70",
                      isOccupied && intensity === "medium" && "bg-cp-paper-deep",
                      isOccupied && intensity === "high" && "bg-cp-ink text-cp-paper",
                      isToday && "outline outline-2 -outline-offset-2 outline-cp-paprika",
                    )}
                  >
                    {/* Un vrai lien et non un gestionnaire de clic : le clavier,
                        le ctrl-clic et le clic milieu fonctionnent nativement.
                        Il occupe toute la case, y compris les jours sans
                        occupation, qui doivent répondre eux aussi plutôt que de
                        rester inertes sous le doigt.

                        Le padding est porté ICI et plus par la cellule, sans
                        quoi la zone cliquable s'arrêterait avant les bords. */}
                    <Link
                      href={`/admin/jour/${dayHref(year, monthIndex, cell.day)}`}
                      aria-label={`Voir la journée du ${String(cell.day).padStart(2, "0")}, ${OCCUPANCY_LABEL[state].toLowerCase()}`}
                      className="block h-full p-1.5 outline-none transition-colors hover:bg-cp-paprika/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cp-paprika"
                    >
                    <div className="flex h-full flex-col">
                      <span
                        className={cn(
                          "font-mono text-[0.7rem] font-bold leading-none tracking-tight",
                          intensity === "high" && isOccupied
                            ? "text-cp-paper"
                            : "text-cp-ink",
                        )}
                      >
                        {String(cell.day).padStart(2, "0")}
                      </span>
                      {cell.occ && (
                        <div className="mt-auto flex items-end justify-between gap-1">
                          <span
                            className={cn(
                              "font-display text-base font-bold leading-none",
                              intensity === "high" && isOccupied
                                ? "text-cp-paper"
                                : "text-cp-ink",
                            )}
                          >
                            {cell.occ.count}
                          </span>
                          <span
                            aria-hidden
                            className={cn(
                              "font-mono text-[0.55rem] uppercase tracking-[0.16em]",
                              intensity === "high" && isOccupied
                                ? "text-cp-paper/70"
                                : "text-cp-ink-soft",
                            )}
                          >
                            chats
                          </span>
                        </div>
                      )}
                    </div>
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Même vocabulaire que le calendrier de réservation, cf. lib/occupancy.
          L'ancien dégradé à quatre paliers rangeait « il reste une chambre » et
          « il n'en reste aucune » dans la même case. */}
      <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-cp-ink px-5 py-3">
        <LegendDot label={OCCUPANCY_LABEL.available} />
        <LegendDot label={OCCUPANCY_LABEL.last} tint="medium" />
        <LegendDot label={OCCUPANCY_LABEL.full} tint="high" />
      </footer>
    </div>
  );
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function LegendDot({
  label,
  tint,
}: {
  label: string;
  tint?: "low" | "medium" | "high";
}) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          "inline-block size-3 border border-cp-ink",
          !tint && "bg-cp-paper",
          tint === "low" && "bg-cp-paper-deep/70",
          tint === "medium" && "bg-cp-paper-deep",
          tint === "high" && "bg-cp-ink",
        )}
      />
      <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-ink-soft">
        {label}
      </span>
    </span>
  );
}
