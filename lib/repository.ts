import type {
  Booking,
  BookingExtra,
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
  relativeTime,
} from "@/lib/format";
import {
  ageLabel as _ageLabel,
  displayRef as _displayRef,
  relativeTime as _relativeTime,
} from "@/lib/format";

import type { NotificationItem } from "@/components/notification-bell";

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
  extras: BookingExtra[];
  user: User;
  messages: (BookingMessage & { author: { firstName: string; lastName: string } })[];
};

const BOOKING_INCLUDE = {
  cats: { include: { cat: true } },
  extras: { orderBy: { sortOrder: "asc" } },
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

/// Catalogue des presets de suppléments, trié — proposé au client dans le
/// formulaire de demande de séjour (options à cocher avec prix indicatif).
export function getExtraPresets() {
  return prisma.extraPreset.findMany({ orderBy: { sortOrder: "asc" } });
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
// Occupancy
// =========================================================================

export type DayOccupancy = {
  day: number;
  count: number;
  intensity: "low" | "medium" | "high";
};

/// Calcule l'occupation jour par jour d'un mois donné, à partir des
/// bookings ACCEPTED qui chevauchent ce mois. Capacité maison = 7.
export async function getMonthOccupancy(
  year: number,
  monthIndex: number,
): Promise<DayOccupancy[]> {
  const monthStart = new Date(Date.UTC(year, monthIndex, 1));
  const nextMonthStart = new Date(Date.UTC(year, monthIndex + 1, 1));
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const bookings = await prisma.booking.findMany({
    where: {
      status: "ACCEPTED",
      startDate: { lt: nextMonthStart },
      endDate: { gte: monthStart },
    },
    select: {
      startDate: true,
      endDate: true,
      cats: { select: { catId: true } },
    },
  });

  const out: DayOccupancy[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(year, monthIndex, day));
    const count = bookings
      .filter((b) => b.startDate <= date && date < b.endDate)
      .reduce((sum, b) => sum + b.cats.length, 0);

    if (count === 0) continue;
    out.push({
      day,
      count,
      intensity: count >= 6 ? "high" : count >= 4 ? "medium" : "low",
    });
  }
  return out;
}

// =========================================================================
// Comptes (admin)
// =========================================================================

export type ClientWithCounts = User & {
  catCount: number;
  bookingCount: number;
};

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/// Liste les comptes clients (non admin) avec leur nombre de chats et
/// de séjours pour la table /admin/clients.
export async function getAllClients(): Promise<ClientWithCounts[]> {
  const adminEmails = getAdminEmails();
  const users = await prisma.user.findMany({
    where: {
      email: { notIn: adminEmails.length > 0 ? adminEmails : [""] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cats: true, bookings: true } },
    },
  });
  return users.map((u) => ({
    ...u,
    catCount: u._count.cats,
    bookingCount: u._count.bookings,
  }));
}

/// Compte total des comptes clients (hors admin).
export function countClients(): Promise<number> {
  const adminEmails = getAdminEmails();
  return prisma.user.count({
    where: {
      email: { notIn: adminEmails.length > 0 ? adminEmails : [""] },
    },
  });
}

// =========================================================================
// Notifications (in-app)
// =========================================================================

/// Renvoie les notifications récentes d'un utilisateur, formatées pour
/// le composant `NotificationBell`. Triées par date desc, limitées à 10.
export async function getNotificationsFor(
  userId: string,
): Promise<NotificationItem[]> {
  const notifs = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return notifs.map((n) => ({
    id: n.id,
    label: n.title + (n.body ? ` — ${n.body}` : ""),
    timeAgo: _relativeTime(n.createdAt),
    unread: n.readAt === null,
    href: n.link ?? undefined,
  }));
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
