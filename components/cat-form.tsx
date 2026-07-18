"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Field } from "@/components/field";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/// Formulaire de déclaration / édition de pensionnaire — câblé sur l'API
/// `/api/cats` (POST en création) et `/api/cats/[id]` (PATCH en édition).
/// Au succès, redirige vers la liste avec un refresh.

export type CatFormValues = {
  id?: string;
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
  reviewSlot,
}: {
  mode: "create" | "edit";
  defaultValues?: CatFormValues;
  reference?: string;
  /** Bloc « avis de la maison » (séjours + statut + note), rendu sous
   *  l'en-tête en mode édition. Construit côté serveur par la page. */
  reviewSlot?: React.ReactNode;
}) {
  const router = useRouter();
  const v = defaultValues ?? {};
  const c = v.criteria ?? {};
  const isEdit = mode === "edit";

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const sex = String(fd.get("sex") ?? "").trim();
    const breed = String(fd.get("breed") ?? "").trim();
    const birthYearStr = String(fd.get("birthYear") ?? "").trim();
    const notes = String(fd.get("notes") ?? "").trim();

    if (!name) {
      setFieldErrors({ name: "Le nom du chat est requis." });
      return;
    }
    if (sex !== "MALE" && sex !== "FEMALE") {
      setFieldErrors({ sex: "Sélectionnez un sexe." });
      return;
    }

    let birthDate: string | undefined;
    if (birthYearStr) {
      const year = Number(birthYearStr);
      if (!Number.isInteger(year) || year < 1990 || year > 2100) {
        setFieldErrors({ birthYear: "Année invalide." });
        return;
      }
      birthDate = `${year}-01-01`;
    }

    const payload = {
      name,
      sex,
      breed: breed || undefined,
      birthDate,
      personality: notes || undefined,
      isSterilized: fd.get("sterilized") === "on",
      isIdentified: fd.get("identified") === "on",
      vaccinesUpToDate: fd.get("vaccines") === "on",
      isSociable: fd.get("sociable") === "on",
    };

    startTransition(async () => {
      const url = isEdit && v.id ? `/api/cats/${v.id}` : "/api/cats";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data: { error?: string; fields?: Record<string, string> } =
          await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'enregistrement.");
        if (data.fields) setFieldErrors(data.fields);
        return;
      }
      router.push("/dashboard/cats");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-20">
      {/* Fil d'Ariane */}
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/dashboard" className="hover:text-cp-paprika">
          Mon espace
        </Link>
        <span aria-hidden>/</span>
        <Link href="/dashboard/cats" className="hover:text-cp-paprika">
          Pensionnaires
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">
          {isEdit ? `N°${reference}, édition` : "Nouvelle fiche"}
        </span>
      </nav>

      <header className="space-y-5">
        <LibraryStamp boxed>
          {isEdit
            ? `Fiche existante, N°${reference}`
            : "Nouvelle fiche de pensionnaire"}
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

      {reviewSlot}

      <RuleDivider className="my-12" />

      <form className="space-y-14" noValidate onSubmit={onSubmit}>
        {/* Section 01 — Identité */}
        <FormSection
          number="01"
          title="Identité"
          description="Le nom et le sexe sont les seules informations indispensables."
        >
          <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
            <Field
              label="Nom de scène"
              htmlFor="cat-name"
              required
              error={fieldErrors.name}
            >
              <Input
                id="cat-name"
                name="name"
                defaultValue={v.name}
                placeholder="Salami, Madame Cliquot, Maestro…"
                required
              />
            </Field>
            <Field
              label="Sexe"
              htmlFor="cat-sex-male"
              required
              error={fieldErrors.sex}
            >
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink">
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
          description="Race et année de naissance, utiles pour la chambre que nous attribuons."
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
              error={fieldErrors.birthYear}
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
          description="Cochez ce qui est à jour. Une lacune n'est pas un refus automatique, c'est un sujet de conversation."
        >
          <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink sm:grid-cols-2">
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
              gloss="Avec ses congénères et nous."
              defaultChecked={c.sociable}
            />
          </ul>
        </FormSection>

        <RuleDivider />

        {/* Section 04 — Notes */}
        <FormSection
          number="04"
          title="Notes à notre intention"
          description="Manies, traitements, alimentation particulière, tout ce que nous gagnons à savoir."
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

        <RuleDivider />

        {/* Actions */}
        <footer className="flex flex-wrap items-center justify-end gap-3">
          {error && (
            <p className="font-body text-sm text-cp-paprika">{error}</p>
          )}
          <Link
            href="/dashboard/cats"
            className={buttonVariants({ variant: "ghost", size: "default" })}
          >
            Annuler
          </Link>
          <Button type="submit" size="lg" className="px-10" disabled={pending}>
            {pending
              ? "Enregistrement…"
              : isEdit
                ? "Mettre à jour la fiche →"
                : "Enregistrer la fiche →"}
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
        "has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-cp-paprika",
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
  return (
    <li>
      <label
        htmlFor={id}
        className={cn(
          "relative flex cursor-pointer items-start gap-4 bg-cp-paper p-5 transition-colors hover:bg-cp-paper-deep",
          "has-[input:checked]:bg-cp-paper-deep",
          "has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-cp-paprika",
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
