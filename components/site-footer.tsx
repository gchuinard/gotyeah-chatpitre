import Link from "next/link";

import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { Wordmark } from "@/components/wordmark";

/// Pied de page partagé des pages publiques. Colophon brutalist editorial :
/// wordmark + adresse en colonne, mentions légales en grille mono, copyright
/// final. Pas de réseaux sociaux. Pas de newsletter. Une fiche, un point.
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-cp-ink bg-cp-paper-deep">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <div className="space-y-6">
            <Wordmark as="div" className="text-3xl sm:text-4xl" />
            <p className="font-display text-lg italic leading-snug text-cp-ink-soft">
              Maison de villégiature pour félins de bonne compagnie.
            </p>
            <address className="not-italic font-body text-sm leading-relaxed text-cp-ink">
              N° 047 — rue de la Chartreuse
              <br />
              33000 Bordeaux
              <br />
              <a
                href="mailto:bonjour@chat-pitre.fr"
                className="underline underline-offset-4 decoration-cp-ink/40 hover:decoration-cp-paprika hover:text-cp-paprika"
              >
                bonjour@chat-pitre.fr
              </a>
            </address>
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <FooterColumn title="La maison">
              <FooterLink href="/le-lieu">Le lieu</FooterLink>
              <FooterLink href="/#admission">Conditions d&apos;admission</FooterLink>
              <FooterLink href="/#tarif">Tarif des séjours</FooterLink>
              <FooterLink href="/#deroulement">Déroulement</FooterLink>
              <FooterLink href="/#questions">Questions</FooterLink>
            </FooterColumn>

            <FooterColumn title="Pratique">
              <FooterLink href="/signup">Réserver un séjour</FooterLink>
              <FooterLink href="/login">Se connecter</FooterLink>
              <FooterLink href="/mentions-legales">Mentions légales</FooterLink>
              <FooterLink href="/cgv">Conditions générales</FooterLink>
              <FooterLink href="/styleguide">Styleguide</FooterLink>
            </FooterColumn>
          </div>
        </div>

        <RuleDivider className="my-12" />

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <LibraryStamp>
            § colophon · établissement permanent
          </LibraryStamp>
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
            © {year} — Le Chat-Pitre
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
        {title}
      </h2>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="font-body text-sm text-cp-ink underline-offset-4 decoration-[1.5px] decoration-cp-ink/20 hover:underline hover:decoration-cp-paprika hover:text-cp-paprika"
      >
        {children}
      </Link>
    </li>
  );
}
