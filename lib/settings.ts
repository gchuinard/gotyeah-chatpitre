/// Registre des réglages de la pension.
///
/// La table Setting est une simple table clé/valeur, sans schéma : rien n'y
/// dit quelles clés existent, ce qu'elles veulent dire, ni quelle valeur est
/// acceptable. Ce fichier est ce schéma manquant, en un seul endroit.
///
/// Sans lui, chaque nouvelle clé se serait accompagnée de son repli codé en
/// dur dispersé dans le fichier qui la lit, et l'écran d'administration
/// n'aurait eu aucun moyen de savoir quoi afficher.
///
/// ⚠️ CE FICHIER N'IMPORTE RIEN, et surtout pas Prisma. Il est lu par des
/// composants CLIENT, qui ont besoin des libellés et du formatage ; y importer
/// la couche d'accès aux données embarquerait Prisma et le pilote PostgreSQL
/// dans le paquet du navigateur, ce qui ne compile même pas. La lecture en
/// base vit dans lib/repository.ts, qui est serveur.

export type SettingKey =
  | "price_first_cat"
  | "price_extra_cat"
  | "deposit_percentage"
  | "arrival_window_start"
  | "arrival_window_end"
  | "departure_window_start"
  | "departure_window_end";

export type SettingKind = "euros" | "percent" | "time";

export type SettingDefinition = {
  key: SettingKey;
  /// Libellé affiché à l'administration.
  label: string;
  kind: SettingKind;
  /// Valeur appliquée quand la clé est absente de la table. Le projet doit
  /// fonctionner sur une base vierge, et une clé manquante ne doit jamais
  /// faire tomber un calcul de prix.
  fallback: string;
  /// Regroupement pour l'écran d'administration.
  group: "Tarifs" | "Horaires d'accueil";
};

/// Heure sans date ni fuseau, au format HH:MM.
///
/// Volontairement une CHAÎNE et non une date : « les arrivées se font à partir
/// de 9h » ne désigne pas un instant, mais une heure de pendule, la même toute
/// l'année. Stocker une date obligerait à choisir un jour arbitraire et à se
/// battre contre les fuseaux et l'heure d'été à chaque lecture.
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const SETTINGS: readonly SettingDefinition[] = [
  // Replis alignés sur les valeurs RÉELLES de la production, relevées le
  // 2026-07-23 : 22 et 18, soit 40 € pour deux chats, ce qu'annonce le site
  // public. Les anciens replis, 16 et 13, dataient d'avant et auraient chiffré
  // les séjours en dessous du tarif affiché sur une base neuve.
  {
    key: "price_first_cat",
    label: "Prix du premier chat, par nuit",
    kind: "euros",
    fallback: "22",
    group: "Tarifs",
  },
  {
    key: "price_extra_cat",
    label: "Prix par chat supplémentaire, par nuit",
    kind: "euros",
    fallback: "18",
    group: "Tarifs",
  },
  {
    key: "deposit_percentage",
    label: "Acompte demandé à la réservation",
    kind: "percent",
    fallback: "30",
    group: "Tarifs",
  },
  {
    key: "arrival_window_start",
    label: "Arrivées, à partir de",
    kind: "time",
    fallback: "09:00",
    group: "Horaires d'accueil",
  },
  {
    key: "arrival_window_end",
    label: "Arrivées, jusqu'à",
    kind: "time",
    fallback: "12:00",
    group: "Horaires d'accueil",
  },
  {
    key: "departure_window_start",
    label: "Départs, à partir de",
    kind: "time",
    fallback: "17:00",
    group: "Horaires d'accueil",
  },
  {
    key: "departure_window_end",
    label: "Départs, jusqu'à",
    kind: "time",
    fallback: "19:00",
    group: "Horaires d'accueil",
  },
] as const;

const BY_KEY = new Map(SETTINGS.map((s) => [s.key, s]));

export function settingDefinition(key: SettingKey): SettingDefinition {
  const def = BY_KEY.get(key);
  if (!def) throw new Error(`Réglage inconnu : ${key}`);
  return def;
}

/// Valide une valeur selon le type de sa clé. Renvoie null si elle est
/// acceptable, sinon le message à montrer.
///
/// Le contrôle vit ICI et non dans le formulaire : c'est le serveur qui écrit
/// en base, et un prix négatif arrivé par une requête forgée fausserait tous
/// les devis suivants.
export function validateSetting(key: SettingKey, value: string): string | null {
  const def = settingDefinition(key);
  const raw = value.trim();
  if (raw === "") return "Valeur obligatoire.";

  if (def.kind === "time") {
    return TIME_PATTERN.test(raw) ? null : "Heure attendue au format HH:MM.";
  }

  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n)) return "Nombre attendu.";
  if (n < 0) return "La valeur ne peut pas être négative.";
  if (def.kind === "percent" && n > 100) return "Un pourcentage ne dépasse pas 100.";
  return null;
}

/// Complète les valeurs lues en base par leurs replis. Séparé de la requête
/// elle-même pour rester utilisable sans accès aux données.
export function withFallbacks(
  stored: ReadonlyMap<string, string>,
): Record<SettingKey, string> {
  const out = {} as Record<SettingKey, string>;
  for (const def of SETTINGS) {
    const value = stored.get(def.key);
    out[def.key] = value === undefined || value.trim() === "" ? def.fallback : value;
  }
  return out;
}

/// Plage d'accueil telle qu'elle s'affiche, « de 9h00 à 12h00 ».
export function formatWindow(start: string, end: string): string {
  return `de ${formatTime(start)} à ${formatTime(end)}`;
}

/// « 09:00 » devient « 9h00 », et « 09:30 » devient « 9h30 ».
export function formatTime(time: string): string {
  const [h, m] = time.split(":");
  return `${Number(h)}h${m}`;
}
