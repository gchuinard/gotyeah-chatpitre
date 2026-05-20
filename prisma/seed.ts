import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Seed de développement : réglages (tarifs) + comptes de démonstration.
// À NE PAS exécuter en production (cf. README).

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL n'est pas défini — vérifie ton fichier .env.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

// Mot de passe commun aux comptes de démo (dev uniquement).
const DEV_PASSWORD = "chatpitre";

async function main() {
  // --- Réglages (tarifs) ----------------------------------------------------
  // Lus à la création d'une réservation. lib/pricing.ts fournit un fallback
  // codé en dur sur ces mêmes valeurs si une clé venait à manquer.
  const settings = [
    { key: "price_first_cat", value: "16" },
    { key: "price_extra_cat", value: "13" },
    { key: "deposit_percentage", value: "20" },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log(`✔ ${settings.length} réglages (tarifs) en place`);

  // --- Comptes de démonstration ---------------------------------------------
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  // Admin : son email doit figurer dans ADMIN_EMAILS pour avoir les droits.
  const admin = await prisma.user.upsert({
    where: { email: "admin@chatpitre.local" },
    update: {},
    create: {
      email: "admin@chatpitre.local",
      passwordHash,
      firstName: "Admin",
      lastName: "Chat-Pitre",
    },
  });

  // Client de démonstration.
  const client = await prisma.user.upsert({
    where: { email: "client@chatpitre.local" },
    update: {},
    create: {
      email: "client@chatpitre.local",
      passwordHash,
      firstName: "Camille",
      lastName: "Dupont",
      phone: "0600000000",
      city: "Bordeaux",
    },
  });
  console.log(`✔ comptes : ${admin.email} (admin) + ${client.email} (client)`);

  // Chats du client (créés uniquement s'il n'en a pas encore).
  const existingCats = await prisma.cat.count({ where: { ownerId: client.id } });
  if (existingCats === 0) {
    await prisma.cat.createMany({
      data: [
        {
          ownerId: client.id,
          name: "Moustache",
          sex: "MALE",
          breed: "Européen",
          color: "Tigré",
          isSterilized: true,
          isIdentified: true,
          vaccinesUpToDate: true,
          isSociable: true,
        },
        {
          ownerId: client.id,
          name: "Pixel",
          sex: "FEMALE",
          breed: "Chartreux",
          color: "Gris",
          isSterilized: true,
          isIdentified: true,
          vaccinesUpToDate: true,
          isSociable: false,
        },
      ],
    });
    console.log("✔ 2 chats créés pour le client de démo");
  } else {
    console.log(`• le client a déjà ${existingCats} chat(s), création ignorée`);
  }

  console.log(`\n🌱 Seed terminé — comptes de démo, mot de passe : « ${DEV_PASSWORD} »`);
}

main()
  .catch((e) => {
    console.error("Échec du seed :", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
