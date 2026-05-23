import type { Metadata } from "next";

import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Le lieu — Le Chat-Pitre",
  description:
    "Une maison de villégiature à Bordeaux : sept chambres, un jardin clos, une cuisine, un humain.",
};

/// /le-lieu — page éditoriale décrivant la maison, ses pièces, les
/// modalités pratiques d'accès. Aucune photo réelle ; placeholders type
/// fiche catalogue (cadre encre + caption mono).

export default function LeLieuPage() {
  return (
    <article className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
      {/* En-tête éditoriale */}
      <header className="space-y-8">
        <LibraryStamp boxed>
          N° 002 — Le lieu — Représentation permanente
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-7xl lg:text-8xl">
          Une maison,
          <br />
          <span className="italic font-normal">sept chambres,</span>
          <br />
          un jardin.
        </h1>
        <p className="max-w-2xl font-display text-2xl italic leading-snug text-cp-ink-soft sm:text-3xl">
          La nôtre vit dans la verdure d&apos;un dernier carré bordelais, à
          égale distance de la gare et de la rive droite.
        </p>
      </header>

      <RuleDivider className="my-20" />

      {/* Galerie placeholder — grille asymétrique brutalist editorial */}
      <section aria-labelledby="gallery-title" className="space-y-8">
        <h2 id="gallery-title" className="sr-only">
          Images du lieu
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
          <PhotoTile
            label="La façade"
            caption="N° 047 — vue depuis la rue, fin de matinée"
            className="aspect-[4/5] lg:col-span-7 lg:row-span-2"
          />
          <PhotoTile
            label="Le jardin clos"
            caption="Mûrier centenaire, ronces taillées court"
            className="aspect-[5/4] lg:col-span-5"
          />
          <PhotoTile
            label="Une chambre"
            caption="Chambre n° 03 — exposée au sud"
            className="aspect-[5/4] lg:col-span-5"
          />
          <PhotoTile
            label="La cuisine"
            caption="Comptoir d'accueil et bocaux à régime"
            className="aspect-[3/2] lg:col-span-7"
          />
          <PhotoTile
            label="La salle commune"
            caption="Pour les chats qui s'entendent"
            className="aspect-[3/2] lg:col-span-7"
          />
        </div>
      </section>

      <RuleDivider className="my-20" />

      {/* Description articulée — chaque pièce dans son §. */}
      <section className="grid gap-12 lg:grid-cols-[1fr_2fr]">
        <SectionHeading
          number="01"
          title="La maison"
          kicker="Bâti 1908, refait 2023."
        />
        <div className="space-y-5 font-body text-base leading-relaxed text-cp-ink">
          <p>
            La maison occupe la moitié d&apos;une échoppe bordelaise, augmentée
            sur l&apos;arrière d&apos;une véranda et d&apos;un jardin clos. La
            distribution intérieure a été refaite en 2023 pour accueillir
            jusqu&apos;à sept chambres indépendantes, séparées par des cloisons
            sourdes — chaque pensionnaire dort hors de la vue et hors du nez
            des autres.
          </p>
          <p>
            Les sols sont en tomettes, les murs à la chaux. Pas de moquette,
            pas de tissus à demeure : tout se nettoie à grande eau. La
            ventilation est mécanique et silencieuse.
          </p>
        </div>
      </section>

      <RuleDivider className="my-16" />

      <section className="grid gap-12 lg:grid-cols-[1fr_2fr]">
        <SectionHeading
          number="02"
          title="Les chambres"
          kicker="Sept, identiques par principe, distinctes par caractère."
        />
        <div className="space-y-5 font-body text-base leading-relaxed text-cp-ink">
          <p>
            Chaque chambre fait six mètres carrés, ouvre sur une fenêtre, et
            comprend un point d&apos;eau, une caisse, un panier, et un perchoir
            mural. Les chats apportent leur couverture personnelle (recommandé)
            ainsi que leur croquettes habituelles.
          </p>
          <p>
            Les chats du même foyer peuvent partager une chambre. Les chats
            qui ne supportent pas la promiscuité gardent la leur sans
            interruption ; on leur réserve les espaces communs sur des
            tranches dédiées.
          </p>
        </div>
      </section>

      <RuleDivider className="my-16" />

      <section className="grid gap-12 lg:grid-cols-[1fr_2fr]">
        <SectionHeading
          number="03"
          title="Le jardin"
          kicker="Quatre-vingts mètres carrés, entièrement clos."
        />
        <div className="space-y-5 font-body text-base leading-relaxed text-cp-ink">
          <p>
            Le jardin est ceint d&apos;un grillage anti-évasion (trois mètres
            de haut, retour en visière à 45°). Il accueille un mûrier
            centenaire, un bac à herbes à chat, et une cabane en bois pour
            l&apos;observation discrète des oiseaux.
          </p>
          <p>
            L&apos;accès se fait sur planning : un chat à la fois, ou les
            membres d&apos;un même foyer ensemble. Jamais de cohabitation
            forcée.
          </p>
        </div>
      </section>

      <RuleDivider className="my-16" />

      <section className="grid gap-12 lg:grid-cols-[1fr_2fr]">
        <SectionHeading
          number="04"
          title="L'humain"
          kicker="Présent sept jours sur sept."
        />
        <div className="space-y-5 font-body text-base leading-relaxed text-cp-ink">
          <p>
            La maison est tenue par une seule personne, qui y habite. Pas de
            roulement d&apos;équipe, pas de relais. Les chats reconnaissent
            une voix, une odeur, une heure des repas, et la maison s&apos;y
            tient.
          </p>
          <p>
            En cas d&apos;empêchement (rare), un remplaçant déjà connu de la
            maison prend le relais — toujours avec passage de relais en
            présence des chats.
          </p>
        </div>
      </section>

      <RuleDivider className="my-20" />

      {/* Pratique */}
      <section
        aria-labelledby="pratique-title"
        className="grid gap-12 lg:grid-cols-[1fr_2fr]"
      >
        <SectionHeading
          number="05"
          title="Pratique"
          kicker="Adresse, accueil, accès."
        />
        <div className="grid gap-px overflow-hidden border border-cp-ink bg-cp-ink sm:grid-cols-2">
          <PracticalTile title="Adresse">
            N° 047 — rue de la Chartreuse
            <br />
            33000 Bordeaux
          </PracticalTile>
          <PracticalTile title="Accueil">
            Lundi → samedi
            <br />
            9h30 — 12h30 · 16h00 — 19h00
            <br />
            Dimanche sur rendez-vous
          </PracticalTile>
          <PracticalTile title="Tram">
            Ligne C — arrêt « Jardin botanique »
            <br />
            Trois minutes à pied
          </PracticalTile>
          <PracticalTile title="Voiture">
            Place gratuite rue Lalande
            <br />
            Zone payante rue de la Chartreuse
          </PracticalTile>
        </div>
      </section>

      <RuleDivider className="my-20" />

      {/* Citation finale */}
      <RuledBox variant="deep" className="text-center">
        <p className="font-display text-2xl italic leading-snug text-cp-ink sm:text-3xl lg:text-4xl">
          « La maison s&apos;organise autour du chat, pas l&apos;inverse.
          C&apos;est la seule règle écrite qu&apos;on tienne à conserver. »
        </p>
        <p className="mt-6 font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
          règle première — fondation 2024
        </p>
      </RuledBox>
    </article>
  );
}

/* ----- Helpers internes ------------------------------------------- */

function PhotoTile({
  label,
  caption,
  className,
}: {
  label: string;
  caption: string;
  className?: string;
}) {
  return (
    <figure
      className={`relative flex flex-col border border-cp-ink bg-cp-paper-deep ${className ?? ""}`}
    >
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span aria-hidden className="font-display text-5xl italic text-cp-ink/30">
              {label}
            </span>
            <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft/80">
              Image à venir
            </span>
          </div>
        </div>
      </div>
      <figcaption className="border-t border-cp-ink px-4 py-2.5 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
        {caption}
      </figcaption>
    </figure>
  );
}

function PracticalTile({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 bg-cp-paper p-6">
      <h3 className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
        {title}
      </h3>
      <p className="font-body text-sm leading-relaxed text-cp-ink">
        {children}
      </p>
    </div>
  );
}
