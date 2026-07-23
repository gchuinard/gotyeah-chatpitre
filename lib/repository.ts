import type {
  Appointment,
  Booking,
  BookingCat,
  BookingExtra,
  BookingMessage,
  BookingStatus,
  Cat,
  CatDocument,
  StayUpdate,
  User,
} from "@prisma/client";

import { Prisma } from "@prisma/client";

import type { CatCardProps } from "@/components/cat-card";
import { prisma } from "@/lib/db";
import { SETTINGS, withFallbacks, type SettingKey } from "@/lib/settings";

// Helpers de formatage : réexportés depuis lib/format pour le confort
// des consommateurs, mais le code de formatage lui-même vit dans un
// module sans dépendance Prisma (utilisable en Client Component).
export {
  ageLabel,
  displayRef,
  formatDate,
  formatDateTime,
  formatEuros,
  formatShortDate,
  nightsBetween,
  relativeTime,
  todayInputDate,
  toInputDate,
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
    passedAway: cat.passedAwayAt !== null,
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
  cats: (BookingCat & { cat: Cat })[];
  extras: BookingExtra[];
  user: User;
  messages: (BookingMessage & { author: { firstName: string; lastName: string } })[];
};

const BOOKING_INCLUDE = {
  // Ordre stable et explicite : sans `orderBy`, Postgres renvoie les lignes
  // dans leur ordre physique, qui change dès qu'on met une ligne à jour. Les
  // cartes pensionnaires sautaient donc à chaque enregistrement d'avis.
  cats: { include: { cat: true }, orderBy: { cat: { name: "asc" } } },
  extras: { orderBy: { sortOrder: "asc" } },
  user: true,
  messages: {
    include: { author: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "asc" },
  },
} as const;

/// Tous les chats d'un propriétaire, triés par création.
///
/// `includePassedAway` distingue les deux usages. La troupe du tableau de bord
/// montre TOUS les chats, y compris ceux qui sont partis : les faire
/// disparaître de son espace reviendrait à effacer le souvenir sans le
/// demander. Le formulaire de réservation, lui, ne doit proposer que ceux qu'on
/// peut encore confier.
export function getCatsByOwner(
  ownerId: string,
  { includePassedAway = true }: { includePassedAway?: boolean } = {},
): Promise<Cat[]> {
  return prisma.cat.findMany({
    where: { ownerId, ...(includePassedAway ? {} : { passedAwayAt: null }) },
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

/// Détail d'un compte client pour l'admin : ses chats et ses séjours (avec les
/// chats de chaque séjour), pour la fiche /admin/clients/[id].
export function getClientForAdmin(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      cats: { orderBy: { name: "asc" } },
      bookings: {
        orderBy: { startDate: "desc" },
        include: {
          // Même ordre stable que `BOOKING_INCLUDE`, sinon la fiche client
          // affiche les pensionnaires dans un ordre qui saute.
          cats: {
            include: { cat: { select: { id: true, name: true } } },
            orderBy: { cat: { name: "asc" } },
          },
        },
      },
    },
  });
}

// =========================================================================
// Encaissements
// =========================================================================

/// Recale `Booking.paidAmount` sur la somme des versements du séjour.
///
/// À appeler dans la MÊME transaction que toute écriture de versement : ce
/// champ est un cache, il ne doit jamais diverger de sa source. On l'entretient
/// plutôt que de le supprimer parce que la liste des séjours et la fiche client
/// n'ont besoin que du total, et n'ont ainsi rien à agréger elles-mêmes.
export async function syncBookingPaidAmount(
  tx: Prisma.TransactionClient,
  bookingId: string,
): Promise<void> {
  // Verrou de ligne AVANT l'agrégation. PostgreSQL est en « read committed » :
  // sans lui, deux versements enregistrés au même instant calculeraient chacun
  // leur somme sans voir l'insertion de l'autre, et le second commit écraserait
  // le premier avec un total trop bas. On perdrait un versement à l'écran alors
  // que sa ligne existe, et rien ne le signalerait.
  await tx.$executeRaw`SELECT "id" FROM "Booking" WHERE "id" = ${bookingId} FOR UPDATE`;

  const total = await tx.bookingPayment.aggregate({
    where: { bookingId },
    _sum: { amount: true },
  });
  await tx.booking.update({
    where: { id: bookingId },
    data: { paidAmount: total._sum.amount ?? new Prisma.Decimal(0) },
  });
}

/// Versements d'un séjour, du plus récent au plus ancien.
export function getPaymentsForBooking(bookingId: string) {
  return prisma.bookingPayment.findMany({
    where: { bookingId },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    include: { recordedBy: { select: { firstName: true } } },
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
    label: n.title + (n.body ? ` : ${n.body}` : ""),
    timeAgo: _relativeTime(n.createdAt),
    unread: n.readAt === null,
    href: n.link ?? undefined,
  }));
}

// =========================================================================
// Télé-rendez-vous (visioconférence)
// =========================================================================

export type AppointmentWithRelations = Appointment & {
  client: User;
  booking: Booking | null;
};

/// Récupère un rdv par id avec vérification d'accès : renvoyé si l'utilisateur
/// en est le client OU s'il est admin. Sinon null (équivalent 404 pour la page
/// ou la route de signaling).
export async function getAppointmentFor(
  id: string,
  userId: string,
  isAdmin: boolean,
): Promise<AppointmentWithRelations | null> {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { client: true, booking: true },
  });
  if (!appointment) return null;
  if (!isAdmin && appointment.clientId !== userId) return null;
  return appointment;
}

/// Tous les rdv d'un séjour, du plus proche au plus lointain.
export function getAppointmentsForBooking(bookingId: string): Promise<Appointment[]> {
  return prisma.appointment.findMany({
    where: { bookingId },
    orderBy: { scheduledAt: "asc" },
  });
}

// =========================================================================
// Documents des chats
// =========================================================================

export type CatDocumentWithCat = CatDocument & { cat: Cat };

/// Récupère un chat par id avec vérification d'accès : renvoyé si l'utilisateur
/// en est le propriétaire OU s'il est admin. Sinon null (404 pour la page/route).
export async function getCatFor(
  id: string,
  userId: string,
  isAdmin: boolean,
): Promise<Cat | null> {
  const cat = await prisma.cat.findUnique({ where: { id } });
  if (!cat) return null;
  if (!isAdmin && cat.ownerId !== userId) return null;
  return cat;
}

/// Chats proposables à l'upload depuis un rdv : ceux du séjour s'il est rattaché,
/// sinon tous les chats du client (cas d'un appel-conseil sans séjour).
export async function getCatsForBookingOrOwner(
  bookingId: string | null,
  ownerId: string,
): Promise<{ id: string; name: string }[]> {
  if (bookingId) {
    const links = await prisma.bookingCat.findMany({
      where: { bookingId },
      include: { cat: { select: { id: true, name: true } } },
      orderBy: { cat: { name: "asc" } },
    });
    return links.map((l) => l.cat);
  }
  return prisma.cat.findMany({
    where: { ownerId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

/// Documents d'un chat, groupés par type puis du plus récent au plus ancien.
export function getDocumentsForCat(catId: string): Promise<CatDocument[]> {
  return prisma.catDocument.findMany({
    where: { catId },
    orderBy: [{ type: "asc" }, { createdAt: "desc" }],
  });
}

/// Récupère un document par id (avec son chat) et vérifie l'accès : propriétaire
/// du chat OU admin. Sinon null. Sert le download et la suppression.
export async function getCatDocumentFor(
  id: string,
  userId: string,
  isAdmin: boolean,
): Promise<CatDocumentWithCat | null> {
  const doc = await prisma.catDocument.findUnique({
    where: { id },
    include: { cat: true },
  });
  if (!doc) return null;
  if (!isAdmin && doc.cat.ownerId !== userId) return null;
  return doc;
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

/// Lit tous les réglages de la pension en UNE requête, complétés par leurs
/// valeurs de repli.
///
/// Vit ICI et non dans lib/settings.ts : ce dernier est importé par des
/// composants client, qui ont besoin des libellés et du formatage. Y mettre
/// cette requête embarquerait Prisma et le pilote PostgreSQL dans le paquet du
/// navigateur, ce qui ne compile pas.
///
/// Une seule requête et non une par clé : la fiche d'un séjour en lit quatre
/// et l'écran de réglages les sept.
export async function readSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: SETTINGS.map((s) => s.key) } },
  });
  return withFallbacks(new Map(rows.map((r) => [r.key, r.value])));
}

/// Tous les versements d'une période, avec leur séjour et leur client.
///
/// Bornes NULLES pour « depuis le début ». Les séjours archivés et clôturés
/// sont inclus : la comptabilité ne s'efface pas au bout de trente jours.
export async function getPaymentsForPeriod(from: Date | null, to: Date | null) {
  return prisma.bookingPayment.findMany({
    where:
      from && to ? { paidAt: { gte: from, lt: to } } : {},
    orderBy: { paidAt: "desc" },
    include: {
      booking: {
        select: {
          id: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      recordedBy: { select: { firstName: true } },
    },
  });
}

/// Reste dû global : ce qui a été facturé et pas encore encaissé.
///
/// Les séjours ANNULÉS sont exclus : leur solde n'est réclamé à personne, le
/// compter gonflerait artificiellement ce qu'on croit avoir à recouvrer.
export async function getOutstandingCents(): Promise<number> {
  const bookings = await prisma.booking.findMany({
    where: { status: { notIn: ["CANCELLED", "REJECTED"] }, totalAmount: { not: null } },
    select: { totalAmount: true, paidAmount: true },
  });
  let cents = 0;
  for (const b of bookings) {
    const total = Math.round(Number(b.totalAmount ?? 0) * 100);
    const paid = Math.round(Number(b.paidAmount ?? 0) * 100);
    // Un trop-perçu ne compense PAS le reste dû d'un autre séjour : ce sont
    // deux dossiers distincts, et les mélanger cacherait une créance réelle.
    if (total > paid) cents += total - paid;
  }
  return cents;
}
