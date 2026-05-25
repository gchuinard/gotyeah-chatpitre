"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Cat } from "@prisma/client";

import { DateRangePicker } from "@/components/date-range-picker";
import { Field } from "@/components/field";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ageLabel, displayRef } from "@/lib/format";
import { cn } from "@/lib/utils";

/// Formulaire de demande de séjour câblé sur POST /api/bookings.
/// Sélection des dates via DateRangePicker (2 mois côte à côte, occupancy
/// affichée), sélection des chats parmi ceux du propriétaire, notes
/// libres. Redirige sur le détail du séjour créé.

export function NewBookingForm({ cats }: { cats: Cat[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const fd = new FormData(e.currentTarget);
    const startDate = String(fd.get("startDate") ?? "").trim();
    const endDate = String(fd.get("endDate") ?? "").trim();
    const catIds = fd.getAll("catIds").map(String).filter(Boolean);
    const clientNotes = String(fd.get("notes") ?? "").trim();

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

      {/* 03 — Notes */}
      <FormSection
        number="03"
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
      </FormSection>

      <RuleDivider />

      <footer className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-body text-sm text-cp-ink-soft">
          La maison confirme l&apos;acceptation et l&apos;acompte par retour
          de fiche, sous 48h.
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
