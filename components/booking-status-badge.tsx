import { cn } from "@/lib/utils";

/// Les 6 statuts de réservation, peints aux couleurs validées avec la DA.
/// Pastille outline (2 px) + tint léger + texte ink — garantit un contraste
/// AA sur fond crème, même pour le doré (qui sert ici de cadre, pas de texte).
export type BookingStatus =
  | "PENDING"
  | "QUESTION_ASKED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

type Config = { label: string; classes: string };

const STATUS_CONFIG: Record<BookingStatus, Config> = {
  PENDING: {
    label: "En attente",
    classes: "border-cp-brass bg-cp-brass/15",
  },
  QUESTION_ASKED: {
    label: "Question posée",
    classes: "border-cp-amber bg-cp-amber/15",
  },
  ACCEPTED: {
    label: "Acceptée",
    classes: "border-cp-emerald bg-cp-emerald/15",
  },
  REJECTED: {
    label: "Refusée",
    classes: "border-cp-crimson bg-cp-crimson/15",
  },
  CANCELLED: {
    label: "Annulée",
    classes: "border-cp-ink-soft bg-cp-ink-soft/15",
  },
  COMPLETED: {
    label: "Terminée",
    classes: "border-cp-midnight bg-cp-midnight/15",
  },
};

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const { label, classes } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center border-2 px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] text-cp-ink",
        classes,
        className,
      )}
    >
      {label}
    </span>
  );
}
