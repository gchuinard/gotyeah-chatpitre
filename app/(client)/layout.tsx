import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LogoutForm } from "@/components/logout-form";

/// Layout de l'espace client : exige une session valide.
export default async function ClientLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-semibold">Le Chat-Pitre — Espace client</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">{user.email}</span>
          <LogoutForm />
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
