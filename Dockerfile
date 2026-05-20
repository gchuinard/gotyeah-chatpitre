# syntax=docker/dockerfile:1.7
#
# Image chatpitre — build multi-stage.
# Cible : linux/arm64 (Raspberry Pi 5) ; fonctionne aussi sur linux/amd64.

# --- base : socle commun ----------------------------------------------------
FROM node:24-alpine AS base
# libc6-compat + openssl : requis par Prisma sur Alpine.
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# --- deps : installe toutes les dépendances (le build a besoin des devDeps) --
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

# --- dev : image de développement (hot reload via docker-compose) -----------
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3000
# Applique les migrations en attente puis lance le serveur de dev.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]

# --- builder : prisma generate + next build (sortie standalone) -------------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
# URL factice : ni `prisma generate` ni `next build` n'ouvrent de connexion
# (le client Prisma est instancié paresseusement — cf. lib/db.ts).
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# --- runner : image de production minimale ----------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Utilisateur non-root pour l'exécution.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Bundle standalone de Next : server.js + le strict node_modules nécessaire.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma au runtime : schéma, migrations, config et CLI (pour exécuter
# `prisma migrate deploy` au démarrage du conteneur).
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

COPY --chown=nextjs:nodejs docker/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs
EXPOSE 3000
CMD ["./entrypoint.sh"]
