import { cn } from "@/lib/utils";

/// Les 6 statuts de réservation — version mid-century illustré. Chaque
/// statut a sa propre couleur jewel-tone qui dialogue avec le sens :
/// cobalt pour l'attente sereine, paprika pour l'action requise, feuille
/// pour la confirmation, ink pour les refus, mute pour les passés.
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
  // En attente — la fiche est lue, on patiente. Cobalt outline.
  PENDING: {
    index: "01",
    label: "En attente",
    classes: "border-cp-cobalt text-cp-cobalt bg-cp-paper",
  },
  // Question posée — paprika plein : action requise du client.
  QUESTION_ASKED: {
    index: "02",
    label: "Question posée",
    classes: "border-cp-paprika bg-cp-paprika text-cp-paper",
  },
  // Acceptée — feuille plein : le séjour est confirmé, la joie est là.
  ACCEPTED: {
    index: "03",
    label: "Acceptée",
    classes: "border-cp-feuille bg-cp-feuille text-cp-paper",
  },
  // Refusée — ink plein : le « non » est net, sobre.
  REJECTED: {
    index: "04",
    label: "Refusée",
    classes: "border-cp-ink bg-cp-ink text-cp-paper",
  },
  // Annulée — état neutre, mute outline.
  CANCELLED: {
    index: "05",
    label: "Annulée",
    classes: "border-cp-mute text-cp-mute bg-cp-paper",
  },
  // Terminée — passé serein, cobalt outline.
  COMPLETED: {
    index: "06",
    label: "Terminée",
    classes: "border-cp-cobalt text-cp-cobalt bg-cp-paper",
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
        "inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em]",
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
