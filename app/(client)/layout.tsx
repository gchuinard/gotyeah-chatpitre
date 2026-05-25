import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ClientHeader } from "@/components/client-header";
import { getCurrentUser } from "@/lib/auth";
import { getNotificationsFor } from "@/lib/repository";

/// Layout de l'espace client : exige une session valide (redirect /login),
/// affiche le ClientHeader (wordmark + nav + cloche + user menu) et passe
/// les enfants. Notifications lues depuis Prisma.
export default async function ClientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await getNotificationsFor(user.id);

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
