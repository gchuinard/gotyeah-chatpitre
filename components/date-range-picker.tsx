"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/// Sélecteur de plage de dates avec aperçu d'occupation, mid-century
/// illustré. Deux mois côte à côte (sm+) avec navigation. Click 1 →
/// arrivée, click 2 → départ, click 3 → reset. Au survol entre les deux
/// clics, la plage est mise en évidence. Les jours passés sont
/// désactivés ; les jours complets (occupancy >= max) sont marqués
/// comme tels et non-cliquables. Les hidden inputs `startDate` /
/// `endDate` portent les valeurs ISO pour le submit du form.

// Réexporté depuis lib/occupancy, source unique partagée avec le calendrier
// d'occupation de l'administration. Les deux disaient la même journée avec des
// mots différents tant que chacun avait sa constante.
import { CAPACITY } from "@/lib/occupancy";

// Occupation pré-calculée pour la maquette — la prod calculera ça
// depuis la base. Format clé : YYYY-MM-DD, valeur : nombre de chats
// présents ce jour-là (entre 0 et CAPACITY).
const FUTURE_OCCUPANCY: Record<string, number> = {
  // Fin mai 2026 — séjours en cours
  "2026-05-25": 3, "2026-05-26": 3, "2026-05-27": 3,
  "2026-05-28": 5, "2026-05-29": 5, "2026-05-30": 5, "2026-05-31": 5,
  // Juin 2026 — ascension + WE prolongés
  "2026-06-01": 5, "2026-06-02": 5,
  "2026-06-13": 4, "2026-06-14": 4, "2026-06-15": 4,
  "2026-06-20": 6, "2026-06-21": 6, "2026-06-22": 6,
  // Juillet 2026 — départs en vacances, ça se remplit
  "2026-07-01": 5, "2026-07-02": 5, "2026-07-03": 5,
  "2026-07-04": 7, "2026-07-05": 7, "2026-07-06": 7, "2026-07-07": 7,
  "2026-07-08": 7, "2026-07-09": 7, "2026-07-10": 6,
  "2026-07-14": 5, "2026-07-15": 5, "2026-07-16": 5,
  "2026-07-20": 6, "2026-07-21": 6, "2026-07-22": 6, "2026-07-23": 6,
  "2026-07-24": 6, "2026-07-25": 5,
  // Août — encore plein
  "2026-08-01": 7, "2026-08-02": 7, "2026-08-03": 7, "2026-08-04": 7,
  "2026-08-05": 7, "2026-08-06": 7, "2026-08-07": 7, "2026-08-08": 7,
  "2026-08-15": 6, "2026-08-16": 6, "2026-08-17": 6,
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MONTHS_SHORT = [
  "jan", "fév", "mars", "avr", "mai", "juin",
  "juil", "août", "sept", "oct", "nov", "déc",
];

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function frLabel(d: Date): string {
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

type DayCell = {
  date: Date;
  iso: string;
  isCurrentMonth: boolean;
  isPast: boolean;
  occupancy: number;
  isFull: boolean;
};

function buildMonthGrid(year: number, monthIndex: number, today: Date): DayCell[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  // Lundi = 0, dimanche = 6
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: DayCell[] = [];

  // Padding début (jours du mois précédent)
  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const d = new Date(year, monthIndex, -i);
    cells.push(buildCell(d, today, false));
  }
  // Jours du mois courant
  for (let day = 1; day <= daysInMonth; day += 1) {
    const d = new Date(year, monthIndex, day);
    cells.push(buildCell(d, today, true));
  }
  // Padding fin (jours du mois suivant) — 6 lignes × 7 = 42 cellules max
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() + 1,
    );
    cells.push(buildCell(next, today, false));
    if (cells.length >= 42) break;
  }
  return cells;
}

function buildCell(d: Date, today: Date, isCurrent: boolean): DayCell {
  const iso = isoDate(d);
  const occupancy = FUTURE_OCCUPANCY[iso] ?? 0;
  return {
    date: d,
    iso,
    isCurrentMonth: isCurrent,
    isPast: d.getTime() < startOfDay(today).getTime(),
    occupancy,
    isFull: occupancy >= CAPACITY,
  };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function DateRangePicker({
  startName = "startDate",
  endName = "endDate",
  initialMonth,
  initialStart = null,
  initialEnd = null,
}: {
  startName?: string;
  endName?: string;
  /** Mois initialement affiché. Par défaut, le mois de la date d'arrivée
   * pré-sélectionnée si fournie, sinon le mois en cours. */
  initialMonth?: Date;
  /** Plage pré-sélectionnée (édition d'une demande existante). */
  initialStart?: Date | null;
  initialEnd?: Date | null;
}) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<Date>(
    () => initialMonth ?? startOfMonth(initialStart ?? today),
  );
  const [start, setStart] = useState<Date | null>(() => initialStart);
  const [end, setEnd] = useState<Date | null>(() => initialEnd);
  const [hovered, setHovered] = useState<Date | null>(null);

  const nights = start && end ? daysBetween(start, end) : 0;

  function selectDay(d: Date) {
    // Click 1 OU reset après une plage complète → set start
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
      return;
    }
    // Click 2 → end (ou re-start si avant le start)
    if (d.getTime() < start.getTime()) {
      setStart(d);
      setEnd(null);
    } else if (d.getTime() === start.getTime()) {
      // Click sur le même jour → reset
      setStart(null);
      setEnd(null);
    } else {
      setEnd(d);
    }
  }

  // Plage visuelle au survol — `previewEnd` est ce qui sert à highlight
  // entre start (sélectionné) et le curseur.
  const previewEnd = end ?? hovered;

  function isInRange(d: Date): boolean {
    if (!start || !previewEnd) return false;
    return (
      d.getTime() > start.getTime() &&
      d.getTime() < previewEnd.getTime()
    );
  }

  const view2 = addMonths(view, 1);

  return (
    <div className="space-y-4">
      <input type="hidden" name={startName} value={start ? isoDate(start) : ""} />
      <input type="hidden" name={endName} value={end ? isoDate(end) : ""} />

      {/* Header — nav + récap de la plage */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView(addMonths(view, -1))}
            aria-label="Mois précédent"
            className="grid size-9 place-items-center rounded-md border border-cp-ink/40 bg-cp-paper text-cp-ink outline-none transition-colors hover:border-cp-cobalt hover:bg-cp-cobalt hover:text-cp-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cp-paprika"
          >
            <ChevronLeft className="size-4" strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setView(addMonths(view, 1))}
            aria-label="Mois suivant"
            className="grid size-9 place-items-center rounded-md border border-cp-ink/40 bg-cp-paper text-cp-ink outline-none transition-colors hover:border-cp-cobalt hover:bg-cp-cobalt hover:text-cp-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cp-paprika"
          >
            <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        <div className="text-right">
          {start && end ? (
            <p className="font-body text-sm text-cp-ink">
              <span className="font-semibold">
                Du {frLabel(start)} au {frLabel(end)}
              </span>
              <span className="text-cp-ink-soft">
                , {nights} nuit{nights > 1 ? "s" : ""}
              </span>
            </p>
          ) : start ? (
            <p className="font-body text-sm text-cp-ink-soft">
              Arrivée le <span className="font-semibold text-cp-ink">{frLabel(start)}</span>.{" "}
              <span className="font-semibold text-cp-cobalt">Cliquez sur le jour de départ.</span>
            </p>
          ) : (
            <p className="font-body text-sm font-semibold text-cp-cobalt">
              Cliquez sur le jour d&apos;arrivée.
            </p>
          )}
        </div>
      </div>

      {/* Calendriers — 2 mois en grille, stack sur mobile */}
      <div
        className="grid gap-4 sm:grid-cols-2"
        onMouseLeave={() => setHovered(null)}
      >
        <MonthCalendar
          year={view.getFullYear()}
          monthIndex={view.getMonth()}
          today={today}
          start={start}
          end={end}
          onSelect={selectDay}
          onHover={setHovered}
          isInRange={isInRange}
        />
        <MonthCalendar
          year={view2.getFullYear()}
          monthIndex={view2.getMonth()}
          today={today}
          start={start}
          end={end}
          onSelect={selectDay}
          onHover={setHovered}
          isInRange={isInRange}
        />
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-cp-ink/20 pt-4">
        <Legend label="Disponible" tint="ok" />
        <Legend label="Dernière place restante" tint="last" />
        <Legend label="Complet" tint="full" />
      </div>

      {start && (
        <button
          type="button"
          onClick={() => {
            setStart(null);
            setEnd(null);
          }}
          className="font-body text-sm font-semibold text-cp-paprika underline underline-offset-4 decoration-[1.5px] hover:decoration-[2.5px]"
        >
          Réinitialiser la sélection
        </button>
      )}
    </div>
  );
}

function MonthCalendar({
  year,
  monthIndex,
  today,
  start,
  end,
  onSelect,
  onHover,
  isInRange,
}: {
  year: number;
  monthIndex: number;
  today: Date;
  start: Date | null;
  end: Date | null;
  onSelect: (d: Date) => void;
  onHover: (d: Date | null) => void;
  isInRange: (d: Date) => boolean;
}) {
  const cells = buildMonthGrid(year, monthIndex, today);
  const rows = chunk(cells, 7);

  return (
    <div className="rounded-md border border-cp-ink bg-cp-paper">
      <header className="border-b border-cp-ink px-4 py-3">
        <p className="font-display text-xl italic leading-none tracking-tight text-cp-ink">
          {MONTHS[monthIndex]} {year}
        </p>
      </header>
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {WEEKDAYS.map((w) => (
              <th
                key={w}
                scope="col"
                className="border-b border-cp-ink/20 px-1 py-2 text-center font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
              >
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={`${monthIndex}-${rIdx}`}>
              {row.map((cell) => {
                const isStart = start && cell.iso === isoDate(start);
                const isEnd = end && cell.iso === isoDate(end);
                const inRange = isInRange(cell.date);
                const disabled =
                  !cell.isCurrentMonth || cell.isPast || cell.isFull;

                return (
                  <td key={cell.iso} className="p-0">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(cell.date)}
                      onMouseEnter={() => onHover(cell.date)}
                      onFocus={() => onHover(cell.date)}
                      className={cn(
                        "relative flex aspect-square w-full flex-col items-center justify-between p-1.5 text-center transition-colors outline-none focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cp-paprika",
                        // Hors mois → invisible
                        !cell.isCurrentMonth && "opacity-25 pointer-events-none",
                        // Passé / complet → mute
                        (cell.isPast || cell.isFull) && cell.isCurrentMonth &&
                          "text-cp-mute cursor-not-allowed",
                        // Sélectionné start/end → cobalt fill (bleu)
                        (isStart || isEnd) && "bg-cp-cobalt text-cp-paper font-semibold",
                        // Dans la plage → cobalt light
                        inRange && !isStart && !isEnd && "bg-cp-cobalt-light text-cp-ink",
                        // Disponible (par défaut) → hover paper-deep
                        !disabled && !isStart && !isEnd && !inRange &&
                          "hover:bg-cp-paper-deep",
                        // Dernière place restante (1 seule chambre libre) → tint ambre
                        !isStart &&
                          !isEnd &&
                          !inRange &&
                          !disabled &&
                          cell.occupancy === CAPACITY - 1 &&
                          "bg-cp-canari-light/60",
                      )}
                    >
                      <span className="font-mono text-xs font-semibold leading-none">
                        {cell.date.getDate()}
                      </span>
                      {cell.isCurrentMonth && cell.occupancy > 0 && (
                        <span
                          aria-hidden
                          className={cn(
                            "h-0.5 w-6 rounded-full",
                            cell.isFull
                              ? "bg-cp-paprika" // Complet
                              : cell.occupancy === CAPACITY - 1
                                ? "bg-cp-canari-deep" // Dernière place restante
                                : "bg-cp-feuille", // Disponible
                          )}
                        />
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Legend({
  label,
  tint,
}: {
  label: string;
  tint: "ok" | "last" | "full";
}) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className={cn(
          "inline-block size-3 rounded-sm border border-cp-ink/30",
          tint === "ok" && "bg-cp-feuille",
          tint === "last" && "bg-cp-canari-deep",
          tint === "full" && "bg-cp-paprika",
        )}
      />
      <span className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cp-ink-soft">
        {label}
      </span>
    </span>
  );
}
