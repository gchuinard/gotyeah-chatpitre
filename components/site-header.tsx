import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { LibraryStamp } from "@/components/library-stamp";
import { Wordmark } from "@/components/wordmark";

/// En-tête partagée des pages publiques. Composition fiche bibliothèque :
/// wordmark à gauche, méta-mention catalogue centrale, nav + CTA à droite.
/// Sticky avec filet d'encre en bas pour rester lisible sur le grain.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cp-ink bg-cp-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4 sm:gap-10 sm:px-10">
        <Link
          href="/"
          aria-label="Le Chat-Pitre — accueil"
          className="shrink-0 transition-colors hover:text-cp-sanguine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cp-sanguine"
        >
          <Wordmark className="text-lg sm:text-xl" />
        </Link>

        <span aria-hidden className="hidden h-7 w-px bg-cp-ink/40 sm:block" />

        <LibraryStamp className="hidden md:inline-flex">
          Maison de villégiature — Est. 2024
        </LibraryStamp>

        <nav
          aria-label="Sections du site"
          className="ml-auto hidden items-center gap-6 lg:flex"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft transition-colors hover:text-cp-sanguine"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Link
            href="/login"
            className="hidden font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft transition-colors hover:text-cp-sanguine sm:inline-block"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({
              size: "sm",
              className: "whitespace-nowrap",
            })}
          >
            Réserver →
          </Link>
        </div>
      </div>
    </header>
  );
}

const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/le-lieu", label: "Le lieu" },
  { href: "/#admission", label: "Admission" },
  { href: "/#tarif", label: "Tarif" },
  { href: "/#deroulement", label: "Déroulement" },
  { href: "/#questions", label: "Questions" },
];
