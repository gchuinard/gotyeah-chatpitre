import type {
  Booking,
  BookingMessage,
  BookingStatus,
  Cat,
  StayUpdate,
  User,
} from "@prisma/client";

import type { CatCardProps } from "@/components/cat-card";
import { prisma } from "@/lib/db";

// Helpers de formatage : réexportés depuis lib/format pour le confort
// des consommateurs, mais le code de formatage lui-même vit dans un
// module sans dépendance Prisma (utilisable en Client Component).
export {
  ageLabel,
  displayRef,
  formatDate,
  formatDateTime,
  formatShortDate,
  nightsBetween,
} from "@/lib/format";
import { displayRef as _displayRef, ageLabel as _ageLabel } from "@/lib/format";

// =========================================================================
// Adaptateurs Prisma → composants UI
// =========================================================================

/// Conversion d'un `Cat` Prisma vers les props attendus par `<CatCard />`.
export function toCatCardProps(cat: Cat): CatCardProps {
  return {
    reference: _displayRef(cat.id),
    name: cat.name,
    sex: cat.sex,
    breed: cat.breed,
    ageLabel: _ageLabel(cat.birthDate),
    photoUrl: cat.photoUrl,
    criteria: {
      sterilized: cat.isSterilized,
      identified: cat.isIdentified,
      vaccines: cat.vaccinesUpToDate,
      sociable: cat.isSociable,
    },
  };
}

// =========================================================================
// Sélecteurs (chats, séjours, carnets, pensionnaires en cours)
// =========================================================================

export type BookingWithRelations = Booking & {
  cats: { cat: Cat }[];
  user: User;
  messages: (BookingMessage & { author: { firstName: string; lastName: string } })[];
};

const BOOKING_INCLUDE = {
  cats: { include: { cat: true } },
  user: true,
  messages: {
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "asc" },
  },
} as const;

/// Tous les chats d'un propriétaire, triés par création.
export function getCatsByOwner(ownerId: string): Promise<Cat[]> {
  return prisma.cat.findMany({
    where: { ownerId },
    orderBy: { createdAt: "asc" },
  });
}

/// Tous les séjours d'un propriétaire, statut prioritaire d'abord puis date
/// décroissante (les plus récents/proches en haut).
export async function getBookingsByOwner(
  ownerId: string,
): Promise<BookingWithRelations[]> {
  const bookings = await prisma.booking.findMany({
    where: { userId: ownerId },
    include: BOOKING_INCLUDE,
    orderBy: [{ startDate: "desc" }],
  });
  return sortByStatusPriority(bookings);
}

/// Tous les séjours (admin), triés par priorité de traitement.
export async function getAllBookings(): Promise<BookingWithRelations[]> {
  const bookings = await prisma.booking.findMany({
    include: BOOKING_INCLUDE,
    orderBy: [{ startDate: "desc" }],
  });
  return sortByStatusPriority(bookings);
}

/// Récupère un séjour par son id, avec vérification d'accès : le séjour est
/// renvoyé si l'utilisateur en est le propriétaire OU s'il est admin. Sinon
/// renvoie null (équivalent à un 404 pour la page).
export async function getBookingFor(
  id: string,
  userId: string,
  isAdmin: boolean,
): Promise<BookingWithRelations | null> {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: BOOKING_INCLUDE,
  });
  if (!booking) return null;
  if (!isAdmin && booking.userId !== userId) return null;
  return booking;
}

/// Renvoie le « prochain » séjour actionnable d'un client : statut
/// PENDING / QUESTION_ASKED / ACCEPTED, date de fin >= aujourd'hui, et
/// trié par date de début. Utilisé sur la home du dashboard.
export async function getNextBookingFor(
  ownerId: string,
): Promise<BookingWithRelations | null> {
  const today = startOfDayUTC(new Date());
  return prisma.booking.findFirst({
    where: {
      userId: ownerId,
      status: { in: ["PENDING", "QUESTION_ASKED", "ACCEPTED"] },
      endDate: { gte: today },
    },
    include: BOOKING_INCLUDE,
    orderBy: [{ startDate: "asc" }],
  });
}

// =========================================================================
// Pensionnaires actuellement en séjour (mur public + admin)
// =========================================================================

export type CurrentResident = {
  cat: Cat;
  booking: BookingWithRelations;
  owner: User;
};

/// Renvoie les chats en séjour ACCEPTED qui chevauchent la date donnée
/// (par défaut aujourd'hui). Dédupliqué par chat.
export async function getCurrentResidents(
  referenceDate: Date = new Date(),
): Promise<CurrentResident[]> {
  const day = startOfDayUTC(referenceDate);
  const bookings = await prisma.booking.findMany({
    where: {
      status: "ACCEPTED",
      startDate: { lte: day },
      endDate: { gte: day },
    },
    include: BOOKING_INCLUDE,
  });

  const seen = new Set<string>();
  const residents: CurrentResident[] = [];
  for (const b of bookings) {
    for (const link of b.cats) {
      if (seen.has(link.cat.id)) continue;
      seen.add(link.cat.id);
      residents.push({ cat: link.cat, booking: b, owner: b.user });
    }
  }
  return residents;
}

// =========================================================================
// Carnet de séjour
// =========================================================================

export type StayUpdateWithCat = StayUpdate & { cat: Cat };

/// Toutes les entrées de carnet pour un séjour, triées de la plus récente
/// à la plus ancienne.
export function getStayUpdates(
  bookingId: string,
): Promise<StayUpdateWithCat[]> {
  return prisma.stayUpdate.findMany({
    where: { bookingId },
    include: { cat: true },
    orderBy: { createdAt: "desc" },
  });
}

/// Les entrées de carnet les plus récentes tous séjours confondus —
/// utile pour un fil d'activité côté admin.
export function getRecentStayUpdates(limit = 5) {
  return prisma.stayUpdate.findMany({
    include: { cat: true, booking: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// =========================================================================
// Internes
// =========================================================================

const STATUS_PRIORITY: Record<BookingStatus, number> = {
  QUESTION_ASKED: 0,
  PENDING: 1,
  ACCEPTED: 2,
  COMPLETED: 3,
  CANCELLED: 4,
  REJECTED: 5,
};

function sortByStatusPriority<B extends { status: BookingStatus; startDate: Date }>(
  bookings: B[],
): B[] {
  return [...bookings].sort((a, b) => {
    const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (byStatus !== 0) return byStatus;
    return b.startDate.getTime() - a.startDate.getTime();
  });
}

function startOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
  );
}
