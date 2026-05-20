#!/bin/sh
# Point d'entrée de l'image de production.
# Applique les migrations Prisma en attente, puis démarre le serveur Next.
# `exec` : le SIGTERM de Docker atteint directement Node (arrêt propre).
set -e

echo "[entrypoint] prisma migrate deploy…"
node ./node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] démarrage du serveur Next.js…"
exec node server.js
