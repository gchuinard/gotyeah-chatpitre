import { redirect } from "next/navigation";

/// La liste des pensionnaires n'existe plus.
///
/// Elle faisait doublon avec la section « Ma troupe » du tableau de bord : pour
/// un client qui a un ou deux chats, elle affichait deux cartes et rien d'autre.
///
/// La route est CONSERVÉE en redirection plutôt que supprimée. Des liens ont pu
/// partir par notification, être mis en favori ou tapés de mémoire ; les faire
/// tomber sur une page d'erreur serait une régression alors que la destination
/// utile existe toujours. Les liens INTERNES, eux, ont tous été repointés sur
/// /dashboard : cette redirection est un filet, pas un chemin normal.
export default function CatsListRedirect() {
  redirect("/dashboard");
}
