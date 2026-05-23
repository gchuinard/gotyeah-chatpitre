import type { Metadata } from "next";

import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";

export const metadata: Metadata = {
  title: "Mentions légales — Le Chat-Pitre",
  description: "Mentions légales du site Le Chat-Pitre.",
};

/// Mentions légales — squelette en articles numérotés style code juridique.
/// Contenu de placeholder à remplir avec les informations définitives du
/// client (raison sociale, SIRET, hébergeur réel).

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-20 sm:px-10 sm:py-28">
      <header className="space-y-6">
        <LibraryStamp boxed>
          N° 003 — Mentions légales — En vigueur depuis 2024
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl lg:text-7xl">
          Mentions
          <br />
          <span className="italic font-normal">légales</span>
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft sm:text-2xl">
          Les informations exigées par la loi française à propos du présent
          site et de la maison qui le porte.
        </p>
      </header>

      <RuleDivider weight="heavy" className="my-16" />

      <div className="space-y-14">
        <Article number="01" title="Éditeur du site">
          <p>
            Le présent site internet est édité par la maison « Le Chat-Pitre »,
            entreprise individuelle, dont le siège est sis :
          </p>
          <p className="font-mono text-sm not-italic uppercase tracking-[0.12em] text-cp-ink-soft">
            N° 047 — rue de la Chartreuse — 33000 Bordeaux
          </p>
          <p>
            Téléphone : <em>à compléter</em> · SIRET : <em>à compléter</em> ·
            TVA non applicable, art. 293 B du CGI.
          </p>
        </Article>

        <Article number="02" title="Directeur de la publication">
          <p>
            Le directeur de la publication est le propriétaire de
            l&apos;entreprise individuelle « Le Chat-Pitre ».
          </p>
        </Article>

        <Article number="03" title="Hébergeur">
          <p>
            Le site est hébergé sur un serveur personnel autoadministré,
            situé en France métropolitaine. <em>Coordonnées techniques
            d&apos;hébergement à préciser le cas échéant.</em>
          </p>
        </Article>

        <Article number="04" title="Propriété intellectuelle">
          <p>
            L&apos;ensemble des éléments composant le site (textes,
            photographies, illustrations, identité graphique) est protégé par
            le droit d&apos;auteur. Toute reproduction, totale ou partielle,
            est soumise à autorisation préalable écrite.
          </p>
        </Article>

        <Article number="05" title="Données personnelles">
          <p>
            Les données collectées via les formulaires du site (compte,
            réservation, fiches félines) sont traitées par la maison aux
            seules fins de gestion des séjours. Elles ne sont jamais cédées à
            des tiers.
          </p>
          <p>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
            de rectification et d&apos;effacement, en écrivant à{" "}
            <a
              href="mailto:bonjour@chat-pitre.fr"
              className="underline underline-offset-4 decoration-cp-ink/40 hover:text-cp-paprika hover:decoration-cp-paprika"
            >
              bonjour@chat-pitre.fr
            </a>
            .
          </p>
        </Article>

        <Article number="06" title="Cookies">
          <p>
            Le site dépose un unique cookie technique, indispensable au
            maintien de la session de connexion. Aucun cookie de mesure ni
            cookie publicitaire n&apos;est utilisé.
          </p>
        </Article>

        <Article number="07" title="Droit applicable">
          <p>
            Le présent site est régi par le droit français. Tout litige
            relèvera de la compétence des tribunaux du ressort du siège.
          </p>
        </Article>
      </div>

      <RuleDivider weight="heavy" className="mt-16" />

      <p className="mt-10 font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft">
        § fin du document — version provisoire à compléter
      </p>
    </article>
  );
}

function Article({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <header className="flex items-baseline gap-4">
        <span className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-cp-paprika">
          § {number}
        </span>
        <h2 className="font-display text-2xl font-medium leading-tight tracking-tight text-cp-ink sm:text-3xl">
          {title}
        </h2>
      </header>
      <div className="space-y-3 border-l border-cp-ink/30 pl-6 font-body text-base leading-relaxed text-cp-ink">
        {children}
      </div>
    </section>
  );
}
