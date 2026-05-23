import Link from "next/link";

import { Field } from "@/components/field";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CURRENT_OWNER_ID, getCatsByOwner } from "@/lib/fixtures";

/// Demande de nouveau séjour : dates d'arrivée/départ, pensionnaires
/// concernés (cases cochables visuelles), notes libres. Soumission no-op
/// (renvoie à la liste).

export default function NewBookingPage() {
  const cats = getCatsByOwner(CURRENT_OWNER_ID);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 sm:py-20">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/dashboard" className="hover:text-cp-paprika">
          Mon espace
        </Link>
        <span aria-hidden>/</span>
        <Link href="/dashboard/bookings" className="hover:text-cp-paprika">
          Séjours
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Nouvelle demande</span>
      </nav>

      <header className="space-y-5">
        <LibraryStamp boxed>Nouvelle demande de séjour</LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Réserver un séjour
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          Indiquez vos dates, choisissez les pensionnaires concernés, ajoutez
          un mot si nécessaire. La maison répondra sous 48h.
        </p>
      </header>

      <RuleDivider className="my-12" />

      <form action="/dashboard/bookings" method="get" className="space-y-14">
        {/* 01 — Dates */}
        <FormSection
          number="01"
          title="Dates du séjour"
          description="Arrivée entre 10h et 12h, départ avant 19h."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Arrivée" htmlFor="booking-start" required>
              <Input id="booking-start" name="startDate" type="date" required />
            </Field>
            <Field label="Départ" htmlFor="booking-end" required>
              <Input id="booking-end" name="endDate" type="date" required />
            </Field>
          </div>
        </FormSection>

        <RuleDivider />

        {/* 02 — Pensionnaires */}
        <FormSection
          number="02"
          title="Pensionnaires concernés"
          description="Cochez les chats à confier sur ce séjour."
        >
          {cats.length === 0 ? (
            <div className="space-y-4 border border-cp-ink/40 bg-cp-paper-deep/60 p-6">
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
            <ul className="grid gap-px overflow-hidden border border-cp-ink bg-cp-ink sm:grid-cols-2">
              {cats.map((cat) => (
                <CatPickRow
                  key={cat.id}
                  id={`cat-pick-${cat.id}`}
                  catId={cat.id}
                  name={cat.name}
                  reference={cat.reference}
                  detail={`${cat.breed} · ${cat.ageLabel}`}
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
            <Link
              href="/dashboard/bookings"
              className={buttonVariants({ variant: "ghost", size: "default" })}
            >
              Annuler
            </Link>
            <Button type="submit" size="lg" className="px-10">
              Envoyer la demande →
            </Button>
          </div>
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
      <SectionHeading
        number={number}
        title={title}
        kicker={description}
        as="h2"
      />
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
