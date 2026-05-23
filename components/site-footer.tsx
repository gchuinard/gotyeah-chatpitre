import Link from "next/link";

import { CatIllustration } from "@/components/cat-illustration";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { Wordmark } from "@/components/wordmark";

/// Pied de page partagé. Colophon chaleureux avec wordmark + adresse +
/// petit chat illustré + deux colonnes de liens + copyright.
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-cp-ink bg-cp-paper-deep">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[3fr_4fr]">
          <div className="flex flex-wrap items-start gap-6">
            <CatIllustration
              variant="canari"
              pose="sitting"
              ariaLabel="Pensionnaire de la maison"
              className="size-28 shrink-0 rounded-md border border-cp-ink"
            />
            <div className="flex-1 space-y-4">
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
          </div>

          <div className="grid gap-10 sm:grid-cols-2">
            <FooterColumn title="La maison" tone="cobalt">
              <FooterLink href="/le-lieu">Le lieu</FooterLink>
              <FooterLink href="/a-propos">À propos · l&apos;humain</FooterLink>
              <FooterLink href="/#admission">Conditions d&apos;admission</FooterLink>
              <FooterLink href="/#tarif">Tarif des séjours</FooterLink>
              <FooterLink href="/#questions">Questions</FooterLink>
            </FooterColumn>

            <FooterColumn title="Pratique" tone="paprika">
              <FooterLink href="/signup">Réserver un séjour</FooterLink>
              <FooterLink href="/login">Se connecter</FooterLink>
              <FooterLink href="/mentions-legales">Mentions légales</FooterLink>
              <FooterLink href="/cgv">Conditions générales</FooterLink>
              <FooterLink href="/styleguide">Styleguide</FooterLink>
            </FooterColumn>
          </div>
        </div>

        <RuleDivider className="my-12" tone="cobalt" />

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <LibraryStamp tone="cobalt">colophon · établissement permanent</LibraryStamp>
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cp-ink-soft">
            © {year} — Le Chat-Pitre
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "cobalt" | "paprika";
  children: React.ReactNode;
}) {
  const toneClass = tone === "cobalt" ? "text-cp-cobalt" : "text-cp-paprika";
  return (
    <div className="space-y-4">
      <h2 className={`font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] ${toneClass}`}>
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
