import type { ReactNode } from "react";
import Link from "next/link";

import { LibraryStamp } from "@/components/library-stamp";
import { Wordmark } from "@/components/wordmark";

/// Layout des pages d'authentification : split « page de titre / page de
/// contenu ». Panneau gauche encre profonde avec wordmark + citation +
/// méta-mention. Panneau droit paper, formulaire centré, retour à
/// l'accueil discret. Sur mobile, le panneau gauche se replie en une
/// bande supérieure compacte.

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-rows-[auto_1fr] lg:grid-cols-[5fr_7fr] lg:grid-rows-1">
      {/* Panneau gauche — page de titre */}
      <aside className="relative flex flex-col gap-10 overflow-hidden bg-cp-ink p-6 text-cp-paper sm:p-10 lg:gap-16 lg:p-16">
        <div className="cp-grain pointer-events-none absolute inset-0 opacity-15" />

        <div className="relative flex items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Le Chat-Pitre — accueil"
            className="transition-colors hover:text-cp-paper/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cp-paper"
          >
            <Wordmark className="text-base text-cp-paper sm:text-lg" />
          </Link>
          <LibraryStamp className="text-cp-paper/70">
            Édition 2026
          </LibraryStamp>
        </div>

        <div className="relative flex flex-1 flex-col justify-center">
          <p className="font-display text-3xl italic leading-[1.05] text-cp-paper sm:text-4xl lg:text-5xl xl:text-6xl">
            « Vous nous confiez un chat. Nous vous en rendons compte.{" "}
            <span className="not-italic">— C&apos;est tout ce que cette maison sait faire.</span> »
          </p>
          <p className="mt-8 font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-sanguine">
            § règle première — fondation 2024
          </p>
        </div>

        <div className="relative hidden items-end justify-between gap-3 lg:flex">
          <LibraryStamp className="text-cp-paper/60">
            N° 047 — rue de la Chartreuse — Bordeaux
          </LibraryStamp>
          <LibraryStamp className="text-cp-paper/60">
            Établissement permanent
          </LibraryStamp>
        </div>
      </aside>

      {/* Panneau droit — formulaire */}
      <section className="flex flex-col">
        <header className="flex items-center justify-end gap-6 border-b border-cp-ink px-6 py-4 sm:px-10">
          <Link
            href="/"
            className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft transition-colors hover:text-cp-sanguine"
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
