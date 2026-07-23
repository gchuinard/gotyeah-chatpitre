import Link from "next/link";

import { RuledBox } from "@/components/ruled-box";
import { displayRef } from "@/lib/format";
import { formatTime, formatWindow } from "@/lib/settings";
import { cn } from "@/lib/utils";

/// « Aujourd'hui » — ce qui se passe dans la journée.
///
/// À ne pas confondre avec « À traiter », juste à côté, qui répond à une autre
/// question. « À traiter » liste ce qu'il faut DÉCIDER : une demande à
/// trancher, un message à lire. « Aujourd'hui » liste ce qui ARRIVE : une
/// arrivée à 9h ne demande aucune décision, mais elle demande d'être là.
///
/// Le panneau n'a AUCUN stockage propre. Il agrège trois sources qui existent
/// déjà : les arrivées et départs calculés depuis les séjours, les notes posées
/// sur un séjour, et les messages clients non lus. Un second système de tâches
/// aurait créé deux endroits où noter la même chose.

export type TodayItem = {
  bookingId: string;
  kind: "arrival" | "departure" | "note" | "unread";
  /// Chats concernés, déjà joints côté serveur.
  cats: string;
  clientName: string;
  /// Heure convenue, sinon null pour suivre le créneau habituel.
  time: string | null;
  /// Le mot laissé sur le séjour, pour les lignes « note ».
  note: string | null;
};

const KIND_LABEL: Record<TodayItem["kind"], string> = {
  arrival: "Arrivée",
  departure: "Départ",
  note: "Note",
  unread: "Message non lu",
};

const KIND_TONE: Record<TodayItem["kind"], string> = {
  arrival: "border-cp-paprika bg-cp-paprika text-cp-paper",
  departure: "border-cp-cobalt bg-cp-cobalt text-cp-paper",
  note: "border-cp-paprika text-cp-paprika",
  unread: "border-cp-paprika bg-cp-paprika text-cp-paper",
};

export function TodayPanel({
  items,
  arrivalWindow,
  departureWindow,
}: {
  items: TodayItem[];
  arrivalWindow: { start: string; end: string };
  departureWindow: { start: string; end: string };
}) {
  if (items.length === 0) {
    return (
      <RuledBox variant="deep">
        <p className="font-display text-2xl italic text-cp-ink">
          Rien de prévu aujourd&apos;hui.
        </p>
      </RuledBox>
    );
  }

  return (
    <ul className="border-t border-cp-ink">
      {items.map((item) => (
        <li
          key={`${item.kind}-${item.bookingId}`}
          className="border-b border-cp-ink/30"
        >
          <Link
            href={
              // Un message non lu s'ouvre directement sur le fil : sans ça, on
              // atterrit sur l'onglet où la conversation n'est pas rendue.
              item.kind === "unread"
                ? `/admin/bookings/${item.bookingId}?onglet=contact`
                : `/admin/bookings/${item.bookingId}`
            }
            className="block py-4 pr-4 transition-colors hover:bg-cp-paper-deep/40"
          >
            <div className="grid gap-3 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:gap-5">
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em]",
                  KIND_TONE[item.kind],
                )}
              >
                {KIND_LABEL[item.kind]}
              </span>

              <div className="min-w-0 space-y-0.5">
                <p className="font-display text-lg italic leading-tight text-cp-ink">
                  {item.cats}
                </p>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
                  N°{displayRef(item.bookingId)} · {item.clientName}
                </p>
              </div>

              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-cp-ink-soft sm:text-right">
                {item.kind === "arrival" || item.kind === "departure"
                  ? item.time
                    ? `à ${formatTime(item.time)}`
                    : formatWindow(
                        item.kind === "arrival" ? arrivalWindow.start : departureWindow.start,
                        item.kind === "arrival" ? arrivalWindow.end : departureWindow.end,
                      )
                  : ""}
              </p>
            </div>

            {/* Le mot est affiché en clair : c'est tout l'intérêt de le
                remonter ici plutôt que de renvoyer vers la fiche. */}
            {item.note && (
              <p className="mt-2 border-l-2 border-cp-paprika pl-3 font-body text-sm italic text-cp-ink-soft">
                {item.note}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
