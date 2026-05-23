import type { Metadata } from "next";
import type { ReactNode } from "react";

import {
  BookingStatusBadge,
  type BookingStatus,
} from "@/components/booking-status-badge";
import { CatCard } from "@/components/cat-card";
import { Field } from "@/components/field";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wordmark } from "@/components/wordmark";

/// Page de référence du design system. Publique, hors `(public)` (donc sans
/// chrome partagé). À supprimer ou à conserver une fois la DA validée.
export const metadata: Metadata = {
  title: "Styleguide — Le Chat-Pitre",
  description: "Langage visuel du site : palette, typographies, composants.",
};

const PALETTE: {
  name: string;
  hex: string;
  usage: string;
  ink?: "light" | "dark";
}[] = [
  { name: "cp-paper", hex: "#FFF1D9", usage: "Fond unique — crème chaud", ink: "dark" },
  {
    name: "cp-paper-deep",
    hex: "#F5E3BD",
    usage: "Crème profond, sections neutres",
    ink: "dark",
  },
  { name: "cp-ink", hex: "#0A0A0A", usage: "Texte principal", ink: "light" },
  {
    name: "cp-ink-soft",
    hex: "#2A2A2A",
    usage: "Texte secondaire",
    ink: "light",
  },
  { name: "cp-rule", hex: "#1A1A1A", usage: "Filets, traits", ink: "light" },
  {
    name: "cp-mute",
    hex: "#6A6A6A",
    usage: "Texte estompé, états passés",
    ink: "light",
  },
  {
    name: "cp-sanguine",
    hex: "#7A1818",
    usage: "Accent unique — CTA, alerte",
    ink: "light",
  },
  {
    name: "cp-sanguine-deep",
    hex: "#5A1010",
    usage: "Hover sanguine",
    ink: "light",
  },
];

const FESTIVE: {
  name: string;
  hex: string;
  usage: string;
}[] = [
  { name: "cp-saffron", hex: "#FAE08C", usage: "Acte 01 — Admission (home)" },
  { name: "cp-coral", hex: "#FFC2B0", usage: "Acte 02 — Tarif (home)" },
  { name: "cp-mint", hex: "#C5E1D2", usage: "Acte 03 — Déroulement (home)" },
  { name: "cp-lavande", hex: "#D7C8E8", usage: "Acte 04 — Questions (home)" },
];

const STATUSES: BookingStatus[] = [
  "PENDING",
  "QUESTION_ASKED",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      {/* En-tête fiche bibliothèque */}
      <header className="space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <LibraryStamp boxed>
            N° 001 — Design System — Édition 2026
          </LibraryStamp>
          <LibraryStamp>Représentation permanente</LibraryStamp>
        </div>

        <Wordmark
          as="h1"
          className="cp-fade text-[clamp(3.5rem,12vw,9rem)]"
        />

        <p
          className="cp-reveal max-w-2xl font-display text-2xl italic leading-snug text-cp-ink-soft sm:text-3xl"
          style={{ "--cp-delay": "120ms" } as React.CSSProperties}
        >
          Langage visuel — brutalist editorial, fiche bibliothèque, encre noire
          sur crème chaud. Polychromie festive par acte sur la home. Pas
          d&apos;ornement. Que de la typographie.
        </p>
      </header>

      <RuleDivider className="my-20" weight="heavy" />

      {/* 01 — Palette */}
      <section aria-labelledby="sg-palette" className="space-y-10">
        <SectionHeading
          number="01"
          title="Palette"
          kicker="Huit couleurs structurelles + quatre festives par acte."
        />

        <div className="space-y-5">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-sanguine">
            § structurelles — partout
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {PALETTE.map((c) => (
              <Swatch key={c.name} {...c} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-sanguine">
            § festives — fond par acte de la home
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {FESTIVE.map((c) => (
              <Swatch key={c.name} {...c} ink="dark" />
            ))}
          </div>
        </div>

        <p className="max-w-2xl font-body text-sm leading-relaxed text-cp-ink-soft">
          <span className="font-mono font-bold uppercase tracking-[0.16em] text-cp-sanguine">
            Sanguine
          </span>{" "}
          reste l&apos;accent unique : CTA, alerte, refus, focus. Les quatre
          couleurs festives n&apos;apparaissent <strong>que sur la home</strong>{" "}
          (un fond par acte) ; les pages internes restent en crème chaud
          pour ne pas distraire pendant le travail.
        </p>
      </section>

      <RuleDivider className="my-20" label="Typographies" />

      {/* 02 — Typographies */}
      <section aria-labelledby="sg-typo" className="space-y-12">
        <SectionHeading
          number="02"
          title="Typographies"
          kicker="Trois voix pour trois rôles."
        />

        <FontSample
          label="Display — Bodoni Moda"
          variable="font-display"
          weight="400 / 700 + italique"
          usage="Très grands titres, noms de pensionnaires en italique."
          sample={
            <div className="space-y-6 text-cp-ink">
              <p className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-[0.02em] sm:text-7xl">
                Maison de villégiature
              </p>
              <p className="font-display text-3xl italic leading-snug text-cp-ink-soft sm:text-4xl">
                Madame Cliquot · européenne · 6 ans
              </p>
            </div>
          }
        />

        <FontSample
          label="Body — Inter"
          variable="font-body"
          weight="variable"
          usage="Corps de texte, navigation, formulaires."
          sample={
            <p className="max-w-2xl font-body text-base leading-relaxed text-cp-ink">
              Le corps de texte courant : lisible, sobre, sans afféterie. Il
              porte les informations pratiques quand le titre fait l&apos;affiche.
              Sur fond bone, l&apos;encre profonde garantit le contraste exigé
              par la maison.
            </p>
          }
        />

        <FontSample
          label="Mono — Space Mono"
          variable="font-mono"
          weight="400 / 700"
          usage="Mentions catalogue, numéros, métadonnées."
          sample={
            <p className="font-mono text-sm font-bold uppercase tracking-[0.22em] text-cp-ink-soft">
              N° 047 — Rue de la Chartreuse — Bordeaux — Est. 2024
            </p>
          }
        />
      </section>

      <RuleDivider className="my-20" label="Boutons" />

      {/* 03 — Boutons */}
      <section aria-labelledby="sg-buttons" className="space-y-10">
        <SectionHeading
          number="03"
          title="Boutons"
          kicker="Encre pleine, alternative outline, action sanguine."
        />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Réserver un séjour</Button>
            <Button variant="secondary">Se connecter</Button>
            <Button variant="outline">Voir les détails</Button>
            <Button variant="ghost">Annuler</Button>
            <Button variant="destructive">Refuser le séjour</Button>
            <Button variant="link">en savoir plus</Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Petit</Button>
            <Button size="default">Standard</Button>
            <Button size="lg">Plus grand</Button>
            <Button disabled>Désactivé</Button>
          </div>
        </div>
      </section>

      <RuleDivider className="my-20" label="Statuts" />

      {/* 04 — Statuts */}
      <section aria-labelledby="sg-statuses" className="space-y-8">
        <SectionHeading
          number="04"
          title="Statuts de séjour"
          kicker="Les six états d'une réservation."
        />
        <div className="flex flex-wrap items-center gap-3">
          {STATUSES.map((s) => (
            <BookingStatusBadge key={s} status={s} />
          ))}
        </div>
        <p className="max-w-2xl font-body text-sm leading-relaxed text-cp-ink-soft">
          Numéro d&apos;ordre + libellé mono caps. Sanguine signale l&apos;action
          requise (question, refus). Encre pleine valide l&apos;engagement
          (acceptation). Mute neutralise (annulé, terminé).
        </p>
      </section>

      <RuleDivider className="my-20" label="Formulaire" />

      {/* 05 — Champs de formulaire */}
      <section aria-labelledby="sg-form" className="space-y-10">
        <SectionHeading
          number="05"
          title="Champs de formulaire"
          kicker="Trait fin, focus sanguine, indication italique."
        />

        <div className="grid gap-8 sm:grid-cols-2">
          <Field
            label="Email"
            htmlFor="sg-email"
            required
            hint="Renseigné dans votre fiche."
          >
            <Input
              id="sg-email"
              type="email"
              placeholder="adresse@maison.fr"
              defaultValue="madame.cliquot@chat-pitre.fr"
            />
          </Field>

          <Field
            label="Mot de passe"
            htmlFor="sg-password"
            required
            error="Le mot de passe doit faire au moins 8 caractères."
          >
            <Input
              id="sg-password"
              type="password"
              defaultValue="court"
              aria-invalid="true"
            />
          </Field>
        </div>
      </section>

      <RuleDivider className="my-20" label="Cartouches & sections" />

      {/* 06 — Section + ruled box */}
      <section aria-labelledby="sg-section" className="space-y-12">
        <SectionHeading
          number="06"
          title="Composition d'une section"
          kicker="Numéro, filet, titre, kicker italique, corps."
        />

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <article className="space-y-6">
            <SectionHeading
              number="A"
              title="Exemple"
              kicker="Une mise en page typique du site."
              as="h3"
            />

            <p className="font-body text-base leading-relaxed text-cp-ink">
              La section commence par un numéro d&apos;entrée mono sanguine.
              Le titre est en Bodoni Moda. Le kicker en italique. Le corps
              en Inter. Toute la composition se lit comme une fiche de
              catalogue : on entre par le numéro, on confirme par le titre.
            </p>
          </article>

          <RuledBox variant="deep" as="blockquote" className="font-display italic">
            <p className="text-xl leading-snug text-cp-ink sm:text-2xl">
              « Pour être admis sur la scène de notre établissement, le
              félin se doit d&apos;être stérilisé, identifié, vacciné, et
              sociable avec ses congénères. »
            </p>
            <p className="mt-4 font-mono text-[0.65rem] font-bold not-italic uppercase tracking-[0.22em] text-cp-sanguine">
              § 02 — Règlement de la maison
            </p>
          </RuledBox>
        </div>
      </section>

      <RuleDivider className="my-20" label="Fiches" />

      {/* 07 — Cat cards */}
      <section aria-labelledby="sg-cat" className="space-y-8">
        <SectionHeading
          number="07"
          title="Fiches de pensionnaires"
          kicker="Numéro de catalogue, nom italique, critères d'admission."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CatCard
            reference="003"
            name="Madame Cliquot"
            sex="FEMALE"
            breed="Européenne tricolore"
            ageLabel="6 ans"
            criteria={{
              sterilized: true,
              identified: true,
              vaccines: true,
              sociable: true,
            }}
          />
          <CatCard
            reference="012"
            name="Maestro"
            sex="MALE"
            breed="Chartreux"
            ageLabel="3 ans"
            criteria={{
              sterilized: true,
              identified: true,
              vaccines: false,
              sociable: true,
            }}
          />
          <CatCard
            reference="024"
            name="Salami"
            sex="MALE"
            breed="Roux des toits"
            ageLabel="1 an"
            criteria={{
              sterilized: false,
              identified: false,
              vaccines: true,
              sociable: true,
            }}
          />
        </div>
      </section>

      <RuleDivider className="mt-24 mb-12" weight="heavy" />

      <footer className="flex flex-col gap-3 pb-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <LibraryStamp>Fin du document — § 07</LibraryStamp>
        <p className="font-body text-xs italic text-cp-ink-soft">
          Page de référence — supprimable une fois la DA validée.
        </p>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers internes à la page                                          */
/* ------------------------------------------------------------------ */

function Swatch({
  name,
  hex,
  usage,
}: {
  name: string;
  hex: string;
  usage: string;
  ink?: "light" | "dark";
}) {
  return (
    <div className="border border-cp-ink bg-cp-paper">
      <div
        className="h-24 w-full border-b border-cp-ink"
        style={{ backgroundColor: hex }}
      />
      <div className="space-y-1 px-3 py-3">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-cp-ink">
          {name}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-cp-ink-soft">
          {hex}
        </p>
        <p className="font-body text-xs leading-snug text-cp-ink-soft">
          {usage}
        </p>
      </div>
    </div>
  );
}

function FontSample({
  label,
  variable,
  weight,
  usage,
  sample,
}: {
  label: string;
  variable: string;
  weight: string;
  usage: string;
  sample: ReactNode;
}) {
  return (
    <div className="space-y-4 border-t border-cp-ink/30 pt-8 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-cp-sanguine">
          {label}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-cp-ink-soft">
          .{variable} · {weight}
        </p>
      </div>
      <p className="font-body text-sm italic text-cp-ink-soft">{usage}</p>
      <div className="pt-2">{sample}</div>
    </div>
  );
}
