/// Vocabulaire d'occupation, partagé par les DEUX calendriers de l'application.
///
/// Il existe parce que le client et la pension parlaient de la même journée
/// avec des mots différents : le calendrier de réservation annonçait « Complet »
/// là où le tableau de bord affichait « Comble ». Quand un propriétaire écrit
/// « votre site dit complet le 14 », la pension doit lire le même mot.
///
/// Ce fichier ne dépend de RIEN : ni Prisma, ni serveur. C'est indispensable,
/// le calendrier de réservation est un composant client et importer ici une
/// couche d'accès aux données embarquerait Prisma dans le paquet du navigateur.

/// Nombre de chambres. Était écrit en dur dans le seul calendrier client.
export const CAPACITY = 7;

export type OccupancyState = "available" | "last" | "full";

/// Trois états, et non quatre.
///
/// L'ancien dégradé de densité de l'administration (libre, léger, plein,
/// comble) plaçait son dernier palier à 6 occupants ou plus, ce qui rangeait
/// dans la même case « il reste une chambre » et « il n'en reste aucune ». La
/// distinction qui compte pour accepter ou refuser une demande était donc
/// invisible. La densité, elle, reste lisible : chaque case affiche son nombre.
export function occupancyState(count: number): OccupancyState {
  if (count >= CAPACITY) return "full";
  if (count === CAPACITY - 1) return "last";
  return "available";
}

export const OCCUPANCY_LABEL: Record<OccupancyState, string> = {
  available: "Disponible",
  last: "Dernière place restante",
  full: "Complet",
};
