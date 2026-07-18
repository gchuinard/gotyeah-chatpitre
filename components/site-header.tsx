import Link from "next/link";

import { MobileNav } from "@/components/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";

/// En-tête partagée des pages publiques. Wordmark Newsreader italique à
/// gauche, navigation Manrope au centre (sous lg : remplacée par un
/// hamburger MobileNav qui ouvre un Dialog plein-écran), bouton
/// « Réserver » paprika à droite. Sticky avec filet d'encre fin.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cp-ink/30 bg-cp-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4 sm:gap-10 sm:px-10">
        <Link
          href="/"
          aria-label="Le Chat-Pitre, accueil"
          className="shrink-0 transition-colors hover:text-cp-paprika focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cp-paprika"
        >
          <Wordmark className="text-xl sm:text-2xl" />
        </Link>

        <nav
          aria-label="Sections du site"
          className="ml-auto hidden items-center gap-6 lg:flex"
        >
          {NAV_ACTION.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-body text-sm font-semibold text-cp-ink-soft transition-colors hover:text-cp-paprika"
            >
              {l.label}
            </Link>
          ))}
          {/* Filet vertical : sépare le bloc « action » du duo de présentation. */}
          <span aria-hidden className="h-4 w-px shrink-0 bg-cp-ink/25" />
          {NAV_PRESENTATION.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-body text-sm font-semibold text-cp-ink-soft transition-colors hover:text-cp-paprika"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <Link
            href="/login"
            className="hidden font-body text-sm font-semibold text-cp-ink-soft transition-colors hover:text-cp-paprika sm:inline-block lg:inline-block"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({
              size: "sm",
              className: "hidden whitespace-nowrap sm:inline-flex",
            })}
          >
            Réserver →
          </Link>
          <MobileNav
            actionLinks={NAV_ACTION}
            presentationLinks={NAV_PRESENTATION}
          />
        </div>
      </div>
    </header>
  );
}

/// Bloc « action » : ce pour quoi on vient (conditions, tarif, déroulement,
/// questions). Vient en premier, puis le duo de présentation du lieu, les
/// deux séparés par un filet.
const NAV_ACTION: { href: string; label: string }[] = [
  { href: "/#admission", label: "Admission" },
  { href: "/#tarif", label: "Tarif" },
  { href: "/#deroulement", label: "Déroulement" },
  { href: "/#questions", label: "Questions" },
];

const NAV_PRESENTATION: { href: string; label: string }[] = [
  { href: "/le-lieu", label: "Le lieu" },
  { href: "/a-propos", label: "À propos" },
];
