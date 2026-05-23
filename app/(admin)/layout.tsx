import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ClientHeader } from "@/components/client-header";
import { LibraryStamp } from "@/components/library-stamp";
import type { NotificationItem } from "@/components/notification-bell";
import { Wordmark } from "@/components/wordmark";
import { getCurrentUser, isAdmin } from "@/lib/auth";

/// Layout de l'administration : session valide + email admin requis.
/// Sinon 403. Le ClientHeader est réutilisé en variant=admin (nav admin,
/// menu utilisateur avec « Espace client » comme passerelle).

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdmin(user)) {
    return <Forbidden />;
  }

  // Notifications admin = demandes en attente + questions client.
  const notifications: NotificationItem[] = [
    {
      id: "an-1",
      label: "Nouvelle demande N° 127 — Hugolin (Albert R.-G.) — 12 → 18 mai",
      timeAgo: "il y a 1 h",
      unread: true,
      href: "/admin/bookings/127",
    },
    {
      id: "an-2",
      label: "Question posée à Henriette sur le séjour N° 124 — réponse en attente",
      timeAgo: "il y a 3 j",
      unread: true,
      href: "/admin/bookings/124",
    },
    {
      id: "an-3",
      label: "Nouveau message de Henriette Berthier sur N° 121.",
      timeAgo: "hier",
      unread: false,
      href: "/admin/bookings/121",
    },
  ];

  return (
    <>
      <ClientHeader
        variant="admin"
        user={{
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }}
        notifications={notifications}
      />
      <main className="flex-1">{children}</main>
    </>
  );
}

function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <LibraryStamp boxed>§ 403 — Accès refusé</LibraryStamp>
      <h1 className="font-display text-6xl font-medium leading-none tracking-tight text-cp-ink">
        403
      </h1>
      <Wordmark className="text-2xl" />
      <p className="max-w-md font-display text-xl italic text-cp-ink-soft">
        Cet espace est réservé à l&apos;administration de la maison. Si vous
        pensez que c&apos;est une erreur, écrivez-nous.
      </p>
    </div>
  );
}
