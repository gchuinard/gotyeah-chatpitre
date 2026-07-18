"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Cat } from "@prisma/client";

import {
  CatIllustration,
  pickCatIllustration,
} from "@/components/cat-illustration";
import { DateRangePicker } from "@/components/date-range-picker";
import { Field } from "@/components/field";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ageLabel, displayRef } from "@/lib/format";
import { cn } from "@/lib/utils";

/// Édition d'une demande de séjour en attente : dates, pensionnaires, note et
/// entretien pré-remplis, puis PUT /api/bookings/[id]. À l'ouverture, signale
/// « modification en cours » à l'admin (beginEdit) ; à l'enregistrement ou à
/// l'abandon explicite, on le retire. Les suppléments ne sont pas éditables ici
/// (ils sont conservés côté serveur).

export type EditInterview = {
  requested: boolean;
  channel: "VIDEO" | "PHONE" | null;
  topic: string | null;
};

/// Parse une date ISO « yyyy-mm-dd » en Date locale (minuit local), pour rester
/// aligné avec la logique de jour du calendrier.
function parseIsoLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function EditBookingForm({
  bookingId,
  cats,
  initialCatIds,
  initialStart,
  initialEnd,
  initialNotes,
  initialInterview,
}: {
  bookingId: string;
  cats: Cat[];
  initialCatIds: string[];
  initialStart: string; // "yyyy-mm-dd"
  initialEnd: string; // "yyyy-mm-dd"
  initialNotes: string | null;
  initialInterview: EditInterview;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [wantsInterview, setWantsInterview] = useState(
    initialInterview.requested,
  );
  const [interviewChannel, setInterviewChannel] = useState<"VIDEO" | "PHONE">(
    initialInterview.channel ?? "VIDEO",
  );

  const initialCatSet = new Set(initialCatIds);

  // Prévient l'admin que la demande est en cours de modification. Au démontage
  // (retour navigateur, fil d'Ariane, fermeture d'onglet), on retire le signal
  // si l'édition n'a été ni enregistrée ni annulée explicitement. keepalive
  // pour que la requête survive à une navigation dure.
  useEffect(() => {
    void fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "beginEdit" }),
    }).catch(() => {});
    return () => {
      void fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "endEdit" }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [bookingId]);

  function onCancel() {
    void fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "endEdit" }),
    }).catch(() => {});
    router.push(`/dashboard/bookings/${bookingId}`);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const startDate = String(fd.get("startDate") ?? "").trim();
    const endDate = String(fd.get("endDate") ?? "").trim();
    const catIds = fd.getAll("catIds").map(String).filter(Boolean);
    const clientNotes = String(fd.get("notes") ?? "").trim();
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
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          catIds,
          clientNotes: clientNotes || undefined,
          interviewRequested: wantsInterview || undefined,
          interviewChannel: wantsInterview ? interviewChannel : undefined,
          interviewTopic:
            wantsInterview && interviewTopic ? interviewTopic : undefined,
        }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de la modification.");
        return;
      }
      router.push(`/dashboard/bookings/${bookingId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-14" noValidate>
      {/* 01 — Dates */}
      <section className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
        <SectionHeading
          number="01"
          title="Dates du séjour"
          kicker="Ajustez la plage si nécessaire. Arrivée entre 10h et 12h, départ avant 19h."
          as="h2"
        />
        <div className="space-y-6">
          <DateRangePicker
            initialStart={parseIsoLocal(initialStart)}
            initialEnd={parseIsoLocal(initialEnd)}
          />
        </div>
      </section>

      <RuleDivider />

      {/* 02 — Pensionnaires */}
      <section className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
        <SectionHeading
          number="02"
          title="Pensionnaires concernés"
          kicker="Cochez les chats à confier sur ce séjour."
          as="h2"
        />
        <ul className="flex flex-wrap gap-px self-start overflow-hidden rounded-md border border-cp-ink bg-cp-ink [&>li]:grow [&>li]:basis-full [&>li]:bg-cp-paper sm:[&>li]:basis-[calc(50%-1px)]">
          {cats.map((cat) => {
            const picked = pickCatIllustration(cat.name);
            const id = `edit-cat-${cat.id}`;
            return (
              <li key={cat.id}>
                <label
                  htmlFor={id}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-4 bg-cp-paper p-5 transition-colors hover:bg-cp-paper-deep",
                    "has-[input:checked]:bg-cp-paper-deep",
                  )}
                >
                  <input
                    id={id}
                    type="checkbox"
                    name="catIds"
                    value={cat.id}
                    defaultChecked={initialCatSet.has(cat.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="grid size-5 shrink-0 place-items-center border border-cp-ink bg-cp-paper text-cp-paper transition-colors peer-checked:bg-cp-ink"
                  >
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="square"
                      className="size-3.5"
                      aria-hidden
                    >
                      <path d="M3 8 L7 12 L13 4" />
                    </svg>
                  </span>
                  <span
                    aria-hidden
                    className="hidden size-12 shrink-0 overflow-hidden rounded-sm border border-cp-ink/40 sm:block"
                  >
                    <CatIllustration
                      variant={picked.variant}
                      pose={picked.pose}
                      className="size-full"
                    />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="flex items-baseline gap-2">
                      <span className="font-display text-xl italic leading-tight text-cp-ink">
                        {cat.name}
                      </span>
                      <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
                        N°{displayRef(cat.id)}
                      </span>
                    </span>
                    <span className="font-body text-sm text-cp-ink-soft">
                      {(cat.breed ?? "sans race") + " · " + ageLabel(cat.birthDate)}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <RuleDivider />

      {/* 03 — Note + entretien */}
      <section className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
        <SectionHeading
          number="03"
          title="Votre mot pour nous"
          kicker="Précisions sur les arrivées (transport, manies, allergies récentes…)."
          as="h2"
        />
        <div className="space-y-6">
          <Field label="Note libre" htmlFor="edit-notes">
            <Textarea
              id="edit-notes"
              name="notes"
              rows={5}
              defaultValue={initialNotes ?? ""}
              placeholder="Salami n'aime pas être déposé tôt le matin."
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
                  htmlFor="edit-interview-topic"
                >
                  <Textarea
                    id="edit-interview-topic"
                    name="interviewTopic"
                    rows={2}
                    defaultValue={initialInterview.topic ?? ""}
                    placeholder="Ex. gestion de son traitement, anxiété en transport…"
                  />
                </Field>
              </div>
            )}
          </div>
        </div>
      </section>

      <RuleDivider />

      <footer className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-body text-sm text-cp-ink-soft">
          Vos modifications repartent en revue chez nous.
        </p>
        <div className="flex items-center gap-3">
          {error && <p className="font-body text-sm text-cp-paprika">{error}</p>}
          <button
            type="button"
            onClick={onCancel}
            className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft hover:text-cp-paprika"
          >
            Annuler
          </button>
          <Button type="submit" size="lg" className="px-10" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer les modifications →"}
          </Button>
        </div>
      </footer>
    </form>
  );
}
