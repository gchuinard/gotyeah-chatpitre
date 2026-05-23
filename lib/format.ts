// Helpers de formatage pur — sans dépendance Prisma, donc importable
// depuis les Server Components ET les Client Components.

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
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
