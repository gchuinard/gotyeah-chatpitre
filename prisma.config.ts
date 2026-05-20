import "dotenv/config";
import { defineConfig } from "prisma/config";

// L'URL est lue directement depuis process.env (et non via le helper env() de
// Prisma, qui lève une erreur si la variable manque). Pendant `prisma generate`
// dans `docker build`, aucun .env n'est présent : le client généré n'a besoin
// que du schéma, pas d'une vraie connexion. Le fallback garde le build vert ;
// au runtime, le .env (ou les variables d'environnement Docker) fournit la
// vraie URL.
const url =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
