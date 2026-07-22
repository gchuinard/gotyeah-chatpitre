"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/// Renvoi vers l'AUTRE écran d'authentification, dans l'en-tête.
///
/// Le renvoi principal vit en pied de formulaire, discret, identique sur les
/// deux écrans. Ce second lien existe pour un cas précis : celui qui atterrit
/// sur l'inscription alors qu'il a déjà un compte. Sans lui, il devait faire
/// défiler douze champs avant de trouver comment se connecter.
///
/// Composant client parce que le layout d'authentification est partagé par les
/// deux pages et ne sait pas, côté serveur, laquelle il rend.
export function AuthSwitchLink() {
  const pathname = usePathname();
  const onSignup = pathname?.startsWith("/signup");

  return (
    <Link
      href={onSignup ? "/login" : "/signup"}
      className="font-body text-sm font-semibold text-cp-ink-soft transition-colors hover:text-cp-paprika"
    >
      {onSignup ? "Se connecter" : "Créer un compte"}
    </Link>
  );
}
