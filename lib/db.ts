import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton du client Prisma stocké sur globalThis : en développement, le hot
// reload de Next ré-évalue les modules à chaque modification ; sans ce cache,
// chaque rechargement ouvrirait un nouveau pool de connexions Postgres.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("La variable d'environnement DATABASE_URL n'est pas définie.");
  }

  // Prisma 7 fonctionne avec le « Query Compiler » : un driver adapter est
  // obligatoire. PrismaPg accepte directement la chaîne de connexion.
  const adapter = new PrismaPg(url);
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  globalForPrisma.prisma = client;
  return client;
}

// Proxy « lazy » : le PrismaClient n'est instancié qu'au premier accès à une
// propriété, et non au chargement du module. Indispensable pour le build Next,
// qui évalue les modules serveur sans .env — le client n'est jamais créé
// pendant `next build`.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
