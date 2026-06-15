import { differenceInCalendarDays } from "date-fns";
import { Prisma, type ExtraUnit } from "@prisma/client";
import { prisma } from "@/lib/db";
import { extraUnitMultiplier } from "@/lib/extras";

// Calcul de la tarification d'un séjour. Les tarifs « vivants » sont stockés
// dans la table Setting (modifiables côté admin) ; un repli codé en dur évite
// tout plantage si une clé venait à manquer.

const DEFAULTS = {
  price_first_cat: "16",
  price_extra_cat: "13",
  deposit_percentage: "20",
} as const;

type SettingKey = keyof typeof DEFAULTS;

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

/// Lit un réglage dans la table Setting, avec repli sur la valeur par défaut.
async function readSetting(key: SettingKey): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? DEFAULTS[key];
}

/// Calcule la tarification d'un séjour : nuitées × (1er chat + chats
/// supplémentaires), puis l'acompte. `catCount` doit être >= 1.
export async function computeBookingPricing(
  startDate: Date,
  endDate: Date,
  catCount: number,
): Promise<BookingPricing> {
  const nights = differenceInCalendarDays(endDate, startDate);

  const pricePerFirstCat = new Prisma.Decimal(await readSetting("price_first_cat"));
  const pricePerExtraCat = new Prisma.Decimal(await readSetting("price_extra_cat"));
  const depositPercentage = Number(await readSetting("deposit_percentage"));

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
