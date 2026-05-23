import { cn } from "@/lib/utils";

/// Les 6 statuts de réservation, version brutalist editorial : un numéro
/// d'ordre, un label en mono caps, et une variante visuelle qui suit la
/// gravité de l'état. Sanguine n'est utilisée qu'aux moments forts
/// (besoin du client, refus) ; le reste joue sur le contraste encre/papier.
export type BookingStatus =
  | "PENDING"
  | "QUESTION_ASKED"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

type Config = {
  index: string;
  label: string;
  classes: string;
};

const STATUS_CONFIG: Record<BookingStatus, Config> = {
  // En attente — fiche déposée, en cours de lecture.
  PENDING: {
    index: "01",
    label: "En attente",
    classes: "border-cp-ink text-cp-ink bg-cp-paper",
  },
  // Question posée — la maison attend une réponse du client (sanguine outline).
  QUESTION_ASKED: {
    index: "02",
    label: "Question posée",
    classes: "border-cp-sanguine text-cp-sanguine bg-cp-paper",
  },
  // Acceptée — séjour confirmé, encre pleine (engagement institutionnel).
  ACCEPTED: {
    index: "03",
    label: "Acceptée",
    classes: "border-cp-ink bg-cp-ink text-cp-paper",
  },
  // Refusée — sanguine pleine, accent du refus.
  REJECTED: {
    index: "04",
    label: "Refusée",
    classes: "border-cp-sanguine bg-cp-sanguine text-cp-paper",
  },
  // Annulée — état neutre estompé.
  CANCELLED: {
    index: "05",
    label: "Annulée",
    classes: "border-cp-mute text-cp-mute bg-cp-paper",
  },
  // Terminée — séjour passé, encre estompée.
  COMPLETED: {
    index: "06",
    label: "Terminée",
    classes: "border-cp-ink-soft text-cp-ink-soft bg-cp-paper",
  },
};

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const { index, label, classes } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em]",
        classes,
        className,
      )}
    >
      <span aria-hidden className="opacity-70">
        {index}
      </span>
      <span aria-hidden className="h-[0.7em] w-px bg-current opacity-50" />
      <span>{label}</span>
    </span>
  );
}
