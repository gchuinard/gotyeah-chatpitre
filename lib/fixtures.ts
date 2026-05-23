import type { BookingStatus } from "@/components/booking-status-badge";

// Données de maquette pour la refonte UI. Aucune lecture Prisma : les
// écrans client/admin restent statiques jusqu'au prompt #3 dédié au
// câblage data. Les valeurs sont panachées pour montrer la diversité
// des états : noms variés, statuts pleins, critères mixtes, calendrier
// avec jours pleins et jours vides.

export type FixtureCat = {
  id: string;
  reference: string; // « 003 »
  name: string;
  sex: "MALE" | "FEMALE";
  breed: string;
  ageLabel: string;
  ownerId: string;
  criteria: {
    sterilized: boolean;
    identified: boolean;
    vaccines: boolean;
    sociable: boolean;
  };
};

export type FixtureMessage = {
  id: string;
  fromAdmin: boolean;
  authorLabel: string;
  body: string;
  sentAt: string; // ISO ou label libre « 12 mars · 11h30 »
};

export type FixtureBooking = {
  id: string;
  reference: string; // « 124 »
  ownerId: string;
  catIds: string[];
  startDate: string; // « 14 mars 2026 »
  endDate: string;
  nights: number;
  pricePerNight: number;
  total: number;
  status: BookingStatus;
  notes?: string;
  messages: FixtureMessage[];
};

export type FixtureClient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string; // « 10 fév 2025 »
  catCount: number;
  bookingCount: number;
};

// --- Comptes -------------------------------------------------------------
// L'utilisateur courant pointé par u-1 (les autres comptes sont en admin).

export const CURRENT_OWNER_ID = "u-1";

export const CLIENTS: FixtureClient[] = [
  {
    id: "u-1",
    firstName: "Henriette",
    lastName: "Berthier",
    email: "henriette.berthier@chat-pitre.fr",
    phone: "06 32 41 88 17",
    createdAt: "10 fév 2025",
    catCount: 3,
    bookingCount: 4,
  },
  {
    id: "u-2",
    firstName: "Jean-Loup",
    lastName: "Mancini",
    email: "jl.mancini@chat-pitre.fr",
    phone: "06 87 22 14 03",
    createdAt: "03 mars 2025",
    catCount: 1,
    bookingCount: 2,
  },
  {
    id: "u-3",
    firstName: "Sidonie",
    lastName: "Verheyden",
    email: "s.verheyden@chat-pitre.fr",
    createdAt: "18 mars 2025",
    catCount: 2,
    bookingCount: 1,
  },
  {
    id: "u-4",
    firstName: "Albert",
    lastName: "Roussel-Garcia",
    email: "albert.rg@chat-pitre.fr",
    phone: "07 14 55 89 22",
    createdAt: "04 avr 2025",
    catCount: 1,
    bookingCount: 3,
  },
  {
    id: "u-5",
    firstName: "Camille",
    lastName: "Vidal",
    email: "c.vidal@chat-pitre.fr",
    createdAt: "12 mai 2025",
    catCount: 2,
    bookingCount: 1,
  },
];

// --- Chats ---------------------------------------------------------------

export const CATS: FixtureCat[] = [
  // Henriette (u-1) — la troupe de l'utilisateur courant
  {
    id: "c-1",
    reference: "003",
    name: "Salami",
    sex: "MALE",
    breed: "Roux des toits",
    ageLabel: "2 ans",
    ownerId: "u-1",
    criteria: { sterilized: true, identified: true, vaccines: true, sociable: true },
  },
  {
    id: "c-2",
    reference: "008",
    name: "Maestro",
    sex: "MALE",
    breed: "Chartreux",
    ageLabel: "4 ans",
    ownerId: "u-1",
    criteria: { sterilized: true, identified: true, vaccines: false, sociable: true },
  },
  {
    id: "c-3",
    reference: "014",
    name: "Sardine",
    sex: "FEMALE",
    breed: "Européenne tigrée",
    ageLabel: "8 mois",
    ownerId: "u-1",
    criteria: { sterilized: false, identified: true, vaccines: true, sociable: true },
  },
  // Autres clients
  {
    id: "c-4",
    reference: "017",
    name: "Madame Cliquot",
    sex: "FEMALE",
    breed: "Européenne tricolore",
    ageLabel: "6 ans",
    ownerId: "u-2",
    criteria: { sterilized: true, identified: true, vaccines: true, sociable: true },
  },
  {
    id: "c-5",
    reference: "021",
    name: "Pompon",
    sex: "MALE",
    breed: "Persan",
    ageLabel: "11 ans",
    ownerId: "u-3",
    criteria: { sterilized: true, identified: true, vaccines: true, sociable: false },
  },
  {
    id: "c-6",
    reference: "022",
    name: "Comtesse",
    sex: "FEMALE",
    breed: "Sacré de Birmanie",
    ageLabel: "3 ans",
    ownerId: "u-3",
    criteria: { sterilized: true, identified: true, vaccines: true, sociable: true },
  },
  {
    id: "c-7",
    reference: "028",
    name: "Hugolin",
    sex: "MALE",
    breed: "Bengal",
    ageLabel: "5 ans",
    ownerId: "u-4",
    criteria: { sterilized: true, identified: true, vaccines: true, sociable: true },
  },
  {
    id: "c-8",
    reference: "031",
    name: "Béatrice",
    sex: "FEMALE",
    breed: "Européenne noire",
    ageLabel: "9 ans",
    ownerId: "u-5",
    criteria: { sterilized: true, identified: true, vaccines: true, sociable: true },
  },
  {
    id: "c-9",
    reference: "035",
    name: "Roméo",
    sex: "MALE",
    breed: "Européenne tigré",
    ageLabel: "2 ans",
    ownerId: "u-5",
    criteria: { sterilized: false, identified: false, vaccines: false, sociable: true },
  },
];

// --- Séjours -------------------------------------------------------------
// Un exemple par statut, dans l'ordre catalogue (01 → 06).

export const BOOKINGS: FixtureBooking[] = [
  // ACCEPTED — prochain séjour de Henriette
  {
    id: "b-121",
    reference: "121",
    ownerId: "u-1",
    catIds: ["c-1", "c-2"],
    startDate: "14 mars 2026",
    endDate: "21 mars 2026",
    nights: 7,
    pricePerNight: 40,
    total: 280,
    status: "ACCEPTED",
    notes:
      "Salami et Maestro arrivent ensemble — chambre partagée habituelle. Salami a son sachet d'herbes à chat.",
    messages: [
      {
        id: "m-1",
        fromAdmin: false,
        authorLabel: "Vous",
        body: "Bonjour, je souhaiterais confier Salami et Maestro du 14 au 21 mars. Pouvons-nous prévoir une chambre partagée comme la dernière fois ?",
        sentAt: "02 fév · 16h05",
      },
      {
        id: "m-2",
        fromAdmin: true,
        authorLabel: "La maison",
        body: "Bonjour Henriette, c'est noté. Chambre n° 04 pour eux deux. Nous vous confirmons l'acompte sous 48h.",
        sentAt: "02 fév · 18h22",
      },
      {
        id: "m-3",
        fromAdmin: true,
        authorLabel: "La maison",
        body: "Acompte bien reçu — votre séjour est ferme. Rendez-vous le 14 mars entre 10h et 12h.",
        sentAt: "04 fév · 09h41",
      },
    ],
  },
  // QUESTION_ASKED — séjour en cours d'instruction
  {
    id: "b-124",
    reference: "124",
    ownerId: "u-1",
    catIds: ["c-3"],
    startDate: "08 avr 2026",
    endDate: "15 avr 2026",
    nights: 7,
    pricePerNight: 22,
    total: 154,
    status: "QUESTION_ASKED",
    notes: "Premier séjour de Sardine — elle n'a que 8 mois.",
    messages: [
      {
        id: "m-4",
        fromAdmin: false,
        authorLabel: "Vous",
        body: "Bonjour, Sardine pour une semaine en avril. Première fois — elle est encore vive.",
        sentAt: "22 fév · 11h30",
      },
      {
        id: "m-5",
        fromAdmin: true,
        authorLabel: "La maison",
        body: "Bonjour, on s'occupera bien d'elle. Une précision : avez-vous prévu sa stérilisation avant le séjour ou faudra-t-il l'isoler des mâles ?",
        sentAt: "22 fév · 14h15",
      },
    ],
  },
  // PENDING — séjour ouvert, en lecture par la maison
  {
    id: "b-127",
    reference: "127",
    ownerId: "u-4",
    catIds: ["c-7"],
    startDate: "12 mai 2026",
    endDate: "18 mai 2026",
    nights: 6,
    pricePerNight: 22,
    total: 132,
    status: "PENDING",
    messages: [
      {
        id: "m-6",
        fromAdmin: false,
        authorLabel: "Vous",
        body: "Hugolin pour le week-end de l'Ascension. Vaccins à jour, copie du carnet ci-joint.",
        sentAt: "01 mars · 09h10",
      },
    ],
  },
  // REJECTED — refus motivé
  {
    id: "b-119",
    reference: "119",
    ownerId: "u-5",
    catIds: ["c-9"],
    startDate: "20 fév 2026",
    endDate: "25 fév 2026",
    nights: 5,
    pricePerNight: 22,
    total: 110,
    status: "REJECTED",
    messages: [
      {
        id: "m-7",
        fromAdmin: false,
        authorLabel: "Vous",
        body: "Roméo pour février — premier séjour.",
        sentAt: "08 fév · 17h44",
      },
      {
        id: "m-8",
        fromAdmin: true,
        authorLabel: "La maison",
        body: "Bonjour, nous ne pouvons pas accueillir Roméo en l'état (non stérilisé, non identifié, vaccins manquants). Reformulez-nous une demande quand ces points seront réglés.",
        sentAt: "09 fév · 08h20",
      },
    ],
  },
  // CANCELLED — annulation amiable
  {
    id: "b-117",
    reference: "117",
    ownerId: "u-2",
    catIds: ["c-4"],
    startDate: "10 jan 2026",
    endDate: "14 jan 2026",
    nights: 4,
    pricePerNight: 22,
    total: 88,
    status: "CANCELLED",
    notes: "Annulation amiable, hospitalisation soudaine — acompte intégralement remboursé.",
    messages: [],
  },
  // COMPLETED — séjour passé d'Henriette
  {
    id: "b-104",
    reference: "104",
    ownerId: "u-1",
    catIds: ["c-1"],
    startDate: "23 déc 2025",
    endDate: "02 jan 2026",
    nights: 10,
    pricePerNight: 22,
    total: 220,
    status: "COMPLETED",
    messages: [],
  },
  // Une seconde COMPLETED pour Sidonie
  {
    id: "b-110",
    reference: "110",
    ownerId: "u-3",
    catIds: ["c-5", "c-6"],
    startDate: "12 déc 2025",
    endDate: "19 déc 2025",
    nights: 7,
    pricePerNight: 40,
    total: 280,
    status: "COMPLETED",
    messages: [],
  },
];

// --- Sélecteurs utilitaires ---------------------------------------------

export function getCatsByOwner(ownerId: string): FixtureCat[] {
  return CATS.filter((c) => c.ownerId === ownerId);
}

export function getBookingsByOwner(ownerId: string): FixtureBooking[] {
  return BOOKINGS.filter((b) => b.ownerId === ownerId);
}

export function getCat(id: string): FixtureCat | undefined {
  return CATS.find((c) => c.id === id);
}

export function getBooking(id: string): FixtureBooking | undefined {
  return BOOKINGS.find((b) => b.id === id || b.reference === id);
}

export function getClient(id: string): FixtureClient | undefined {
  return CLIENTS.find((c) => c.id === id);
}
