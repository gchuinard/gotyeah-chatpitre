import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ActHeading } from "@/components/act-heading";
import {
  BookingStatusBadge,
  type BookingStatus,
} from "@/components/booking-status-badge";
import { CatCard } from "@/components/cat-card";
import { Field } from "@/components/field";
import { FiletFrame } from "@/components/filet-frame";
import { OrnamentDivider } from "@/components/ornament-divider";
import { TicketStamp } from "@/components/ticket-stamp";
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
  cssVar: string;
  hex: string;
  usage: string;
  isLight?: boolean;
}[] = [
  {
    name: "cp-cream",
    cssVar: "--color-cp-cream",
    hex: "#F4ECD8",
    usage: "Fond principal — ivoire vieilli",
    isLight: true,
  },
  {
    name: "cp-paper",
    cssVar: "--color-cp-paper",
    hex: "#EDE3CB",
    usage: "Fond alternatif des sections",
    isLight: true,
  },
  {
    name: "cp-crimson",
    cssVar: "--color-cp-crimson",
    hex: "#8B1A1A",
    usage: "Primaire — rouge cramoisi",
  },
  {
    name: "cp-crimson-dark",
    cssVar: "--color-cp-crimson-dark",
    hex: "#6B1414",
    usage: "Hover et états appuyés",
  },
  {
    name: "cp-midnight",
    cssVar: "--color-cp-midnight",
    hex: "#0F1B3D",
    usage: "Secondaire — bleu nuit profond",
  },
  {
    name: "cp-brass",
    cssVar: "--color-cp-brass",
    hex: "#B8893C",
    usage: "Accent — doré laiton (décoratif)",
  },
  {
    name: "cp-brass-light",
    cssVar: "--color-cp-brass-light",
    hex: "#D4AF6B",
    usage: "Doré clair, filets décoratifs",
    isLight: true,
  },
  {
    name: "cp-ink",
    cssVar: "--color-cp-ink",
    hex: "#1A1410",
    usage: "Noir d’encre pour le texte",
  },
  {
    name: "cp-ink-soft",
    cssVar: "--color-cp-ink-soft",
    hex: "#3D2F26",
    usage: "Texte secondaire, sépia foncé",
  },
  {
    name: "cp-amber",
    cssVar: "--color-cp-amber",
    hex: "#C45A1B",
    usage: "Orange brûlé — statut « question »",
  },
  {
    name: "cp-emerald",
    cssVar: "--color-cp-emerald",
    hex: "#1F4733",
    usage: "Vert théâtral — statut « acceptée »",
  },
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
    <main className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-10">
      {/* En-tête de la page */}
      <header className="space-y-6">
        <TicketStamp boxed>
          N° 001 — Design System — Représentation Permanente
        </TicketStamp>
        <Wordmark as="h1" className="text-5xl sm:text-7xl" />
        <p className="font-serif text-xl italic text-cp-ink-soft">
          Langage visuel — affiche de cabaret Belle Époque, modernisée pour le
          web.
        </p>
      </header>

      <OrnamentDivider className="my-14" />

      {/* ----- Palette ----- */}
      <section aria-labelledby="sg-palette" className="space-y-6">
        <ActHeading
          act="I"
          title="Palette"
          kicker="Onze couleurs, saturées, contrastées."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {PALETTE.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>
        <p className="font-body text-sm text-cp-ink-soft">
          <span className="font-semibold">Accessibilité :</span> le doré (
          <code className="font-mono">cp-brass</code>) ne sert qu’à la
          décoration (filets, ornements). Le texte courant utilise{" "}
          <code className="font-mono">cp-ink</code> ou{" "}
          <code className="font-mono">cp-ink-soft</code> sur fond crème.
        </p>
      </section>

      <OrnamentDivider className="my-14" label="Typographies" />

      {/* ----- Typographies ----- */}
      <section aria-labelledby="sg-typo" className="space-y-10">
        <ActHeading
          act="II"
          title="Typographies"
          kicker="Quatre voix pour quatre rôles."
        />

        <FontSample
          label="Display — Abril Fatface"
          variable="font-display"
          weight="400"
          usage="Hero, titres de section « Acte X »."
          sample={
            <p className="font-display text-5xl leading-[1.05] text-cp-ink sm:text-6xl">
              Mesdames, messieurs, et chats de qualité.
            </p>
          }
        />

        <FontSample
          label="Serif — Playfair Display"
          variable="font-serif"
          weight="400 / italique"
          usage="Sous-titres, citations, noms de pensionnaires."
          sample={
            <div className="space-y-2 text-cp-ink">
              <p className="font-serif text-3xl">
                Maison de villégiature pour félins de bonne compagnie.
              </p>
              <p className="font-serif text-2xl italic text-cp-ink-soft">
                Représentations permanentes, salle close à la nuit tombée.
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
            <p className="font-body text-base leading-relaxed text-cp-ink-soft">
              Le corps de texte courant : lisible, sobre, sans afféterie. Il
              porte les informations pratiques pendant que les grands titres
              font le spectacle. Sur fond crème, l’encre profonde garantit le
              contraste exigé par la maison.
            </p>
          }
        />

        <FontSample
          label="Mono — Special Elite"
          variable="font-mono"
          weight="400"
          usage="Mentions ticket, numéros, métadonnées."
          sample={
            <p className="font-mono text-base uppercase tracking-[0.18em] text-cp-ink-soft">
              N° 001 — Admission — Représentation Quotidienne — Salle Comble
            </p>
          }
        />
      </section>

      <OrnamentDivider className="my-14" label="Boutons" />

      {/* ----- Boutons ----- */}
      <section aria-labelledby="sg-buttons" className="space-y-8">
        <ActHeading
          act="III"
          title="Boutons"
          kicker="Trois voix, trois usages."
        />

        <div className="flex flex-wrap items-center gap-4">
          <Button>Réserver une loge</Button>
          <Button variant="secondary">Accéder à sa loge</Button>
          <Button variant="ticket">Entrer en scène</Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Petit</Button>
          <Button size="default">Standard</Button>
          <Button size="lg">Plus grand</Button>
          <Button disabled>Désactivé</Button>
        </div>

        <details className="border border-cp-brass/55 bg-cp-paper/40">
          <summary className="cursor-pointer list-none px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-cp-ink-soft marker:hidden">
            Autres variantes — disponibles mais d’usage utilitaire
          </summary>
          <div className="flex flex-wrap items-center gap-3 border-t border-cp-brass/40 p-4">
            <Button variant="midnight">Nuit profonde</Button>
            <Button variant="outline">Filet d’encre</Button>
            <Button variant="ghost">Fantôme</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Lien éditorial</Button>
          </div>
        </details>
      </section>

      <OrnamentDivider className="my-14" label="Section & filet doré" />

      {/* ----- Section démo (titre + corps + ornement + filet doré) ----- */}
      <section aria-labelledby="sg-section" className="space-y-10">
        <ActHeading
          act="IV"
          title="Section démonstrative"
          kicker="Hiérarchie complète d’une section type."
        />

        <article className="space-y-8">
          <ActHeading
            act="I"
            title="Démonstration"
            kicker="Une mise en scène simple — titre, corps, séparation, encadrement."
          />

          <p className="font-body text-base leading-relaxed text-cp-ink-soft">
            Voici comment se compose une section type sur ce site : un titre
            dramatique en Abril, une mention d’acte en mono cramoisi, un
            sous-titre italique en Playfair, puis un paragraphe de corps en
            Inter. Le tout posé sur le grain du papier, séparé par des
            ornements typographiques.
          </p>

          <OrnamentDivider />

          <FiletFrame>
            <p className="font-serif text-xl leading-snug text-cp-ink italic">
              « Pour être admis sur la scène de notre établissement, le félin
              se doit d’être stérilisé, identifié, vacciné, et sociable avec
              ses congénères. »
            </p>
            <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-cp-crimson">
              — Article II du règlement de la maison
            </p>
          </FiletFrame>
        </article>
      </section>

      <OrnamentDivider className="my-14" label="Formulaire" />

      {/* ----- Champ de formulaire ----- */}
      <section aria-labelledby="sg-form" className="space-y-8">
        <ActHeading
          act="V"
          title="Champs de formulaire"
          kicker="Sobriété au service de la clarté."
        />

        <div className="grid gap-6 sm:grid-cols-2">
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

      <OrnamentDivider className="my-14" label="Statuts" />

      {/* ----- Badges de statut ----- */}
      <section aria-labelledby="sg-statuses" className="space-y-6">
        <ActHeading
          act="VI"
          title="Statuts de réservation"
          kicker="Les six états d’une représentation."
        />
        <div className="flex flex-wrap items-center gap-3">
          {STATUSES.map((s) => (
            <BookingStatusBadge key={s} status={s} />
          ))}
        </div>
        <p className="font-body text-sm text-cp-ink-soft">
          Outline 2 px + tint léger + texte ink — la couleur du statut est
          portée par la bordure et le fond pour garantir un contraste AA, y
          compris sur le doré (qui ne peut pas être un texte sur cream).
        </p>
      </section>

      <OrnamentDivider className="my-14" label="Fiche pensionnaire" />

      {/* ----- CatCard ----- */}
      <section aria-labelledby="sg-cat" className="space-y-6">
        <ActHeading
          act="VII"
          title="Fiche de pensionnaire"
          kicker="Le placeholder en attendant les vraies photos."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CatCard
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

      <OrnamentDivider className="my-14" />

      <footer className="space-y-3 pb-10 text-center">
        <TicketStamp>Fin de la représentation — Rideau</TicketStamp>
        <p className="font-body text-xs text-cp-ink-soft">
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
  isLight,
}: {
  name: string;
  cssVar: string;
  hex: string;
  usage: string;
  isLight?: boolean;
}) {
  return (
    <div className="border-2 border-cp-ink/15 bg-cp-cream">
      <div
        className={
          "h-20 w-full " +
          (isLight
            ? "border-b border-cp-ink/10"
            : "border-b border-transparent")
        }
        style={{ backgroundColor: hex }}
      />
      <div className="space-y-1 px-3 py-2.5">
        <p className="font-serif text-base leading-tight text-cp-ink">{name}</p>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-cp-ink-soft">
          {hex}
        </p>
        <p className="font-body text-xs text-cp-ink-soft/85">{usage}</p>
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
    <div className="space-y-3 border-t border-cp-brass/40 pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-cp-crimson">
          {label}
        </p>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-cp-ink-soft">
          .{variable} · {weight}
        </p>
      </div>
      <p className="font-body text-sm italic text-cp-ink-soft">{usage}</p>
      <div className="pt-1">{sample}</div>
    </div>
  );
}
