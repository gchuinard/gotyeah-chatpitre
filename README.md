# Le Chat-Pitre 🐾

Site web de la pension féline **Le Chat-Pitre** : comptes des propriétaires,
fiches des chats, demandes de réservation de séjour, fil de discussion par
réservation, notifications in-app et facturation.

> **État du projet.** Le backend (schéma, auth, API, Docker) **et** la refonte
> UI sont en place. Direction artistique « brutalist editorial » — encre noire
> sur bone, didone Bodoni Moda. Les écrans client/admin tournent sur des
> **fixtures statiques** (`lib/fixtures.ts`) ; le câblage Prisma/API arrivera
> dans un prompt dédié.

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

## Design system

Direction artistique : **affiche éditoriale brutalist** — encre noire sur bone,
un flash sanguine, didone Bodoni Moda + Inter + Space Mono. Aucun ornement,
zéro radius, grain de papier sur fond unique.

### Palette (`@theme` dans `app/globals.css`)

**Couleurs structurelles** (partout) :

| Token | Hex | Usage |
|---|---|---|
| `--color-cp-paper` | `#FFF1D9` | Fond unique — crème chaud |
| `--color-cp-paper-deep` | `#F5E3BD` | Crème profond, sections neutres |
| `--color-cp-ink` | `#0A0A0A` | Texte principal |
| `--color-cp-ink-soft` | `#2A2A2A` | Texte secondaire |
| `--color-cp-rule` | `#1A1A1A` | Filets, traits |
| `--color-cp-mute` | `#6A6A6A` | Texte estompé, états passés |
| `--color-cp-sanguine` | `#7A1818` | Accent unique — CTA, alerte |
| `--color-cp-sanguine-deep` | `#5A1010` | Hover sanguine |

**Couleurs festives par acte** (uniquement sur la home `/`, edge-to-edge) :

| Token | Hex | Usage |
|---|---|---|
| `--color-cp-saffron` | `#FAE08C` | Acte 01 — Conditions d'admission |
| `--color-cp-coral` | `#FFC2B0` | Acte 02 — Tarif des séjours |
| `--color-cp-mint` | `#C5E1D2` | Acte 03 — Déroulement |
| `--color-cp-lavande` | `#D7C8E8` | Acte 04 — Questions d'honneur |

### Typographies (`next/font/google`, variables `--font-cp-*`)

- **Bodoni Moda** (`--font-cp-display`) — display ET serif, variable opsz + italique
- **Inter** (`--font-cp-body`) — corps, navigation, formulaires
- **Space Mono** (`--font-cp-mono`) — mentions catalogue, numéros, métadonnées

### Composants DS (`components/`)

| Composant | Rôle |
|---|---|
| `Wordmark` | Logotype « LE CHAT-PITRE » polymorphe (caps Bodoni bold) |
| `RuleDivider` | Filet horizontal noir, simple ou avec libellé mono caps |
| `SectionHeading` | Numéro mono sanguine + filet + titre Bodoni + kicker italique |
| `RuledBox` | Encadré 1.5 px (regular / deep / inverse) |
| `LibraryStamp` | Tampon mono caps style fiche bibliothèque |
| `Field` | Label + contrôle + hint/error (sanguine pour erreurs) |
| `BookingStatusBadge` | Pastille numérotée des 6 statuts |
| `CatCard` | Fiche pensionnaire (numéro + nom italique + critères ✓/—) |
| `BookingCard` | Fiche séjour (réf + dates + cats + total + statut) |
| `MessageThread` + `MessageBubble` | Fil de discussion typographique (paper / ink selon voix) |
| `OccupancyCalendar` | Grille calendaire d'occupation, 4 niveaux de densité |
| `SiteHeader` + `SiteFooter` | Chrome public |
| `ClientHeader` | Chrome client/admin (variant) avec `NotificationBell` + `UserMenu` |
| `AdmissionCriteria` + `PriceCard` + `FaqAccordion` | Sections de la home |
| `CatForm` | Formulaire de pensionnaire en 4 sections numérotées |

### Page de référence

http://localhost:3000/styleguide expose la palette, les fontes, les boutons,
les statuts, les cartes et les champs en contexte. À supprimer ou à conserver
une fois la DA validée par le client.

### Stack UI

- **Tailwind CSS v4** — configuration CSS-first via `@theme` dans
  `app/globals.css` (**pas** de `tailwind.config.ts`)
- **shadcn/ui** style `base-nova` sur **Base UI** (`@base-ui/react`), pas Radix
- **Pas de dark mode** — aucune classe `dark:`
- **Pas de Framer Motion** — animations CSS pures (`tw-animate-css` +
  `cp-reveal` / `cp-fade` avec `--cp-delay`)
- **Mobile-first** — breakpoints Tailwind par défaut

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
