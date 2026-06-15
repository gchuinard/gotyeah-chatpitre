import type { CatReviewStatus } from "@prisma/client";

// Helpers purs (sans accès base) autour de l'avis admin par chat — partagés
// entre composants client et code serveur.

/// Libellé lisible de chaque état.
export const CAT_REVIEW_LABEL: Record<CatReviewStatus, string> = {
  PENDING: "À évaluer",
  OK: "Validé",
  RESERVE: "Validé avec réserve",
  REJECTED: "Refusé",
};

/// Classes Tailwind (badge) par état — couleurs du DA.
export const CAT_REVIEW_BADGE: Record<CatReviewStatus, string> = {
  PENDING: "border-cp-mute text-cp-mute",
  OK: "border-cp-feuille bg-cp-feuille text-cp-paper",
  RESERVE: "border-cp-canari-deep bg-cp-canari text-cp-ink",
  REJECTED: "border-cp-ink bg-cp-ink text-cp-paper",
};

/// Options ordonnées pour un sélecteur d'état (hors PENDING, qui est l'état
/// initial « non évalué »).
export const CAT_REVIEW_OPTIONS: { value: CatReviewStatus; label: string }[] = [
  { value: "PENDING", label: "À évaluer" },
  { value: "OK", label: "Validé (RAS)" },
  { value: "RESERVE", label: "Validé avec réserve" },
  { value: "REJECTED", label: "Refusé" },
];
