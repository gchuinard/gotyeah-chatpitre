import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { LogoutForm } from "@/components/logout-form";

/// Layout de l'espace admin : exige une session valide ET un email admin.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!isAdmin(user)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <h1 className="text-2xl font-semibold">403 — Accès refusé</h1>
        <p className="text-muted-foreground">
          Cet espace est réservé aux administrateurs.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-semibold">Le Chat-Pitre — Administration</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{user.email}</span>
          <LogoutForm />
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
