"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Cat, ExtraUnit } from "@prisma/client";

import { CatIllustration, pickCatIllustration } from "@/components/cat-illustration";
import { DateRangePicker } from "@/components/date-range-picker";
import { Field } from "@/components/field";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EXTRA_UNIT_SHORT } from "@/lib/extras";
import { ageLabel, displayRef } from "@/lib/format";
import { cn } from "@/lib/utils";

/// Formulaire de demande de séjour câblé sur POST /api/bookings.
/// Sélection des dates via DateRangePicker (2 mois côte à côte, occupancy
/// affichée), sélection des chats parmi ceux du propriétaire, options
/// souhaitées (catalogue + demandes libres), notes libres. Redirige sur le
/// détail du séjour créé.

export type ExtraPresetOption = {
  id: string;
  label: string;
  unit: ExtraUnit;
  defaultAmount: number;
};

export function NewBookingForm({
  cats,
  presets,
}: {
  cats: Cat[];
  presets: ExtraPresetOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  // Demandes personnalisées (texte libre), gérées en état pour l'ajout /
  // suppression dynamique de lignes.
  const [customExtras, setCustomExtras] = useState<string[]>([]);
  // Entretien préalable souhaité (visio / tél) — voir étape « Note ».
  const [wantsInterview, setWantsInterview] = useState(false);
  const [interviewChannel, setInterviewChannel] = useState<"VIDEO" | "PHONE">(
    "VIDEO",
  );

  function addCustomExtra() {
    setCustomExtras((prev) => [...prev, ""]);
  }
  function changeCustomExtra(index: number, value: string) {
    setCustomExtras((prev) => prev.map((v, i) => (i === index ? value : v)));
  }
  function removeCustomExtra(index: number) {
    setCustomExtras((prev) => prev.filter((_, i) => i !== index));
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const fd = new FormData(e.currentTarget);
    const startDate = String(fd.get("startDate") ?? "").trim();
    const endDate = String(fd.get("endDate") ?? "").trim();
    const catIds = fd.getAll("catIds").map(String).filter(Boolean);
    const clientNotes = String(fd.get("notes") ?? "").trim();
    const extraPresetIds = fd.getAll("extraPresetIds").map(String).filter(Boolean);
    const cleanCustomExtras = customExtras
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    const interviewTopic = String(fd.get("interviewTopic") ?? "").trim();

    if (!startDate || !endDate) {
      setError("Sélectionnez une plage de dates dans le calendrier.");
      return;
    }
    if (catIds.length === 0) {
      setError("Sélectionnez au moins un pensionnaire.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          catIds,
          clientNotes: clientNotes || undefined,
          extraPresetIds: extraPresetIds.length ? extraPresetIds : undefined,
          customExtras: cleanCustomExtras.length ? cleanCustomExtras : undefined,
          interviewRequested: wantsInterview || undefined,
          interviewChannel: wantsInterview ? interviewChannel : undefined,
          interviewTopic:
            wantsInterview && interviewTopic ? interviewTopic : undefined,
        }),
      });
      if (!res.ok) {
        const data: { error?: string; fields?: Record<string, string> } =
          await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de la demande.");
        if (data.fields) setFieldErrors(data.fields);
        return;
      }
      const { booking } = (await res.json()) as { booking: { id: string } };
      router.push(`/dashboard/bookings/${booking.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-14" noValidate>
      {/* 01 — Dates */}
      <FormSection
        number="01"
        title="Dates du séjour"
        description="Arrivée entre 10h et 12h, départ avant 19h. Les jours grisés sont passés ou complets."
      >
        <DateRangePicker />
        {fieldErrors.endDate && (
          <p className="font-body text-xs text-cp-paprika">{fieldErrors.endDate}</p>
        )}
      </FormSection>

      <RuleDivider />

      {/* 02 — Pensionnaires */}
      <FormSection
        number="02"
        title="Pensionnaires concernés"
        description="Cochez les chats à confier sur ce séjour."
      >
        {cats.length === 0 ? (
          <div className="space-y-4 rounded-md border border-cp-ink/40 bg-cp-paper-deep/60 p-6">
            <p className="font-display text-xl italic text-cp-ink">
              Aucun pensionnaire enregistré.
            </p>
            <p className="font-body text-sm text-cp-ink-soft">
              Vous devez déclarer la fiche d&apos;au moins un chat avant de
              pouvoir réserver un séjour.
            </p>
            <Link
              href="/dashboard/cats/new"
              className={buttonVariants({ size: "sm" })}
            >
              Déclarer un pensionnaire →
            </Link>
          </div>
        ) : (
          <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink sm:grid-cols-2">
            {cats.map((cat) => (
              <CatPickRow
                key={cat.id}
                id={`cat-pick-${cat.id}`}
                catId={cat.id}
                name={cat.name}
                reference={displayRef(cat.id)}
                detail={`${cat.breed ?? "sans race"} · ${ageLabel(cat.birthDate)}`}
              />
            ))}
          </ul>
        )}
      </FormSection>

      <RuleDivider />

      {/* 03 — Suppléments souhaités */}
      <FormSection
        number="03"
        title="Suppléments souhaités"
        description="Options facultatives. Les tarifs sont indicatifs — la maison les confirme dans le devis."
      >
        <p className="rounded-md border border-cp-cobalt bg-cp-cobalt-light/60 px-4 py-3 font-body text-sm text-cp-ink">
          Pour tout supplément, précisez le détail (médicament et posologie,
          régime alimentaire, fréquence du brossage…) dans la{" "}
          <strong className="font-semibold">note pour la maison</strong> ci-dessous.
        </p>

        {presets.length > 0 && (
          <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink sm:grid-cols-2">
            {presets.map((preset) => (
              <ExtraPickRow
                key={preset.id}
                id={`extra-pick-${preset.id}`}
                presetId={preset.id}
                label={preset.label}
                unit={preset.unit}
                amount={preset.defaultAmount}
              />
            ))}
          </ul>
        )}

        <div className="space-y-3">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
            Autre demande
          </p>
          {customExtras.length > 0 && (
            <ul className="space-y-2">
              {customExtras.map((value, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => changeCustomExtra(index, e.target.value)}
                    placeholder="Ex. promenade en harnais, jeux interactifs…"
                    aria-label={`Demande personnalisée ${index + 1}`}
                    maxLength={120}
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomExtra(index)}
                    aria-label="Retirer cette demande"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-cp-ink bg-cp-paper text-cp-ink transition-colors hover:bg-cp-paprika hover:text-cp-paper"
                  >
                    <span aria-hidden className="text-lg leading-none">×</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {customExtras.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomExtra}
            >
              + Ajouter une demande
            </Button>
          )}
          <p className="font-body text-xs text-cp-ink-soft">
            Pour une demande sur mesure, décrivez-la dans la note ci-dessous —
            la maison vous proposera un tarif dans le devis.
          </p>
        </div>
      </FormSection>

      <RuleDivider />

      {/* 04 — Notes */}
      <FormSection
        number="04"
        title="Note pour la maison"
        description="Précisions sur les arrivées (transport, manies, allergies récentes…)."
      >
        <Field label="Note libre" htmlFor="booking-notes">
          <Textarea
            id="booking-notes"
            name="notes"
            rows={5}
            placeholder="Salami n'aime pas être déposé tôt le matin. Maestro vient d'avoir son rappel de typhus."
          />
        </Field>

        <div className="space-y-4 rounded-md border border-cp-ink/40 bg-cp-paper-deep/40 p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={wantsInterview}
              onChange={(e) => setWantsInterview(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="mt-0.5 grid size-5 shrink-0 place-items-center border border-cp-ink bg-cp-paper text-cp-paper transition-colors peer-checked:bg-cp-ink"
            >
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
            </span>
            <span className="flex flex-col gap-1">
              <span className="font-body text-base text-cp-ink">
                Je souhaite un entretien avant le séjour
              </span>
              <span className="font-body text-sm text-cp-ink-soft">
                Pour discuter d&apos;un point précis sur votre chat. Nous vous
                recontactons pour caler le créneau.
              </span>
            </span>
          </label>

          {wantsInterview && (
            <div className="space-y-4 border-t border-cp-ink/20 pt-4">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
                  Format
                </span>
                <div className="flex gap-2">
                  {([["VIDEO", "Visio"], ["PHONE", "Téléphone"]] as const).map(
                    ([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setInterviewChannel(value)}
                        aria-pressed={interviewChannel === value}
                        className={cn(
                          "rounded-md border px-4 py-2 font-body text-sm transition-colors",
                          interviewChannel === value
                            ? "border-cp-cobalt bg-cp-cobalt text-cp-paper"
                            : "border-cp-ink/40 bg-cp-paper text-cp-ink hover:bg-cp-paper-deep",
                        )}
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <Field
                label="Sujet à aborder (facultatif)"
                htmlFor="interview-topic"
              >
                <Textarea
                  id="interview-topic"
                  name="interviewTopic"
                  rows={2}
                  placeholder="Ex. gestion de son traitement, anxiété en transport…"
                />
              </Field>
            </div>
          )}
        </div>
      </FormSection>

      <RuleDivider />

      <footer className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-body text-sm text-cp-ink-soft">
          Nous confirmons l&apos;acceptation et l&apos;acompte par retour de
          fiche, sous 48h. Si votre séjour nécessite des modalités
          particulières, nous revenons vers vous pour les définir.
        </p>
        <div className="flex items-center gap-3">
          {error && (
            <p className="font-body text-sm text-cp-paprika">{error}</p>
          )}
          <Link
            href="/dashboard/bookings"
            className={buttonVariants({ variant: "ghost", size: "default" })}
          >
            Annuler
          </Link>
          <Button type="submit" size="lg" className="px-10" disabled={pending}>
            {pending ? "Envoi…" : "Envoyer la demande →"}
          </Button>
        </div>
      </footer>
    </form>
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

function CatPickRow({
  id,
  catId,
  name,
  reference,
  detail,
}: {
  id: string;
  catId: string;
  name: string;
  reference: string;
  detail: string;
}) {
  const picked = pickCatIllustration(name);
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
          name="catIds"
          value={catId}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="mt-1 grid size-5 shrink-0 place-items-center border border-cp-ink bg-cp-paper text-cp-paper transition-colors peer-checked:bg-cp-ink"
        >
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
        </span>

        <span
          aria-hidden
          className="hidden size-14 shrink-0 overflow-hidden rounded-sm border border-cp-ink/40 sm:block"
        >
          <CatIllustration
            variant={picked.variant}
            pose={picked.pose}
            className="size-full"
          />
        </span>

        <span className="flex flex-col gap-1">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-xl italic leading-tight text-cp-ink">
              {name}
            </span>
            <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
              N° {reference}
            </span>
          </span>
          <span className="font-body text-sm text-cp-ink-soft">{detail}</span>
        </span>
      </label>
    </li>
  );
}

function ExtraPickRow({
  id,
  presetId,
  label,
  unit,
  amount,
}: {
  id: string;
  presetId: string;
  label: string;
  unit: ExtraUnit;
  amount: number;
}) {
  // Affiche le prix avec son unité : « ~2€/jour », « 30€/visite », « 5€ forfait ».
  const priceLabel =
    amount <= 0
      ? "inclus"
      : unit === "FLAT"
        ? `${amount.toLocaleString("fr-FR")}€ forfait`
        : `~ ${amount.toLocaleString("fr-FR")}€${EXTRA_UNIT_SHORT[unit]}`;
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
          name="extraPresetIds"
          value={presetId}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="mt-1 grid size-5 shrink-0 place-items-center border border-cp-ink bg-cp-paper text-cp-paper transition-colors peer-checked:bg-cp-ink"
        >
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
        </span>

        <span className="flex flex-1 items-baseline justify-between gap-3">
          <span className="font-body text-base leading-snug text-cp-ink">
            {label}
          </span>
          <span className="font-mono text-sm font-bold whitespace-nowrap text-cp-paprika">
            {priceLabel}
          </span>
        </span>
      </label>
    </li>
  );
}
