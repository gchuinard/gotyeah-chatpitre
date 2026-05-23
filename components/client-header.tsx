import Link from "next/link";

import { LibraryStamp } from "@/components/library-stamp";
import { NotificationBell, type NotificationItem } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";
import { Wordmark } from "@/components/wordmark";

/// En-tête de l'espace client : wordmark + navigation principale (Mon
/// espace / Pensionnaires / Séjours) + cloche de notifications + menu
/// utilisateur. Sticky avec filet noir. Composant server — les sous-blocs
/// interactifs (notifs, menu) sont les seuls clients.

export const CLIENT_NAV = [
  { href: "/dashboard", label: "Mon espace" },
  { href: "/dashboard/cats", label: "Pensionnaires" },
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
      ]
    : CLIENT_NAV;

  const menuLinks = isAdmin
    ? [
        { href: "/admin", label: "Tableau de bord" },
        { href: "/admin/bookings", label: "Séjours" },
        { href: "/admin/clients", label: "Clients" },
        { href: "/dashboard", label: "Espace client →" },
      ]
    : [
        { href: "/dashboard", label: "Mon espace" },
        { href: "/dashboard/cats", label: "Mes pensionnaires" },
        { href: "/dashboard/bookings", label: "Mes séjours" },
      ];

  return (
    <header className="sticky top-0 z-40 border-b border-cp-ink bg-cp-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-6 py-3 sm:gap-8 sm:px-10">
        <Link
          href={isAdmin ? "/admin" : "/dashboard"}
          aria-label="Le Chat-Pitre — accueil"
          className="shrink-0 transition-colors hover:text-cp-sanguine"
        >
          <Wordmark className="text-base sm:text-lg" />
        </Link>

        <span aria-hidden className="hidden h-6 w-px bg-cp-ink/40 sm:block" />

        <LibraryStamp className="hidden md:inline-flex">
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
              className="border border-transparent px-3 py-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft transition-colors hover:text-cp-ink"
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
