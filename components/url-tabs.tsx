import Link from "next/link";

import { cn } from "@/lib/utils";

/// Onglets portés par l'URL, et non par un état React.
///
/// Ce choix n'est pas cosmétique. Les pages qui s'en servent sont des Server
/// Components qui se rafraîchissent après chaque action (enregistrer un avis,
/// un encaissement, un message). Un onglet tenu en mémoire serait remis à zéro
/// à chaque enregistrement, et renverrait l'utilisateur au premier onglet
/// précisément au moment où il travaille dans le second. Passer par l'URL rend
/// aussi l'onglet partageable par lien, atteignable depuis une notification, et
/// correctement restauré par le bouton « précédent » du navigateur.
///
/// Ce sont donc de vrais liens, pas un `role="tab"` : la navigation clavier et
/// le clic milieu fonctionnent nativement, et `aria-current` annonce l'onglet
/// actif.

export type UrlTabItem<T extends string> = {
  value: T;
  label: string;
  /// Compteur facultatif affiché à côté du libellé.
  count?: number;
};

/// Lit la valeur d'onglet demandée dans l'URL en la bornant aux valeurs
/// permises. Toute valeur inconnue, absente ou en double retombe sur la
/// première : une URL bricolée à la main ne doit pas produire un écran vide.
export function resolveTab<T extends string>(
  raw: string | string[] | undefined,
  items: readonly UrlTabItem<T>[],
): T {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const match = items.find((i) => i.value === value);
  return match ? match.value : items[0].value;
}

export function UrlTabs<T extends string>({
  items,
  active,
  basePath,
  param = "onglet",
  ariaLabel,
  className,
}: {
  items: readonly UrlTabItem<T>[];
  active: T;
  /// Chemin de la page, sans paramètre de recherche.
  basePath: string;
  param?: string;
  /// Ce que la barre d'onglets navigue, pour les lecteurs d'écran.
  ariaLabel: string;
  className?: string;
}) {
  return (
    <nav aria-label={ariaLabel} className={cn("border-b border-cp-ink", className)}>
      <ul className="flex flex-wrap gap-x-6 gap-y-1">
        {items.map((item, index) => {
          const isActive = item.value === active;
          // Le premier onglet est celui par défaut : son lien ne porte aucun
          // paramètre, pour que l'URL nue de la page reste l'URL canonique.
          const href = index === 0 ? basePath : `${basePath}?${param}=${item.value}`;
          return (
            <li key={item.value}>
              <Link
                href={href}
                // Sans ça, changer d'onglet renvoie en haut de la page : on
                // travaille dans le second onglet, et chaque aller-retour
                // oblige à redescendre. Ici la barre reste sous les yeux.
                scroll={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex items-baseline gap-2 border-b-2 px-1 py-3 font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] transition-colors",
                  isActive
                    ? "border-cp-paprika text-cp-paprika"
                    : "border-transparent text-cp-ink-soft hover:text-cp-ink",
                )}
              >
                {item.label}
                {item.count !== undefined && (
                  <span
                    className={cn(
                      "font-display text-sm font-bold tracking-normal",
                      isActive ? "text-cp-paprika" : "text-cp-ink/40",
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
