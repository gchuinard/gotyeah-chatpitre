"use client";

import { useEffect } from "react";
import Link from "next/link";

import { CatIllustration } from "@/components/cat-illustration";
import { LibraryStamp } from "@/components/library-stamp";
import { Wordmark } from "@/components/wordmark";
import { Button, buttonVariants } from "@/components/ui/button";

/// Page d'erreur 500 — convention Next.js App Router : un fichier
/// `app/error.tsx` *client* qui reçoit `error` + `reset`. Il enveloppe
/// les enfants du layout en error boundary ; un crash dans une page
/// remonte ici plutôt que de casser le shell.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log côté client pour faciliter le diagnostic en dev / chez le client.
    console.error("[Chat-Pitre] page error", error);
  }, [error]);

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
        <LibraryStamp tone="paprika">Erreur 500</LibraryStamp>
      </header>

      <div className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[5fr_4fr] lg:gap-16">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cp-paprika">
            cinq-cents
          </p>
          <h1 className="mt-4 font-display text-7xl font-semibold leading-[0.92] tracking-tight text-cp-ink sm:text-8xl lg:text-9xl">
            500
          </h1>
          <p className="mt-6 font-display text-3xl italic leading-snug text-cp-ink sm:text-4xl">
            Quelque chose ne va pas.
          </p>
          <p className="mt-4 max-w-lg font-body text-base leading-relaxed text-cp-ink-soft sm:text-lg">
            Le moteur a toussé. Ce n&apos;est pas vous, c&apos;est nous. Le
            chat de garde dort ; on le réveille et on regarde.
          </p>

          {error.digest && (
            <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-cp-mute">
              ref. {error.digest}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button onClick={reset} size="lg" className="px-8">
              Réessayer →
            </Button>
            <Link
              href="/"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:mx-0">
          <div className="overflow-hidden rounded-md border-2 border-cp-ink shadow-[8px_8px_0_0_var(--color-cp-ink)]">
            <CatIllustration
              variant="feuille"
              pose="sleeping"
              ariaLabel="Chat endormi, le moteur tousse"
              className="aspect-square w-full"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
