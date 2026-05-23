import type { Metadata } from "next";
import type { ReactNode } from "react";

import {
  BookingStatusBadge,
  type BookingStatus,
} from "@/components/booking-status-badge";
import { CatCard } from "@/components/cat-card";
import {
  CatIllustration,
  type CatIllustrationPose,
  type CatIllustrationVariant,
} from "@/components/cat-illustration";
import { Field } from "@/components/field";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { RuledBox } from "@/components/ruled-box";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wordmark } from "@/components/wordmark";

/// Page de référence du design system. Publique, hors `(public)` (donc sans
/// chrome partagé).
export const metadata: Metadata = {
  title: "Styleguide — Le Chat-Pitre",
  description: "Langage visuel du site : palette, typographies, composants.",
};

const PALETTE: { name: string; hex: string; usage: string }[] = [
  { name: "cp-paper", hex: "#FFF4D9", usage: "Fond unique — crème chaud" },
  { name: "cp-paper-deep", hex: "#F7E7BA", usage: "Crème profond, sections alternées" },
  { name: "cp-ink", hex: "#0A0A0A", usage: "Texte principal" },
  { name: "cp-ink-soft", hex: "#2F2A26", usage: "Texte secondaire chaud" },
  { name: "cp-mute", hex: "#6F6A64", usage: "Texte estompé, états passés" },
];

const ACCENTS: { name: string; hex: string; usage: string }[] = [
  { name: "cp-cobalt", hex: "#1A4B8E", usage: "Primaire institutionnel — comptes, liens" },
  { name: "cp-paprika", hex: "#C9532E", usage: "Accent festif — CTA, alerte, focus" },
  { name: "cp-canari", hex: "#F4C20D", usage: "Soleil — highlights, joie pure" },
  { name: "cp-feuille", hex: "#2E7D3D", usage: "Vert vif — statuts positifs" },
];

const STATUSES: BookingStatus[] = [
  "PENDING",
  "QUESTION_ASKED",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
];

const CAT_VARIANTS: CatIllustrationVariant[] = [
  "cobalt",
  "paprika",
  "canari",
  "feuille",
];

const CAT_POSES: CatIllustrationPose[] = [
  "sitting",
  "sleeping",
  "standing",
  "watching",
];

export default function StyleguidePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      {/* En-tête */}
      <header className="space-y-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <LibraryStamp boxed>
            Design system — Édition 2026
          </LibraryStamp>
          <LibraryStamp tone="cobalt">Représentation permanente</LibraryStamp>
        </div>

        <Wordmark
          as="h1"
          className="cp-fade text-[clamp(3.5rem,12vw,9rem)]"
        />

        <p
          className="cp-reveal max-w-2xl font-display text-2xl italic leading-snug text-cp-ink-soft sm:text-3xl"
          style={{ "--cp-delay": "120ms" } as React.CSSProperties}
        >
          Langage visuel — mid-century illustré. Chats géométriques flat color
          à la Charley Harper sur palette saturée jewel-tone. Newsreader
          (serif chaud) + Manrope (body) + JetBrains Mono.
        </p>
      </header>

      <RuleDivider className="my-20" />

      {/* 01 — Palette */}
      <section aria-labelledby="sg-palette" className="space-y-10">
        <SectionHeading
          number="01"
          title="Palette"
          kicker="Cinq couleurs structurelles + quatre jewel-tones festives."
        />

        <div className="space-y-5">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cp-cobalt">
            structurelles — partout
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {PALETTE.map((c) => (
              <Swatch key={c.name} {...c} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cp-paprika">
            accents jewel-tone — les couleurs qui font la joie
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {ACCENTS.map((c) => (
              <Swatch key={c.name} {...c} />
            ))}
          </div>
        </div>

        <p className="max-w-2xl font-body text-base leading-relaxed text-cp-ink">
          <span className="font-mono font-bold uppercase tracking-[0.12em] text-cp-paprika">
            Paprika
          </span>{" "}
          fait l&apos;action festive (CTA, accents). <span className="font-mono font-bold uppercase tracking-[0.12em] text-cp-cobalt">cobalt</span>{" "}
          joue le rôle institutionnel (comptes, liens calmes).{" "}
          <span className="font-mono font-bold uppercase tracking-[0.12em] text-cp-canari bg-cp-ink px-1">canari</span>{" "}
          pour les highlights solaires.{" "}
          <span className="font-mono font-bold uppercase tracking-[0.12em] text-cp-feuille">feuille</span>{" "}
          pour les statuts positifs.
        </p>
      </section>

      <RuleDivider className="my-20" label="Typographies" tone="paprika" />

      {/* 02 — Typographies */}
      <section aria-labelledby="sg-typo" className="space-y-12">
        <SectionHeading
          number="02"
          title="Typographies"
          kicker="Une voix chaude pour les titres, une voix lisible pour le corps."
          tone="paprika"
        />

        <FontSample
          label="Display — Newsreader"
          variable="font-display"
          weight="variable + italique"
          usage="Hero, titres de section, noms de pensionnaires italiques."
          sample={
            <div className="space-y-6 text-cp-ink">
              <p className="font-display text-5xl font-medium leading-[1.02] sm:text-7xl">
                Maison de villégiature
              </p>
              <p className="font-display text-3xl italic leading-snug text-cp-ink-soft sm:text-4xl">
                Madame Cliquot · européenne · 6 ans
              </p>
            </div>
          }
        />

        <FontSample
          label="Body — Manrope"
          variable="font-body"
          weight="variable"
          usage="Corps de texte, navigation, formulaires, étiquettes."
          sample={
            <p className="max-w-2xl font-body text-base leading-relaxed text-cp-ink">
              Le corps de texte courant : lisible, géométrique-chaleureux,
              sans afféterie. Manrope est un grotesque humaniste qui se lit
              bien aux petits corps tout en gardant du caractère aux grands.
            </p>
          }
        />

        <FontSample
          label="Mono — JetBrains Mono"
          variable="font-mono"
          weight="400 / 700 + italique"
          usage="Mentions catalogue, numéros, métadonnées."
          sample={
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.16em] text-cp-cobalt">
              N° 047 — Rue de la Chartreuse — Bordeaux — Est. 2024
            </p>
          }
        />
      </section>

      <RuleDivider className="my-20" label="Boutons" tone="cobalt" />

      {/* 03 — Boutons */}
      <section aria-labelledby="sg-buttons" className="space-y-10">
        <SectionHeading
          number="03"
          title="Boutons"
          kicker="Paprika pour l'action, cobalt pour l'alternative, encre pour le danger."
          tone="paprika"
        />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Réserver un séjour</Button>
            <Button variant="secondary">Créer un compte</Button>
            <Button variant="outline">Voir les détails</Button>
            <Button variant="ghost">Annuler</Button>
            <Button variant="destructive">Supprimer la fiche</Button>
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

      <RuleDivider className="my-20" label="Illustrations" tone="canari" />

      {/* 04 — Illustrations chats */}
      <section aria-labelledby="sg-cats" className="space-y-10">
        <SectionHeading
          number="04"
          title="Chats géométriques"
          kicker="Quatre palettes × quatre poses, dérivées du nom du chat — chaque pensionnaire reçoit une combinaison stable."
          tone="canari"
        />

        <div className="space-y-6">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cp-paprika">
            quatre palettes — pose assise
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CAT_VARIANTS.map((v) => (
              <figure
                key={v}
                className="overflow-hidden rounded-md border border-cp-ink"
              >
                <CatIllustration
                  variant={v}
                  pose="sitting"
                  ariaLabel={`Chat en ${v}`}
                  className="aspect-square w-full"
                />
                <figcaption className="border-t border-cp-ink bg-cp-paper px-3 py-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cp-ink-soft">
                  {v}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <p className="font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cp-paprika">
            quatre poses — palette cobalt
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CAT_POSES.map((p) => (
              <figure
                key={p}
                className="overflow-hidden rounded-md border border-cp-ink"
              >
                <CatIllustration
                  variant="cobalt"
                  pose={p}
                  ariaLabel={`Chat en pose ${p}`}
                  className="aspect-square w-full"
                />
                <figcaption className="border-t border-cp-ink bg-cp-paper px-3 py-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cp-ink-soft">
                  {p}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <RuleDivider className="my-20" label="Statuts" tone="cobalt" />

      {/* 05 — Statuts */}
      <section aria-labelledby="sg-statuses" className="space-y-8">
        <SectionHeading
          number="05"
          title="Statuts de séjour"
          kicker="Les six états — chacun avec sa couleur signifiante."
          tone="cobalt"
        />
        <div className="flex flex-wrap items-center gap-3">
          {STATUSES.map((s) => (
            <BookingStatusBadge key={s} status={s} />
          ))}
        </div>
        <p className="max-w-2xl font-body text-base leading-relaxed text-cp-ink">
          Cobalt = attente sereine. Paprika = action requise du client.
          Feuille = confirmation joyeuse. Encre = refus net. Mute = annulé.
        </p>
      </section>

      <RuleDivider className="my-20" label="Formulaire" tone="paprika" />

      {/* 06 — Formulaire */}
      <section aria-labelledby="sg-form" className="space-y-10">
        <SectionHeading
          number="06"
          title="Champs de formulaire"
          kicker="Trait noir fin, focus paprika, indication italique."
          tone="paprika"
        />

        <div className="grid gap-8 sm:grid-cols-2">
          <Field
            label="Adresse email"
            htmlFor="sg-email"
            required
            hint="Renseignée sur votre fiche."
          >
            <Input
              id="sg-email"
              type="email"
              placeholder="adresse@maison.fr"
              defaultValue="henriette.berthier@chat-pitre.fr"
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

          <Field
            label="Note libre"
            htmlFor="sg-note"
            className="sm:col-span-2"
          >
            <Textarea
              id="sg-note"
              rows={4}
              placeholder="Maestro est un peu chasseur de mouches, à surveiller le matin."
            />
          </Field>
        </div>
      </section>

      <RuleDivider className="my-20" label="Cartouches" tone="feuille" />

      {/* 07 — Section + ruled box */}
      <section aria-labelledby="sg-section" className="space-y-12">
        <SectionHeading
          number="07"
          title="Encadrés colorés"
          kicker="Variantes regular / deep / cobalt / paprika / feuille / ink."
          tone="feuille"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <RuledBox variant="regular">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cp-paprika">
              regular — cadre encre sur paper
            </p>
            <p className="mt-3 font-display text-xl italic text-cp-ink">
              « Le ronron est la musique de fond de cette maison. »
            </p>
          </RuledBox>

          <RuledBox variant="cobalt">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cp-paper/80">
              cobalt — bloc institutionnel
            </p>
            <p className="mt-3 font-display text-xl italic text-cp-paper">
              Pour appeler à l&apos;ouverture d&apos;un compte ou à
              l&apos;accès à une fiche.
            </p>
          </RuledBox>

          <RuledBox variant="paprika">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cp-paper/80">
              paprika — moment fort
            </p>
            <p className="mt-3 font-display text-xl italic text-cp-paper">
              Pour les CTA principaux, les alertes, les moments où il faut
              que le regard se pose.
            </p>
          </RuledBox>

          <RuledBox variant="feuille">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-cp-paper/80">
              feuille — confirmation positive
            </p>
            <p className="mt-3 font-display text-xl italic text-cp-paper">
              Pour les acceptations, les validations, les « tout est bon ».
            </p>
          </RuledBox>
        </div>
      </section>

      <RuleDivider className="my-20" label="Fiches" tone="canari" />

      {/* 08 — Fiches pensionnaires */}
      <section aria-labelledby="sg-cat-cards" className="space-y-8">
        <SectionHeading
          number="08"
          title="Fiches de pensionnaires"
          kicker="Illustration dérivée du nom, critères d'admission en ✓/✕."
          tone="canari"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CatCard
            reference="003"
            name="Madame Cliquot"
            sex="FEMALE"
            breed="Européenne tricolore"
            ageLabel="6 ans"
            criteria={{ sterilized: true, identified: true, vaccines: true, sociable: true }}
          />
          <CatCard
            reference="012"
            name="Maestro"
            sex="MALE"
            breed="Chartreux"
            ageLabel="3 ans"
            criteria={{ sterilized: true, identified: true, vaccines: false, sociable: true }}
          />
          <CatCard
            reference="024"
            name="Salami"
            sex="MALE"
            breed="Roux des toits"
            ageLabel="1 an"
            criteria={{ sterilized: false, identified: false, vaccines: true, sociable: true }}
          />
        </div>
      </section>

      <RuleDivider className="mt-24 mb-12" />

      <footer className="flex flex-col gap-3 pb-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <LibraryStamp>Fin du document</LibraryStamp>
        <p className="font-display text-sm italic text-cp-ink-soft">
          Page de référence — supprimable une fois la DA validée.
        </p>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers internes                                                    */
/* ------------------------------------------------------------------ */

function Swatch({
  name,
  hex,
  usage,
}: {
  name: string;
  hex: string;
  usage: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-cp-ink bg-cp-paper">
      <div
        className="h-24 w-full border-b border-cp-ink"
        style={{ backgroundColor: hex }}
      />
      <div className="space-y-1 px-3 py-3">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-cp-ink">
          {name}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-cp-ink-soft">
          {hex}
        </p>
        <p className="font-body text-sm leading-snug text-cp-ink-soft">
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
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cp-paprika">
          {label}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-cp-ink-soft">
          .{variable} · {weight}
        </p>
      </div>
      <p className="font-display text-base italic text-cp-ink-soft">{usage}</p>
      <div className="pt-2">{sample}</div>
    </div>
  );
}
