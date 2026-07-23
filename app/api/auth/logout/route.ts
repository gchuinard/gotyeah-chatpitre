import { destroySession } from "@/lib/auth";

/// POST /api/auth/logout — ferme la session.
///
/// La redirection porte un Location RELATIF, jamais une URL construite depuis
/// `req.url`, et c'est tout le sujet.
///
/// Dans le conteneur, `req.url` vaut l'adresse d'écoute interne : en
/// production, `new URL("/login", req.url)` produisait
/// `https://0.0.0.0:3000/login`. Le navigateur suivait cette adresse
/// injoignable, la requête échouait, et la déconnexion restait bloquée sur la
/// page courante alors que le cookie, lui, était déjà supprimé. D'où le
/// symptôme : rien ne se passe au clic, mais un rafraîchissement manuel
/// déconnecte bien.
///
/// Un chemin relatif est résolu par celui qui reçoit la réponse, avec le vrai
/// hôte public. Rien à deviner côté serveur, donc rien à casser derrière un
/// proxy. Cette redirection ne sert plus qu'au cas sans JavaScript : le menu
/// utilisateur, lui, ne la suit pas et navigue de lui-même.
export async function POST() {
  await destroySession();
  return new Response(null, {
    status: 303,
    headers: { Location: "/login" },
  });
}
