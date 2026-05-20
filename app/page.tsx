import Link from "next/link";

/// Page d'accueil (placeholder — la vitrine publique sera faite plus tard).
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">Le Chat-Pitre</h1>
      <p className="text-muted-foreground">Pension féline — réservation en ligne.</p>
      <nav className="flex gap-4 text-sm underline">
        <Link href="/login">Connexion</Link>
        <Link href="/signup">Créer un compte</Link>
        <Link href="/dashboard">Mon espace</Link>
      </nav>
    </main>
  );
}
