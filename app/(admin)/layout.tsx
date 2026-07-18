import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ClientHeader } from "@/components/client-header";
import { LibraryStamp } from "@/components/library-stamp";
import { Wordmark } from "@/components/wordmark";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getNotificationsFor } from "@/lib/repository";

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

  const notifications = await getNotificationsFor(user.id);

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
      <LibraryStamp boxed>403, Accès refusé</LibraryStamp>
      <h1 className="font-display text-6xl font-medium leading-none tracking-tight text-cp-ink">
        403
      </h1>
      <Wordmark className="text-2xl" />
      <p className="max-w-md font-display text-xl italic text-cp-ink-soft">
        Cet espace est réservé à notre administration. Si vous
        pensez que c&apos;est une erreur, écrivez-nous.
      </p>
    </div>
  );
}
