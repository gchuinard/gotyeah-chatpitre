import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Seed de démonstration — données réalistes panachées pour faire vivre le
// site immédiatement après installation (un séjour en cours, des messages,
// un carnet de séjour, des fiches félines variées).
//
// Idempotent : on supprime les données démo existantes avant de tout
// recréer. Les utilisateurs sont upsertés sur l'email pour préserver la
// stabilité des sessions ouvertes.
//
// Exécution :
//   - dev local :    npm run db:seed
//   - prod (Pi) :    docker compose -f docker-compose.prod.yml exec app \
//                       node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL n'est pas défini — vérifie ton fichier .env.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

const DEV_PASSWORD = "chatpitre";

// Identifiants des utilisateurs démo (servent à la fois de clé d'upsert et
// de filtre pour le nettoyage).
const DEMO_EMAILS = [
  "admin@chatpitre.local",
  "client@chatpitre.local",
  "sidonie.verheyden@chat-pitre.fr",
  "albert.rg@chat-pitre.fr",
  "jl.mancini@chat-pitre.fr",
  "c.vidal@chat-pitre.fr",
];

async function main() {
  // 1. RÉGLAGES (tarifs) ----------------------------------------------------
  // 22€ pour le premier chat, +18€ par chat supplémentaire, 30 % d'acompte.
  // Le client peut les modifier sans redéploiement (Setting est éditable).
  const settings = [
    { key: "price_first_cat", value: "22" },
    { key: "price_extra_cat", value: "18" },
    { key: "deposit_percentage", value: "30" },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✔ ${settings.length} réglages (tarifs) en place`);

  // 2. NETTOYAGE des données démo existantes -------------------------------
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: DEMO_EMAILS } },
    select: { id: true },
  });
  const existingUserIds = existingUsers.map((u) => u.id);

  if (existingUserIds.length > 0) {
    await prisma.stayUpdate.deleteMany({
      where: { booking: { userId: { in: existingUserIds } } },
    });
    await prisma.bookingMessage.deleteMany({
      where: { booking: { userId: { in: existingUserIds } } },
    });
    await prisma.invoice.deleteMany({
      where: { booking: { userId: { in: existingUserIds } } },
    });
    await prisma.bookingCat.deleteMany({
      where: { booking: { userId: { in: existingUserIds } } },
    });
    await prisma.booking.deleteMany({ where: { userId: { in: existingUserIds } } });
    await prisma.notification.deleteMany({
      where: { userId: { in: existingUserIds } },
    });
    await prisma.cat.deleteMany({ where: { ownerId: { in: existingUserIds } } });
    console.log("✔ données démo précédentes nettoyées");
  }

  // 3. UTILISATEURS ---------------------------------------------------------
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  // Admin (son email doit figurer dans ADMIN_EMAILS pour avoir les droits)
  const admin = await prisma.user.upsert({
    where: { email: "admin@chatpitre.local" },
    update: { firstName: "Lou", lastName: "Vasseur" },
    create: {
      email: "admin@chatpitre.local",
      passwordHash,
      firstName: "Lou",
      lastName: "Vasseur",
    },
  });

  // Client principal de démo — alignement avec les noms de la maquette
  const henriette = await prisma.user.upsert({
    where: { email: "client@chatpitre.local" },
    update: {
      firstName: "Henriette",
      lastName: "Berthier",
      phone: "06 32 41 88 17",
      city: "Bordeaux",
    },
    create: {
      email: "client@chatpitre.local",
      passwordHash,
      firstName: "Henriette",
      lastName: "Berthier",
      phone: "06 32 41 88 17",
      city: "Bordeaux",
    },
  });

  // Quatre autres clients pour la diversité (carnet, dashboard admin, etc.)
  const jeanLoup = await prisma.user.upsert({
    where: { email: "jl.mancini@chat-pitre.fr" },
    update: {},
    create: {
      email: "jl.mancini@chat-pitre.fr",
      passwordHash,
      firstName: "Jean-Loup",
      lastName: "Mancini",
      phone: "06 87 22 14 03",
      city: "Bordeaux",
    },
  });
  const sidonie = await prisma.user.upsert({
    where: { email: "sidonie.verheyden@chat-pitre.fr" },
    update: {},
    create: {
      email: "sidonie.verheyden@chat-pitre.fr",
      passwordHash,
      firstName: "Sidonie",
      lastName: "Verheyden",
      city: "Bordeaux",
    },
  });
  const albert = await prisma.user.upsert({
    where: { email: "albert.rg@chat-pitre.fr" },
    update: {},
    create: {
      email: "albert.rg@chat-pitre.fr",
      passwordHash,
      firstName: "Albert",
      lastName: "Roussel-Garcia",
      phone: "07 14 55 89 22",
      city: "Bordeaux",
    },
  });
  const camille = await prisma.user.upsert({
    where: { email: "c.vidal@chat-pitre.fr" },
    update: {},
    create: {
      email: "c.vidal@chat-pitre.fr",
      passwordHash,
      firstName: "Camille",
      lastName: "Vidal",
      city: "Bordeaux",
    },
  });
  console.log(
    `✔ utilisateurs : 1 admin (${admin.email}) + 5 clients (${henriette.email}, ${jeanLoup.email}, ${sidonie.email}, ${albert.email}, ${camille.email})`,
  );

  // 4. CHATS ---------------------------------------------------------------
  // Henriette : 3 chats
  const salami = await prisma.cat.create({
    data: {
      ownerId: henriette.id,
      name: "Salami",
      sex: "MALE",
      breed: "Roux des toits",
      color: "Roux tabby",
      birthDate: new Date("2024-04-12"),
      personality:
        "Curieux, suit les humains de pièce en pièce. Adore les sachets d'herbes à chat.",
      isSterilized: true,
      isIdentified: true,
      vaccinesUpToDate: true,
      isSociable: true,
    },
  });
  const maestro = await prisma.cat.create({
    data: {
      ownerId: henriette.id,
      name: "Maestro",
      sex: "MALE",
      breed: "Chartreux",
      color: "Bleu",
      birthDate: new Date("2022-09-03"),
      personality:
        "Méfiant les deux premiers jours, puis fond complètement. Aime dormir en hauteur.",
      isSterilized: true,
      isIdentified: true,
      vaccinesUpToDate: false,
      isSociable: true,
      medicalNotes: "Rappel typhus + coryza prévu fin juin 2026.",
    },
  });
  const sardine = await prisma.cat.create({
    data: {
      ownerId: henriette.id,
      name: "Sardine",
      sex: "FEMALE",
      breed: "Européenne tigrée",
      color: "Tigré",
      birthDate: new Date("2025-09-10"),
      personality:
        "Chaton vif, joue avec tout. Première fois en pension prévue cet été.",
      isSterilized: false,
      isIdentified: true,
      vaccinesUpToDate: true,
      isSociable: true,
    },
  });

  // Jean-Loup : 1 chat
  const madameCliquot = await prisma.cat.create({
    data: {
      ownerId: jeanLoup.id,
      name: "Madame Cliquot",
      sex: "FEMALE",
      breed: "Européenne tricolore",
      color: "Calico",
      birthDate: new Date("2020-05-21"),
      personality:
        "Chat de caractère. Apprécie le mûrier en fin d'après-midi. Ne supporte pas les autres chats.",
      isSterilized: true,
      isIdentified: true,
      vaccinesUpToDate: true,
      isSociable: false,
    },
  });

  // Sidonie : 2 chats
  const pompon = await prisma.cat.create({
    data: {
      ownerId: sidonie.id,
      name: "Pompon",
      sex: "MALE",
      breed: "Persan",
      color: "Crème",
      birthDate: new Date("2015-02-14"),
      personality:
        "Senior placide. Dort 18h par jour. Brossage quotidien indispensable.",
      isSterilized: true,
      isIdentified: true,
      vaccinesUpToDate: true,
      isSociable: false,
      specialDiet: "Croquettes Royal Canin Persian Adult.",
    },
  });
  const comtesse = await prisma.cat.create({
    data: {
      ownerId: sidonie.id,
      name: "Comtesse",
      sex: "FEMALE",
      breed: "Sacré de Birmanie",
      color: "Seal point",
      birthDate: new Date("2023-01-08"),
      personality: "Cohabite très bien avec Pompon. Joueuse mais discrète.",
      isSterilized: true,
      isIdentified: true,
      vaccinesUpToDate: true,
      isSociable: true,
    },
  });

  // Albert : 1 chat
  const hugolin = await prisma.cat.create({
    data: {
      ownerId: albert.id,
      name: "Hugolin",
      sex: "MALE",
      breed: "Bengal",
      color: "Marbré doré",
      birthDate: new Date("2021-06-30"),
      personality:
        "Très actif, adore le jardin et chasse les feuilles mortes. Premier client de la maison.",
      isSterilized: true,
      isIdentified: true,
      vaccinesUpToDate: true,
      isSociable: true,
    },
  });

  // Camille : 2 chats (dont un non aux normes — pour montrer un REJECTED)
  const beatrice = await prisma.cat.create({
    data: {
      ownerId: camille.id,
      name: "Béatrice",
      sex: "FEMALE",
      breed: "Européenne noire",
      color: "Noir",
      birthDate: new Date("2017-03-15"),
      isSterilized: true,
      isIdentified: true,
      vaccinesUpToDate: true,
      isSociable: true,
    },
  });
  const romeo = await prisma.cat.create({
    data: {
      ownerId: camille.id,
      name: "Roméo",
      sex: "MALE",
      breed: "Européenne tigré",
      color: "Tigré gris",
      birthDate: new Date("2024-08-22"),
      personality: "Jeune mâle entier. Stérilisation prévue à l'automne 2026.",
      isSterilized: false,
      isIdentified: false,
      vaccinesUpToDate: false,
      isSociable: true,
    },
  });
  console.log("✔ 9 chats créés (3 Henriette + 6 autres clients)");

  // 5. RÉSERVATIONS --------------------------------------------------------
  // Tarification : 22€ premier chat + 18€ chat extra, par nuit.
  // Acompte : 30 % du total.

  type BookingSeed = {
    ref: string;
    userId: string;
    catIds: string[];
    start: Date;
    end: Date;
    status:
      | "PENDING"
      | "QUESTION_ASKED"
      | "ACCEPTED"
      | "REJECTED"
      | "CANCELLED"
      | "COMPLETED";
    clientNotes?: string;
    adminNotes?: string;
    /** Conditions particulières chiffrées par l'admin (devis posé). */
    extras?: { notes: string; amount: number };
  };

  // Date de référence pour distinguer passé / en cours / futur : on prend
  // explicitement aujourd'hui mais en milieu de journée pour éviter les
  // ambiguïtés de fuseau.
  const today = new Date();

  const bookingsSeed: BookingSeed[] = [
    // ---- Passés (COMPLETED / CANCELLED / REJECTED) -----------------------
    {
      ref: "104",
      userId: henriette.id,
      catIds: [salami.id],
      start: new Date("2025-12-23"),
      end: new Date("2026-01-02"),
      status: "COMPLETED",
      clientNotes: "Salami seul, vacances de fin d'année.",
    },
    {
      ref: "110",
      userId: sidonie.id,
      catIds: [pompon.id, comtesse.id],
      start: new Date("2025-12-12"),
      end: new Date("2025-12-19"),
      status: "COMPLETED",
    },
    {
      ref: "117",
      userId: jeanLoup.id,
      catIds: [madameCliquot.id],
      start: new Date("2026-01-10"),
      end: new Date("2026-01-14"),
      status: "CANCELLED",
      adminNotes:
        "Annulation amiable, hospitalisation soudaine — acompte intégralement remboursé.",
    },
    {
      ref: "119",
      userId: camille.id,
      catIds: [romeo.id],
      start: new Date("2026-02-20"),
      end: new Date("2026-02-25"),
      status: "REJECTED",
      adminNotes:
        "Refus motivé : Roméo non stérilisé, non identifié et vaccins manquants.",
    },
    {
      ref: "121",
      userId: henriette.id,
      catIds: [salami.id, maestro.id],
      start: new Date("2026-03-14"),
      end: new Date("2026-03-21"),
      status: "COMPLETED",
      clientNotes:
        "Salami et Maestro ensemble — chambre partagée habituelle. Salami a son sachet d'herbes à chat.",
    },
    {
      ref: "127",
      userId: albert.id,
      catIds: [hugolin.id],
      start: new Date("2026-05-12"),
      end: new Date("2026-05-18"),
      status: "COMPLETED",
      clientNotes: "Hugolin pour le week-end de l'Ascension.",
    },
    // ---- En cours (ACCEPTED — chevauchent aujourd'hui) -------------------
    {
      ref: "130",
      userId: sidonie.id,
      catIds: [pompon.id, comtesse.id],
      start: new Date("2026-05-20"),
      end: new Date("2026-05-28"),
      status: "ACCEPTED",
      clientNotes:
        "Sidonie en déplacement, Pompon et Comtesse partagent la chambre n° 02.",
      adminNotes: "Chambre n° 02 — pension classique, brossage quotidien Pompon.",
      extras: {
        notes: "Brossage quotidien long poil pour Pompon (15 min/jour).",
        amount: 18,
      },
    },
    {
      ref: "131",
      userId: albert.id,
      catIds: [hugolin.id],
      start: new Date("2026-05-19"),
      end: new Date("2026-05-27"),
      status: "ACCEPTED",
      clientNotes: "Hugolin, chambre n° 05 — peu de visites, il adore le jardin.",
    },
    {
      ref: "132",
      userId: jeanLoup.id,
      catIds: [madameCliquot.id],
      start: new Date("2026-05-22"),
      end: new Date("2026-05-26"),
      status: "ACCEPTED",
      clientNotes:
        "Madame Cliquot, chambre n° 01 — adore le mûrier en fin d'après-midi.",
    },
    // ---- Futurs --------------------------------------------------------
    {
      ref: "140",
      userId: henriette.id,
      catIds: [salami.id, maestro.id],
      start: new Date("2026-06-25"),
      end: new Date("2026-07-02"),
      status: "PENDING",
      clientNotes: "Voyage de noces — Salami et Maestro pour la semaine.",
    },
    {
      ref: "141",
      userId: camille.id,
      catIds: [beatrice.id, romeo.id],
      start: new Date("2026-07-15"),
      end: new Date("2026-07-22"),
      status: "QUESTION_ASKED",
      clientNotes: "Vacances en famille en Bretagne.",
    },
  ];

  function pricingFor(catCount: number, start: Date, end: Date) {
    const nights = Math.round(
      (end.getTime() - start.getTime()) / 86400000,
    );
    const perFirst = 22;
    const perExtra = 18;
    const total = nights * (perFirst + perExtra * Math.max(0, catCount - 1));
    const deposit = Math.round(total * 0.3);
    return { nights, perFirst, perExtra, total, deposit };
  }

  const bookingByRef = new Map<string, { id: string; createdAt: Date }>();

  // Devis posé uniquement quand le séjour a été accepté/effectué (ou s'il
  // a été tarifé puis annulé). Les statuts en attente (PENDING/
  // QUESTION_ASKED) et les refus naissent sans tarif.
  const UNPRICED_STATUSES = new Set(["PENDING", "QUESTION_ASKED", "REJECTED"]);

  for (const b of bookingsSeed) {
    const price = pricingFor(b.catIds.length, b.start, b.end);
    const isPriced = !UNPRICED_STATUSES.has(b.status);
    // createdAt : pour les passés, on antidate au moins une semaine avant
    // le début du séjour ; pour les futurs, on prend une date récente.
    const createdAt =
      b.start.getTime() < today.getTime()
        ? new Date(b.start.getTime() - 30 * 86400000)
        : new Date(today.getTime() - 3 * 86400000);

    // Si extras : ils s'ajoutent au total et impactent l'acompte.
    const extrasAmount = isPriced ? (b.extras?.amount ?? 0) : 0;
    const total = isPriced ? price.total + extrasAmount : null;
    const deposit = total === null ? null : Math.round(total * 0.3);

    const booking = await prisma.booking.create({
      data: {
        userId: b.userId,
        startDate: b.start,
        endDate: b.end,
        status: b.status,
        clientNotes: b.clientNotes,
        adminNotes: b.adminNotes,
        pricePerFirstCat: isPriced ? price.perFirst : null,
        pricePerExtraCat: isPriced ? price.perExtra : null,
        depositPercentage: 30,
        totalAmount: total,
        depositAmount: deposit,
        extraNotes: isPriced ? (b.extras?.notes ?? null) : null,
        extraAmount: isPriced && b.extras ? b.extras.amount : null,
        createdAt,
        cats: { create: b.catIds.map((catId) => ({ catId })) },
      },
    });
    bookingByRef.set(b.ref, { id: booking.id, createdAt: booking.createdAt });
  }
  console.log(`✔ ${bookingsSeed.length} séjours créés`);

  // 6. MESSAGES (fil de discussion) ----------------------------------------
  // Format pratique pour le seed : on désigne l'auteur par "client" ou
  // "admin", et on lui assigne l'utilisateur correspondant.
  type MessageSeed = {
    ref: string; // booking reference
    who: "client" | "admin";
    body: string;
    daysFromStart: number; // décalage en jours depuis booking.createdAt
    hour: number;
    minute: number;
  };

  const messagesSeed: MessageSeed[] = [
    // b-121 — séjour passé de Henriette, conversation classique
    {
      ref: "121",
      who: "client",
      body: "Bonjour, je souhaiterais confier Salami et Maestro du 14 au 21 mars. Pouvons-nous prévoir une chambre partagée comme la dernière fois ?",
      daysFromStart: 0,
      hour: 16,
      minute: 5,
    },
    {
      ref: "121",
      who: "admin",
      body: "Bonjour Henriette, c'est noté. Chambre n° 04 pour eux deux. Nous vous confirmons l'acompte sous 48h.",
      daysFromStart: 0,
      hour: 18,
      minute: 22,
    },
    {
      ref: "121",
      who: "admin",
      body: "Acompte bien reçu — votre séjour est ferme. Rendez-vous le 14 mars entre 10h et 12h.",
      daysFromStart: 2,
      hour: 9,
      minute: 41,
    },
    // b-130 — séjour en cours, message de courtoisie
    {
      ref: "130",
      who: "client",
      body: "Bonjour, je décolle ce soir — n'hésitez pas à m'appeler en cas de souci.",
      daysFromStart: 0,
      hour: 8,
      minute: 30,
    },
    {
      ref: "130",
      who: "admin",
      body: "Bonjour Sidonie, ils sont bien arrivés, tout est calme. Photos quotidiennes dans le carnet.",
      daysFromStart: 0,
      hour: 16,
      minute: 50,
    },
    // b-140 — futur, demande initiale de Henriette
    {
      ref: "140",
      who: "client",
      body: "Bonjour, on se marie fin juin — Salami et Maestro du 25 juin au 2 juillet ?",
      daysFromStart: 0,
      hour: 9,
      minute: 12,
    },
    // b-141 — QUESTION_ASKED de Camille
    {
      ref: "141",
      who: "client",
      body: "Bonjour, je vous écris pour Béatrice et Roméo pour les vacances de juillet.",
      daysFromStart: 0,
      hour: 14,
      minute: 22,
    },
    {
      ref: "141",
      who: "admin",
      body: "Bonjour Camille, Béatrice est dans les clous mais Roméo n'est toujours pas stérilisé. Pouvez-vous confirmer où ça en est ?",
      daysFromStart: 0,
      hour: 18,
      minute: 5,
    },
  ];

  let messageCount = 0;
  for (const m of messagesSeed) {
    const booking = bookingByRef.get(m.ref);
    if (!booking) continue;
    const author = m.who === "admin" ? admin : await prisma.user.findFirst({
      where: { bookings: { some: { id: booking.id } } },
    });
    if (!author) continue;
    const createdAt = new Date(booking.createdAt.getTime() + m.daysFromStart * 86400000);
    createdAt.setHours(m.hour, m.minute, 0, 0);
    await prisma.bookingMessage.create({
      data: {
        bookingId: booking.id,
        authorId: author.id,
        isFromAdmin: m.who === "admin",
        content: m.body,
        createdAt,
      },
    });
    messageCount += 1;
  }
  console.log(`✔ ${messageCount} messages créés`);

  // 7. CARNET DE SÉJOUR (StayUpdates) --------------------------------------
  type StayUpdateSeed = {
    ref: string;
    catSlot: number; // index dans booking.catIds — utilisé pour retrouver le cat
    daysFromStart: number;
    hour: number;
    variant: "COBALT" | "PAPRIKA" | "CANARI" | "FEUILLE";
    pose: "SITTING" | "SLEEPING" | "STANDING" | "WATCHING";
    content: string;
  };

  const updatesSeed: StayUpdateSeed[] = [
    // b-121 — Henriette, Salami + Maestro (4 entrées historiques)
    {
      ref: "121",
      catSlot: 0,
      daysFromStart: 0,
      hour: 12,
      variant: "PAPRIKA",
      pose: "SITTING",
      content:
        "Salami est arrivé sans broncher. Il a tout reniflé en silence puis s'est installé sur la couverture qu'il connaît.",
    },
    {
      ref: "121",
      catSlot: 1,
      daysFromStart: 1,
      hour: 9,
      variant: "COBALT",
      pose: "WATCHING",
      content:
        "Maestro plus méfiant — il observe depuis le perchoir. Pâtée à peine entamée ce matin mais il a bu.",
    },
    {
      ref: "121",
      catSlot: 0,
      daysFromStart: 3,
      hour: 16,
      variant: "FEUILLE",
      pose: "SLEEPING",
      content:
        "Sieste de l'après-midi dans le jardin pour les deux. Salami a chassé une mouche. Maestro a regardé.",
    },
    {
      ref: "121",
      catSlot: 1,
      daysFromStart: 6,
      hour: 18,
      variant: "CANARI",
      pose: "STANDING",
      content:
        "Maestro a fini par accepter une caresse. Reprise complète du rythme alimentaire. On approche du départ — tout est prêt.",
    },
    // b-130 — Sidonie, Pompon + Comtesse (3 entrées récentes)
    {
      ref: "130",
      catSlot: 0,
      daysFromStart: 0,
      hour: 14,
      variant: "COBALT",
      pose: "SITTING",
      content:
        "Pompon a pris ses marques dès la première heure — il dort déjà sur la couverture en laine. Le persan, ça connaît le confort.",
    },
    {
      ref: "130",
      catSlot: 1,
      daysFromStart: 0,
      hour: 19,
      variant: "PAPRIKA",
      pose: "WATCHING",
      content:
        "Comtesse plus prudente — elle a fait le tour de toute la chambre avant de daigner s'allonger. Repas du soir nickel.",
    },
    {
      ref: "130",
      catSlot: 0,
      daysFromStart: 2,
      hour: 11,
      variant: "FEUILLE",
      pose: "SLEEPING",
      content:
        "Première sortie dans le jardin pour les deux ensemble. Pompon a observé une mésange charbonnière sans bouger d'un poil.",
    },
    // b-131 — Albert, Hugolin (4 entrées)
    {
      ref: "131",
      catSlot: 0,
      daysFromStart: 0,
      hour: 11,
      variant: "CANARI",
      pose: "WATCHING",
      content:
        "Hugolin connaît les lieux, séjour facile. Il a réclamé le perchoir de la fenêtre est dès l'arrivée — comme la dernière fois.",
    },
    {
      ref: "131",
      catSlot: 0,
      daysFromStart: 1,
      hour: 10,
      variant: "PAPRIKA",
      pose: "STANDING",
      content:
        "Petite course dans le couloir ce matin avec une balle en papier froissé. Énergie au beau fixe.",
    },
    {
      ref: "131",
      catSlot: 0,
      daysFromStart: 2,
      hour: 15,
      variant: "COBALT",
      pose: "SLEEPING",
      content:
        "Trois heures de sieste après le repas. C'est un chat qui sait profiter de ses vacances.",
    },
    {
      ref: "131",
      catSlot: 0,
      daysFromStart: 4,
      hour: 9,
      variant: "FEUILLE",
      pose: "SITTING",
      content:
        "Visite vétérinaire de routine validée — tout est bon. Encore une semaine de vacances pour lui.",
    },
    // b-132 — Jean-Loup, Madame Cliquot (2 entrées)
    {
      ref: "132",
      catSlot: 0,
      daysFromStart: 0,
      hour: 11,
      variant: "PAPRIKA",
      pose: "SITTING",
      content:
        "Madame Cliquot a marqué son territoire en 15 minutes. Tout va bien — elle a son coin lecture (pas de livres, juste le radiateur).",
    },
    {
      ref: "132",
      catSlot: 0,
      daysFromStart: 1,
      hour: 10,
      variant: "CANARI",
      pose: "WATCHING",
      content:
        "Le mûrier a tout son intérêt. Elle a passé la matinée à étudier la trajectoire d'une feuille morte.",
    },
  ];

  let updateCount = 0;
  for (const u of updatesSeed) {
    const seedBooking = bookingsSeed.find((b) => b.ref === u.ref);
    const booking = bookingByRef.get(u.ref);
    if (!seedBooking || !booking) continue;
    const catId = seedBooking.catIds[u.catSlot];
    if (!catId) continue;
    const createdAt = new Date(
      seedBooking.start.getTime() + u.daysFromStart * 86400000,
    );
    createdAt.setHours(u.hour, 0, 0, 0);
    await prisma.stayUpdate.create({
      data: {
        bookingId: booking.id,
        catId,
        authorId: admin.id,
        imageVariant: u.variant,
        imagePose: u.pose,
        content: u.content,
        createdAt,
      },
    });
    updateCount += 1;
  }
  console.log(`✔ ${updateCount} entrées de carnet créées`);

  console.log(
    `\n🌱 Seed terminé — mot de passe commun (dev/démo) : « ${DEV_PASSWORD} »`,
  );
  console.log(
    `   Comptes : admin@chatpitre.local (admin) + client@chatpitre.local (Henriette)`,
  );
  console.log(
    `   + 4 autres clients (Jean-Loup, Sidonie, Albert, Camille) avec le même mdp.`,
  );
}

main()
  .catch((e) => {
    console.error("Échec du seed :", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
