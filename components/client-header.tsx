import Link from "next/link";

import { LibraryStamp } from "@/components/library-stamp";
import { NotificationBell, type NotificationItem } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";
import { Wordmark } from "@/components/wordmark";

/// En-tête de l'espace client : wordmark + navigation principale (Mon
/// espace / Pensionnaires / Séjours) + cloche de notifications + menu
/// utilisateur. Sticky avec filet noir. Composant server — les sous-blocs
/// interactifs (notifs, menu) sont les seuls clients.

/// Pas d'entrée « Pensionnaires » : la page de liste faisait doublon avec la
/// section « Ma troupe » du tableau de bord, pour un client qui a un ou deux
/// chats. « Séjours » reste, un client fidèle en accumulant assez pour justifier
/// une page à part.
export const CLIENT_NAV = [
  { href: "/dashboard", label: "Mon espace" },
  { href: "/dashboard/bookings", label: "Séjours" },
];

export function ClientHeader({
  user,
  notifications,
  variant = "client",
}: {
  user: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  };
  notifications: NotificationItem[];
  variant?: "client" | "admin";
}) {
  const isAdmin = variant === "admin";
  const nav = isAdmin
    ? [
        { href: "/admin", label: "Tableau de bord" },
        { href: "/admin/bookings", label: "Séjours" },
        { href: "/admin/clients", label: "Clients" },
        { href: "/admin/cats", label: "Pensionnaires" },
        { href: "/admin/extras", label: "Suppléments" },
        { href: "/admin/compta", label: "Compta" },
        { href: "/admin/reglages", label: "Réglages" },
      ]
    : CLIENT_NAV;

  const menuLinks = isAdmin
    ? [
        { href: "/admin", label: "Tableau de bord" },
        { href: "/admin/bookings", label: "Séjours" },
        { href: "/admin/clients", label: "Clients" },
        { href: "/admin/cats", label: "Pensionnaires" },
        { href: "/admin/extras", label: "Suppléments" },
        { href: "/admin/compta", label: "Compta" },
        { href: "/admin/reglages", label: "Réglages" },
        { href: "/dashboard", label: "Espace client →" },
      ]
    : [
        // Deuxième liste, distincte de CLIENT_NAV : le menu utilisateur a la
        // sienne. Retirer une entrée de l'une sans toucher l'autre la laisse
        // visible dans le menu déroulant.
        { href: "/dashboard", label: "Mon espace" },
        { href: "/dashboard/bookings", label: "Mes séjours" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-cp-ink bg-cp-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-6 py-3 sm:gap-8 sm:px-10">
        <Link
          href={isAdmin ? "/admin" : "/dashboard"}
          aria-label="Le Chat-Pitre, accueil"
          className="shrink-0 transition-colors hover:text-cp-paprika"
        >
          <Wordmark className="text-base sm:text-lg" />
        </Link>

        <span aria-hidden className="hidden h-6 w-px bg-cp-ink/40 sm:block" />

        <LibraryStamp
          tone={isAdmin ? "paprika" : "cobalt"}
          className="hidden md:inline-flex"
        >
          {isAdmin ? "Administration" : "Espace client"}
        </LibraryStamp>

        <nav
          aria-label={isAdmin ? "Administration" : "Espace client"}
          className="ml-auto hidden items-center gap-1 md:flex"
        >
          {nav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-sm px-3 py-2 font-body text-sm font-semibold text-cp-ink-soft transition-colors hover:bg-cp-paper-deep hover:text-cp-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <NotificationBell items={notifications} />
          <UserMenu
            firstName={user.firstName}
            lastName={user.lastName}
            email={user.email}
            links={menuLinks}
          />
        </div>
      </div>
    </header>
  );
}
