import { getCurrentUser } from "@/lib/auth";

/// Tableau de bord client (placeholder — UI à styler plus tard).
export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Tableau de bord</h1>
      <p className="text-muted-foreground">
        Bonjour {user?.firstName ?? ""} — espace client (placeholder).
      </p>
    </div>
  );
}
