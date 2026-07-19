// Helpers de formatage pur, sans dépendance Prisma, donc importable
// depuis les Server Components ET les Client Components.
//
// La zone est FIXÉE à Europe/Paris et jamais laissée à l'environnement. Sans
// elle, un même instant s'affichait différemment selon l'endroit où le code
// tourne : le conteneur de production est en UTC (vérifié), le navigateur est
// dans le fuseau du visiteur. Un composant client, rendu une fois sur le
// serveur puis hydraté, pouvait donc afficher deux jours différents pour la
// même date. La pension est à Bordeaux : ses dates se lisent à son heure,
// d'où qu'on les regarde.
const TIME_ZONE = "Europe/Paris";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/// « 14 mars 2026 »
export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

/// « 14 mars »
export function formatShortDate(date: Date): string {
  return shortDateFormatter.format(date);
}

/// « 14 mars · 16h05 » — horodatage des messages et entrées de carnet.
export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date).replace(", ", " · ").replace(":", "h");
}

/// « 2026-06-16 » — date ISO courte (UTC), pour les noms de fichiers.
export function formatISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/// Identifiant d'affichage court dérivé d'un cuid (les 4 derniers caractères
/// en majuscules). Stable par entité, sert de « numéro de référence »
/// utilisateur tant qu'on n'a pas de séquence dédiée en base.
export function displayRef(id: string): string {
  return id.slice(-4).toUpperCase();
}

/// Âge approximatif d'un chat depuis sa birthDate.
export function ageLabel(birthDate: Date | null | undefined): string {
  if (!birthDate) return "âge non précisé";
  const now = new Date();
  let months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());
  if (now.getDate() < birthDate.getDate()) months -= 1;
  if (months < 12) return `${Math.max(months, 0)} mois`;
  const years = Math.floor(months / 12);
  return `${years} an${years > 1 ? "s" : ""}`;
}

/// Nombre de nuits entre deux dates (différence en jours).
export function nightsBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

/// Montant en euros au format français : virgule décimale, et 2 décimales
/// seulement quand il y en a (« 22,50 » mais « 66 »). Le symbole € est ajouté
/// par l'appelant selon le contexte.
export function formatEuros(amount: number): string {
  return amount.toLocaleString("fr-FR", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/// Temps relatif depuis une date passée, en français : « il y a 2 h »,
/// « hier », « il y a 3 j », ou date formatée pour les plus anciennes.
export function relativeTime(from: Date, reference: Date = new Date()): string {
  const diffMs = reference.getTime() - from.getTime();
  if (diffMs < 0) return "à l'instant";
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 60) {
    if (diffMinutes <= 1) return "à l'instant";
    return `il y a ${diffMinutes} min`;
  }
  const diffHours = Math.round(diffMs / 3600000);
  if (diffHours < 24) return `il y a ${diffHours} h`;
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} j`;
  return formatShortDate(from);
}
