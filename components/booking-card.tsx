import Link from "next/link";

import {
  BookingStatusBadge,
  type BookingStatus,
} from "@/components/booking-status-badge";
import { LibraryStamp } from "@/components/library-stamp";
import { cn } from "@/lib/utils";

/// Carte séjour pour les listings (client et admin). Composition fiche
/// catalogue : numéro de référence, dates, pensionnaires, total, statut.
/// La carte entière est un lien vers le détail. Optionnellement compacte.

export type BookingCardProps = {
  reference: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  nights: number;
  catNames: string[];
  /** `null` tant que le devis n'a pas été posé par la maison. */
  total: number | null;
  ownerLabel?: string; // pour l'admin
  href: string;
  messageCount?: number;
  notes?: string;
  className?: string;
  density?: "regular" | "compact";
};

export function BookingCard({
  reference,
  status,
  startDate,
  endDate,
  nights,
  catNames,
  total,
  ownerLabel,
  href,
  messageCount = 0,
  notes,
  className,
  density = "regular",
}: BookingCardProps) {
  const compact = density === "compact";
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col border border-cp-ink bg-cp-paper text-cp-ink transition-shadow hover:shadow-[6px_6px_0_0_var(--color-cp-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cp-cobalt focus-visible:ring-offset-2 focus-visible:ring-offset-cp-paper",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-cp-ink px-5 py-3">
        <LibraryStamp>
          N°{reference}
          {ownerLabel ? ` · ${ownerLabel}` : ""}
        </LibraryStamp>
        <BookingStatusBadge status={status} />
      </div>

      <div className={cn("flex flex-col gap-3 px-5", compact ? "py-4" : "py-6")}>
        <p
          className={cn(
            "font-display italic leading-tight text-cp-ink",
            compact ? "text-xl" : "text-2xl sm:text-3xl",
          )}
        >
          Du {startDate} au {endDate}
        </p>
        <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
          {nights} nuit{nights > 1 ? "s" : ""} · {catNames.join(" · ") || "—"}
        </p>
        {notes && !compact && (
          <p className="line-clamp-2 font-body text-sm leading-relaxed text-cp-ink-soft">
            {notes}
          </p>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-cp-ink px-5 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-paprika">
            {total === null ? "Devis" : "Total"}
          </span>
          <span className="font-display text-2xl font-bold leading-none tracking-tight text-cp-ink">
            {total === null ? "—" : `${total}€`}
          </span>
        </div>
        {messageCount > 0 && (
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-cp-ink-soft">
            {messageCount} message{messageCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
