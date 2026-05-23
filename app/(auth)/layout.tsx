import type { ReactNode } from "react";
import Link from "next/link";

import { CatIllustration } from "@/components/cat-illustration";
import { LibraryStamp } from "@/components/library-stamp";
import { Wordmark } from "@/components/wordmark";

/// Layout des pages d'authentification : split « page de titre / page de
/// contenu ». Panneau gauche cobalt avec wordmark + citation + grand chat
/// illustré. Panneau droit paper, formulaire centré. Sur mobile, le
/// panneau gauche se replie en bande supérieure compacte.

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] lg:grid-cols-[5fr_7fr] lg:grid-rows-1">
      {/* Panneau gauche — page de titre, cobalt */}
      <aside className="relative flex flex-col gap-10 overflow-hidden bg-cp-cobalt p-6 text-cp-paper sm:p-10 lg:gap-12 lg:p-14">
        <div className="relative flex items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Le Chat-Pitre — accueil"
            className="transition-colors hover:text-cp-canari focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cp-canari"
          >
            <Wordmark className="text-base text-cp-paper sm:text-lg" />
          </Link>
          <LibraryStamp tone="paprika" className="text-cp-canari">
            Édition 2026
          </LibraryStamp>
        </div>

        <div className="relative flex flex-1 flex-col justify-center gap-8">
          <p className="font-display text-3xl italic leading-[1.06] text-cp-paper sm:text-4xl lg:text-4xl xl:text-5xl">
            « Vous nous confiez un chat.{" "}
            <span className="text-cp-canari">Nous vous en rendons compte.</span>{" "}
            C&apos;est tout ce que cette maison sait faire. »
          </p>

          {/* Grande illustration de chat — paprika qui flotte sur cobalt */}
          <div className="hidden max-w-sm overflow-hidden rounded-md border-2 border-cp-canari shadow-[8px_8px_0_0_var(--color-cp-canari)] lg:block">
            <CatIllustration
              variant="paprika"
              pose="watching"
              ariaLabel="Chat observant"
              className="aspect-square w-full"
            />
          </div>
        </div>

        <div className="relative hidden items-end justify-between gap-3 lg:flex">
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cp-paper/70">
            N° 047 — rue de la Chartreuse — Bordeaux
          </p>
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-cp-paper/70">
            Établissement permanent
          </p>
        </div>
      </aside>

      {/* Panneau droit — formulaire */}
      <section className="flex flex-col">
        <header className="flex items-center justify-end gap-6 border-b border-cp-ink/30 px-6 py-4 sm:px-10">
          <Link
            href="/"
            className="font-body text-sm font-semibold text-cp-ink-soft transition-colors hover:text-cp-paprika"
          >
            ← Retour à l&apos;accueil
          </Link>
        </header>

        <div className="flex flex-1 items-start justify-center px-6 py-12 sm:px-10 sm:py-20 lg:items-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </div>
  );
}
