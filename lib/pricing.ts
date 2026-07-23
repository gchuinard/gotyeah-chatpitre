import { differenceInCalendarDays } from "date-fns";
import { Prisma, type ExtraUnit } from "@prisma/client";
import { extraUnitMultiplier } from "@/lib/extras";
import { readSettings } from "@/lib/repository";

// Calcul de la tarification d'un séjour. Les tarifs « vivants » sont stockés
// dans la table Setting ; leurs valeurs de repli et leur validation vivent
// désormais dans lib/settings.ts, seul endroit qui décrive ce que la table
// contient. Ce fichier avait sa propre copie des replis, restée à 16 et 13
// alors que la production applique 22 et 18 : une base neuve aurait chiffré
// les séjours sous le tarif annoncé publiquement.

export interface BookingPricing {
  nights: number;
  pricePerFirstCat: Prisma.Decimal;
  pricePerExtraCat: Prisma.Decimal;
  depositPercentage: number;
  totalAmount: Prisma.Decimal;
  depositAmount: Prisma.Decimal;
}

/// Total d'une ligne de supplément = prix unitaire × multiplicateur. Renvoie
/// `null` si le prix unitaire n'est pas encore chiffré (demande client libre).
export function extraLineTotal(
  unit: ExtraUnit,
  unitAmount: Prisma.Decimal | number | null,
  quantity: number,
  nights: number,
): Prisma.Decimal | null {
  if (unitAmount === null) return null;
  return new Prisma.Decimal(unitAmount)
    .times(extraUnitMultiplier(unit, quantity, nights))
    .toDecimalPlaces(2);
}

/// Calcule la tarification d'un séjour : nuitées × (1er chat + chats
/// supplémentaires), puis l'acompte. `catCount` doit être >= 1.
export async function computeBookingPricing(
  startDate: Date,
  endDate: Date,
  catCount: number,
): Promise<BookingPricing> {
  const nights = differenceInCalendarDays(endDate, startDate);

  // Une seule requête pour les trois réglages, au lieu de trois.
  const settings = await readSettings();
  const pricePerFirstCat = new Prisma.Decimal(settings.price_first_cat);
  const pricePerExtraCat = new Prisma.Decimal(settings.price_extra_cat);
  const depositPercentage = Number(settings.deposit_percentage);

  const extraCats = Math.max(0, catCount - 1);
  // Tarif d'une nuit = 1er chat + chats supplémentaires.
  const perNight = pricePerFirstCat.plus(pricePerExtraCat.times(extraCats));

  const totalAmount = perNight.times(nights).toDecimalPlaces(2);
  const depositAmount = totalAmount
    .times(depositPercentage)
    .dividedBy(100)
    .toDecimalPlaces(2);

  return {
    nights,
    pricePerFirstCat,
    pricePerExtraCat,
    depositPercentage,
    totalAmount,
    depositAmount,
  };
}
