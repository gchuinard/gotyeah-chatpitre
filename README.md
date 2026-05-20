# Le Chat-Pitre 🐾

Site web de la pension féline **Le Chat-Pitre** : comptes des propriétaires,
fiches des chats, demandes de réservation de séjour, fil de discussion par
réservation, notifications in-app et facturation.

> **État du projet.** Cette base couvre le **backend et la structure** : schéma
> de données, authentification, routes API, Docker. Les pages publiques (vitrine)
> et le design seront réalisés dans un second temps — l'UI actuelle est
> volontairement minimale.

## Stack technique

- **Next.js 16** — App Router, TypeScript strict, Turbopack
- **PostgreSQL 16** + **Prisma 7** (driver adapter `@prisma/adapter-pg`)
- **Authentification maison** — email / mot de passe (`bcryptjs`), session
  portée par un cookie signé HMAC-SHA256
- **Tailwind CSS v4** + **shadcn/ui** — composants de base
- **Zod** (validation des entrées) · **date-fns** (dates)
- **Docker** multi-stage + **Docker Compose** (développement)

## Prérequis

- **Node.js 24** (cf. `.nvmrc`)
- **Docker** + **Docker Compose** — pour PostgreSQL en dev et le déploiement

## Démarrage rapide

```bash
# 1. Variables d'environnement
cp .env.example .env
#    → renseigne AUTH_SECRET avec :  openssl rand -hex 32

# 2. Dépendances (utile aussi pour l'éditeur / l'autocomplétion)
npm install

# 3. Tout en Docker : PostgreSQL + application
docker compose up --build
#    L'app applique les migrations puis démarre sur http://localhost:3000
```

### Variante — application sur l'hôte, PostgreSQL en Docker

Plus réactif en développement (hot reload natif), recommandé sous WSL2 :

```bash
docker compose up -d db     # PostgreSQL seul
npm run db:migrate          # applique les migrations
npm run db:seed             # (optionnel) données de démonstration
npm run dev                 # application sur http://localhost:3000
```

## Variables d'environnement

Voir `.env.example`. Le fichier `.env` n'est jamais versionné.

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `AUTH_SECRET` | Secret de signature des sessions, ≥ 32 caractères (`openssl rand -hex 32`) |
| `ADMIN_EMAILS` | Emails admin séparés par des virgules. Tout compte dont l'email y figure obtient les droits admin. |
| `BASE_URL` | URL de base de l'application |
| `NODE_ENV` | `development` ou `production` |

## Commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Démarre le build de production |
| `npm run lint` | Analyse ESLint |
| `npm run db:migrate` | Crée et applique les migrations Prisma (dev) |
| `npm run db:seed` | Insère les données de démonstration |
| `npm run db:studio` | Ouvre Prisma Studio (exploration de la base) |

## Comptes de démonstration

Créés par `npm run db:seed` :

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@chatpitre.local` | `chatpitre` |
| Client | `client@chatpitre.local` | `chatpitre` |

Le compte admin dispose de ses droits parce que son email figure dans
`ADMIN_EMAILS` (valeur par défaut du `.env.example`).

## Structure du projet

```
app/
  (auth)/        login, signup
  (client)/      dashboard — espace client (session requise)
  (admin)/       admin — espace admin (email admin requis)
  api/           routes API : auth, cats, bookings, admin, notifications
lib/
  db.ts          client Prisma (singleton)
  auth.ts        sessions, hachage des mots de passe, getCurrentUser, isAdmin
  auth-shared.ts primitives de jeton (importées aussi par le proxy)
  api.ts         helpers de routes : réponses JSON, gardes, gestion d'erreur
  pricing.ts     calcul de la tarification des séjours
  notifications.ts  création des notifications in-app
  validations.ts schémas Zod
prisma/          schema.prisma, migrations/, seed.ts
proxy.ts         protège /dashboard (session) et /admin (admin)
```

## Routes API

Les routes échangent du JSON ; les routes protégées exigent le cookie de session.

| Route | Description |
|---|---|
| `POST /api/auth/signup` | Inscription (ouvre la session) |
| `POST /api/auth/login` | Connexion |
| `POST /api/auth/logout` | Déconnexion |
| `GET` · `POST /api/cats` | Liste · création des chats |
| `GET` · `PATCH` · `DELETE /api/cats/[id]` | Détail · mise à jour · suppression d'un chat |
| `GET` · `POST /api/bookings` | Liste · création des réservations |
| `GET /api/bookings/[id]` | Détail d'une réservation |
| `POST /api/bookings/[id]/messages` | Poster un message sur une réservation |
| `GET /api/admin/bookings` | Toutes les réservations (admin) |
| `PATCH /api/admin/bookings/[id]` | Changer le statut / les notes admin (admin) |
| `GET /api/notifications` | Mes notifications |
| `PATCH /api/notifications/[id]/read` | Marquer une notification comme lue |

Les mutations pertinentes créent automatiquement les notifications
(nouvelle demande → admins, changement de statut → client, message → l'autre partie).

## Modèle de données

8 modèles Prisma : `User`, `Cat`, `Booking`, `BookingCat` (table de liaison),
`BookingMessage`, `Notification`, `Invoice`, `Setting`. Les montants sont en
`Decimal(10,2)`. Les tarifs (prix par chat, pourcentage d'acompte) sont stockés
dans `Setting` et donc modifiables sans redéploiement.

## Production

L'image de production se construit via la cible `runner` du Dockerfile :

```bash
docker build --target runner -t chatpitre .
```

Au démarrage, le conteneur applique les migrations en attente
(`prisma migrate deploy`) puis lance le serveur Next.js (sortie *standalone*,
utilisateur non-root). Cible de déploiement : Raspberry Pi 5, derrière Nginx
Proxy Manager + Cloudflare. En production, `DATABASE_URL` pointe vers le
PostgreSQL du homelab.

## Hors périmètre (étapes suivantes)

Pages vitrine publiques et design, upload des photos de chats, génération des
factures PDF, rappels automatiques d'arrivée (cron `ARRIVAL_REMINDER`),
pipeline CI/CD de déploiement.
