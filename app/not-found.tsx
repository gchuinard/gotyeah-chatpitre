import Link from "next/link";

import { CatIllustration } from "@/components/cat-illustration";
import { LibraryStamp } from "@/components/library-stamp";
import { Wordmark } from "@/components/wordmark";
import { buttonVariants } from "@/components/ui/button";

/// Page d'erreur 404 — chemin inconnu. Convention Next.js : un fichier
/// `app/not-found.tsx` est rendu pour les routes inexistantes et lors des
/// appels à `notFound()` dans les pages dynamiques.
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-12 sm:px-10">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          aria-label="Le Chat-Pitre — accueil"
          className="transition-colors hover:text-cp-paprika"
        >
          <Wordmark className="text-xl sm:text-2xl" />
        </Link>
        <LibraryStamp tone="paprika">Erreur 404</LibraryStamp>
      </header>

      <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[5fr_4fr] lg:gap-16">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cp-paprika">
            quatre-cent-quatre
          </p>
          <h1 className="mt-4 font-display text-7xl font-semibold leading-[0.92] tracking-tight text-cp-ink sm:text-8xl lg:text-9xl">
            404
          </h1>
          <p className="mt-6 font-display text-3xl italic leading-snug text-cp-ink sm:text-4xl">
            Cette page n&apos;existe pas chez nous.
          </p>
          <p className="mt-4 max-w-lg font-body text-base leading-relaxed text-cp-ink-soft sm:text-lg">
            Le chat l&apos;a peut-être emportée derrière le canapé, ou
            l&apos;adresse n&apos;a jamais été correcte. Dans les deux cas,
            la maison reste là.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className={buttonVariants({ size: "lg", className: "px-8" })}
            >
              Retour à l&apos;accueil →
            </Link>
            <Link
              href="/le-lieu"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              Visiter la maison
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:mx-0">
          <div className="overflow-hidden rounded-md border-2 border-cp-ink shadow-[8px_8px_0_0_var(--color-cp-ink)]">
            <CatIllustration
              variant="paprika"
              pose="watching"
              ariaLabel="Chat observant, cherchant la page manquante"
              className="aspect-square w-full"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
