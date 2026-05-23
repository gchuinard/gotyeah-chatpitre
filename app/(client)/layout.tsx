import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ClientHeader } from "@/components/client-header";
import type { NotificationItem } from "@/components/notification-bell";
import { getCurrentUser } from "@/lib/auth";

/// Layout de l'espace client : exige une session valide (redirect /login),
/// affiche le ClientHeader brutalist (wordmark + nav + cloche + user menu)
/// et passe les enfants. Les notifications sont des maquettes statiques —
/// le câblage Prisma viendra dans le prompt #3.
export default async function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Maquettes statiques — refléteront plus tard /api/notifications.
  const notifications: NotificationItem[] = [
    {
      id: "n-1",
      label: "La maison vous demande une précision sur le séjour N° 124.",
      timeAgo: "il y a 2 h",
      unread: true,
      href: "/dashboard/bookings/124",
    },
    {
      id: "n-2",
      label: "Votre séjour N° 121 a été confirmé.",
      timeAgo: "hier",
      unread: true,
      href: "/dashboard/bookings/121",
    },
    {
      id: "n-3",
      label: "Réservation N° 124 enregistrée — en attente de relecture.",
      timeAgo: "22 fév",
      href: "/dashboard/bookings/124",
    },
    {
      id: "n-4",
      label: "Bienvenue dans la maison — votre compte est ouvert.",
      timeAgo: "10 fév",
      href: "/dashboard",
    },
  ];

  return (
    <>
      <ClientHeader
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
