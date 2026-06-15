import type { ExtraUnit } from "@prisma/client";

// Helpers purs (sans accès base) autour de l'unité de facturation des
// suppléments — partagés entre composants client et code serveur.

/// Libellé court de l'unité (affichage à côté d'un prix : « 2€/jour »).
export const EXTRA_UNIT_SHORT: Record<ExtraUnit, string> = {
  PER_DAY: "/jour",
  PER_VISIT: "/visite",
  FLAT: "forfait",
};

/// Libellé long de l'unité (légendes, facture).
export const EXTRA_UNIT_LABEL: Record<ExtraUnit, string> = {
  PER_DAY: "par jour",
  PER_VISIT: "par visite",
  FLAT: "forfait",
};

/// Options ordonnées pour un <select> d'unité.
export const EXTRA_UNIT_OPTIONS: { value: ExtraUnit; label: string }[] = [
  { value: "FLAT", label: "Forfait (séjour)" },
  { value: "PER_DAY", label: "Par jour (× nuits)" },
  { value: "PER_VISIT", label: "Par visite (× quantité)" },
];

/// Multiplicateur appliqué au prix unitaire selon l'unité : par jour → nuits,
/// par visite → quantité, forfait → 1.
export function extraUnitMultiplier(
  unit: ExtraUnit,
  quantity: number,
  nights: number,
): number {
  switch (unit) {
    case "PER_DAY":
      return nights;
    case "PER_VISIT":
      return Math.max(0, quantity);
    case "FLAT":
      return 1;
  }
}

/// Total de ligne (number, pour le calcul live côté client). `null` si le prix
/// unitaire n'est pas chiffré.
export function extraLineTotalNumber(
  unit: ExtraUnit,
  unitAmount: number | null,
  quantity: number,
  nights: number,
): number | null {
  if (unitAmount === null) return null;
  return (
    Math.round(unitAmount * extraUnitMultiplier(unit, quantity, nights) * 100) /
    100
  );
}

/// Glose lisible de la base de facturation d'une ligne, ex.
/// « 2€/jour × 4 nuits », « 30€/visite × 2 », « forfait ».
export function extraUnitGloss(
  unit: ExtraUnit,
  unitAmount: number | null,
  quantity: number,
  nights: number,
): string {
  if (unitAmount === null) return EXTRA_UNIT_LABEL[unit];
  const price = unitAmount.toLocaleString("fr-FR");
  switch (unit) {
    case "PER_DAY":
      return `${price}€/jour × ${nights} nuit${nights > 1 ? "s" : ""}`;
    case "PER_VISIT":
      return `${price}€/visite × ${quantity}`;
    case "FLAT":
      return `${price}€ forfait`;
  }
}
