import Link from "next/link";

import { Field } from "@/components/field";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/// Formulaire de déclaration / édition de pensionnaire. Maquette statique
/// — pas de câblage Prisma : le bouton « Enregistrer » renvoie à la liste
/// via un Link. Les champs sont fonctionnels (typing OK, focus OK) mais
/// non persistés.

export type CatFormValues = {
  name?: string;
  sex?: "MALE" | "FEMALE";
  breed?: string;
  birthYear?: string;
  notes?: string;
  criteria?: {
    sterilized?: boolean;
    identified?: boolean;
    vaccines?: boolean;
    sociable?: boolean;
  };
};

export function CatForm({
  mode,
  defaultValues,
  reference,
}: {
  mode: "create" | "edit";
  defaultValues?: CatFormValues;
  reference?: string;
}) {
  const v = defaultValues ?? {};
  const c = v.criteria ?? {};
  const isEdit = mode === "edit";

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-20">
      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/dashboard" className="hover:text-cp-sanguine">
          Mon espace
        </Link>
        <span aria-hidden>/</span>
        <Link href="/dashboard/cats" className="hover:text-cp-sanguine">
          Pensionnaires
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">
          {isEdit ? `N° ${reference} — édition` : "Nouvelle fiche"}
        </span>
      </nav>

      <header className="space-y-5">
        <LibraryStamp boxed>
          {isEdit
            ? `§ Fiche existante — N° ${reference}`
            : "§ Nouvelle fiche de pensionnaire"}
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          {isEdit ? `Éditer ${v.name ?? "la fiche"}` : "Déclarer un pensionnaire"}
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          {isEdit
            ? "Mettez à jour ce qui a changé. Les critères d'admission impactent l'acceptation des prochains séjours."
            : "Renseignez la fiche complète avant de demander un premier séjour. Tout sera vérifié à l'arrivée."}
        </p>
      </header>

      <RuleDivider weight="heavy" className="my-12" />

      <form action="/dashboard/cats" method="get" className="space-y-14">
        {/* Section 01 — Identité */}
        <FormSection
          number="01"
          title="Identité"
          description="Le nom et le sexe sont les seules informations indispensables."
        >
          <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
            <Field label="Nom de scène" htmlFor="cat-name" required>
              <Input
                id="cat-name"
                name="name"
                defaultValue={v.name}
                placeholder="Salami, Madame Cliquot, Maestro…"
                required
              />
            </Field>
            <Field label="Sexe" htmlFor="cat-sex-male" required>
              <div className="grid grid-cols-2 gap-px overflow-hidden border border-cp-ink bg-cp-ink">
                <RadioPill
                  id="cat-sex-male"
                  name="sex"
                  value="MALE"
                  label="Mâle"
                  defaultChecked={v.sex === "MALE"}
                />
                <RadioPill
                  id="cat-sex-female"
                  name="sex"
                  value="FEMALE"
                  label="Femelle"
                  defaultChecked={v.sex === "FEMALE"}
                />
              </div>
            </Field>
          </div>
        </FormSection>

        <RuleDivider />

        {/* Section 02 — Détails */}
        <FormSection
          number="02"
          title="Détails"
          description="Race et année de naissance — utiles à la maison pour la chambre attribuée."
        >
          <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
            <Field label="Race ou type" htmlFor="cat-breed">
              <Input
                id="cat-breed"
                name="breed"
                defaultValue={v.breed}
                placeholder="Européenne tricolore, Chartreux, sans race…"
              />
            </Field>
            <Field
              label="Année de naissance"
              htmlFor="cat-birthyear"
              hint="Approximative pour les chats trouvés."
            >
              <Input
                id="cat-birthyear"
                name="birthYear"
                inputMode="numeric"
                pattern="[0-9]{4}"
                placeholder="2021"
                defaultValue={v.birthYear}
              />
            </Field>
          </div>
        </FormSection>

        <RuleDivider />

        {/* Section 03 — Admission */}
        <FormSection
          number="03"
          title="Conditions d'admission"
          description="Cochez ce qui est à jour. Une lacune n'est pas un refus automatique — c'est un sujet de conversation."
        >
          <ul className="grid gap-px overflow-hidden border border-cp-ink bg-cp-ink sm:grid-cols-2">
            <CriterionCheckbox
              id="crit-sterilized"
              name="sterilized"
              label="Stérilisé"
              gloss="Pour la quiétude des autres pensionnaires."
              defaultChecked={c.sterilized}
            />
            <CriterionCheckbox
              id="crit-identified"
              name="identified"
              label="Identifié"
              gloss="Puce ou tatouage à jour."
              defaultChecked={c.identified}
            />
            <CriterionCheckbox
              id="crit-vaccines"
              name="vaccines"
              label="Vaccins à jour"
              gloss="Typhus et coryza requis ; leucose recommandée."
              defaultChecked={c.vaccines}
            />
            <CriterionCheckbox
              id="crit-sociable"
              name="sociable"
              label="Sociable"
              gloss="Avec ses congénères et les humains de la maison."
              defaultChecked={c.sociable}
            />
          </ul>
        </FormSection>

        <RuleDivider />

        {/* Section 04 — Notes */}
        <FormSection
          number="04"
          title="Notes pour la maison"
          description="Manies, traitements, alimentation particulière — tout ce que la maison gagne à savoir."
        >
          <Field label="Note libre" htmlFor="cat-notes">
            <Textarea
              id="cat-notes"
              name="notes"
              defaultValue={v.notes}
              rows={6}
              placeholder="Salami dort sur le frigo. Ne supporte pas la litière agglomérante. Pâtée matin et soir uniquement."
            />
          </Field>
        </FormSection>

        <RuleDivider weight="heavy" />

        {/* Actions */}
        <footer className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/dashboard/cats"
            className={buttonVariants({ variant: "ghost", size: "default" })}
          >
            Annuler
          </Link>
          <Button type="submit" size="lg" className="px-10">
            {isEdit ? "Mettre à jour la fiche →" : "Enregistrer la fiche →"}
          </Button>
        </footer>
      </form>
    </div>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
      <SectionHeading number={number} title={title} kicker={description} as="h2" />
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function RadioPill({
  id,
  name,
  value,
  label,
  defaultChecked,
}: {
  id: string;
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "relative grid cursor-pointer place-items-center bg-cp-paper px-4 py-3 text-center font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft transition-colors hover:bg-cp-paper-deep",
        "has-[input:checked]:bg-cp-ink has-[input:checked]:text-cp-paper",
        "has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-cp-sanguine",
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="sr-only"
      />
      {label}
    </label>
  );
}

function CriterionCheckbox({
  id,
  name,
  label,
  gloss,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  gloss: string;
  defaultChecked?: boolean;
}) {
  // Astuce d'affichage de la coche : l'indicateur démarre `bg-cp-paper text-cp-paper`
  // (SVG paper sur fond paper = invisible). À l'état coché (peer-checked sur le
  // <input> frère), il bascule en `bg-cp-ink` : le SVG paper devient visible
  // sur l'encre.
  return (
    <li>
      <label
        htmlFor={id}
        className={cn(
          "relative flex cursor-pointer items-start gap-4 bg-cp-paper p-5 transition-colors hover:bg-cp-paper-deep",
          "has-[input:checked]:bg-cp-paper-deep",
          "has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-cp-sanguine",
        )}
      >
        <input
          id={id}
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="mt-0.5 grid size-5 shrink-0 place-items-center border border-cp-ink bg-cp-paper text-cp-paper transition-colors peer-checked:bg-cp-ink"
        >
          <CheckMark />
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-cp-ink">
            {label}
          </span>
          <span className="font-body text-sm leading-snug text-cp-ink-soft">
            {gloss}
          </span>
        </span>
      </label>
    </li>
  );
}

function CheckMark() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className="size-3.5"
      aria-hidden
    >
      <path d="M3 8 L7 12 L13 4" />
    </svg>
  );
}
