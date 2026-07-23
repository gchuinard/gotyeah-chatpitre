import crypto from "node:crypto";

/// Authentification des routes de tâches planifiées.
///
/// Le projet n'avait AUCUN ordonnanceur : tout ce qui devait se produire « au
/// bout de X jours » était contourné par un filtre calculé à l'affichage. Ce
/// contournement tenait pour l'archive des séjours, où rien n'est détruit, mais
/// pas pour l'espace Photos, qui promet au propriétaire que ses photos sont
/// EFFACÉES au bout de trente jours.
///
/// Le mécanisme retenu est celui qui tourne déjà sur ce Pi pour un autre projet
/// du parc : le cron de l'hôte appelle une route protégée par un jeton. Rien à
/// installer, rien à surveiller de plus, et les tâches sont des routes ordinaires
/// donc déclenchables à la main pour les vérifier.

/// Compare le jeton fourni à celui attendu, en temps constant.
///
/// timingSafeEqual et non `===` : une comparaison qui s'arrête au premier
/// caractère différent laisse mesurer où elle s'est arrêtée, et un attaquant
/// peut reconstruire le secret octet par octet. Le contrôle de longueur passe
/// d'abord, timingSafeEqual exigeant deux tampons de même taille.
export function isCronAuthorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  // Sans secret configuré, on REFUSE. Laisser passer serait pire que l'absence
  // de tâche planifiée : la route deviendrait publique.
  if (!expected) return false;

  const header = req.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;

  const provided = Buffer.from(header.slice(prefix.length));
  const secret = Buffer.from(expected);
  if (provided.length !== secret.length) return false;
  return crypto.timingSafeEqual(provided, secret);
}

/// Réponse d'une tâche : ce qu'elle a fait, en clair.
///
/// Une tâche qui répond « ok » sans rien dire est indistinguable d'une tâche
/// qui ne tourne plus depuis trois semaines. Le compte traité est donc toujours
/// renvoyé, et se retrouve dans le journal du cron.
export type CronResult = Record<string, number | string>;
