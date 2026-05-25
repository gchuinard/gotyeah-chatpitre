"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Field } from "@/components/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/// Formulaire de devis admin. L'admin saisit les tarifs unitaires,
/// l'éventuel supplément (libellé + montant) et le pourcentage d'acompte ;
/// le total et l'acompte sont calculés en live. Deux actions :
/// — « Enregistrer le brouillon » : PATCH les tarifs sans changer le statut
///   (utile pour préparer le devis avant d'accepter).
/// — « Envoyer et accepter » : PATCH les tarifs + status=ACCEPTED, ce qui
///   notifie le client et rend visible le devis + la facture côté client.

type QuoteFormProps = {
  bookingId: string;
  nights: number;
  catsCount: number;
  /** Valeurs courantes (peuvent être null si pas encore tarifé). */
  current: {
    pricePerFirstCat: number | null;
    pricePerExtraCat: number | null;
    depositPercentage: number;
    extraNotes: string | null;
    extraAmount: number | null;
  };
  /** Valeurs suggérées (depuis lib/pricing, à la création du formulaire). */
  suggested: {
    pricePerFirstCat: number;
    pricePerExtraCat: number;
    depositPercentage: number;
  };
};

export function QuoteForm({
  bookingId,
  nights,
  catsCount,
  current,
  suggested,
}: QuoteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [pricePerFirstCat, setPricePerFirstCat] = useState<string>(
    String(current.pricePerFirstCat ?? suggested.pricePerFirstCat),
  );
  const [pricePerExtraCat, setPricePerExtraCat] = useState<string>(
    String(current.pricePerExtraCat ?? suggested.pricePerExtraCat),
  );
  const [depositPercentage, setDepositPercentage] = useState<string>(
    String(current.depositPercentage || suggested.depositPercentage),
  );
  const [extraNotes, setExtraNotes] = useState<string>(current.extraNotes ?? "");
  const [extraAmount, setExtraAmount] = useState<string>(
    current.extraAmount === null ? "0" : String(current.extraAmount),
  );

  const { total, deposit, perNight, extras } = useMemo(() => {
    const first = Number(pricePerFirstCat) || 0;
    const extra = Number(pricePerExtraCat) || 0;
    const extrasCount = Math.max(0, catsCount - 1);
    const extrasAmount = Number(extraAmount) || 0;
    const perNightCalc = first + extrasCount * extra;
    const totalCalc = perNightCalc * nights + extrasAmount;
    const depositPct = Number(depositPercentage) || 0;
    const depositCalc = Math.round(totalCalc * depositPct) / 100;
    return {
      perNight: perNightCalc,
      extras: extrasCount,
      total: totalCalc,
      deposit: depositCalc,
    };
  }, [
    pricePerFirstCat,
    pricePerExtraCat,
    extraAmount,
    depositPercentage,
    catsCount,
    nights,
  ]);

  function submit(opts: { withAccept: boolean }) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricePerFirstCat: Number(pricePerFirstCat),
          pricePerExtraCat: Number(pricePerExtraCat),
          depositPercentage: Number(depositPercentage),
          extraNotes: extraNotes.trim() || undefined,
          extraAmount: Number(extraAmount) || 0,
          ...(opts.withAccept ? { status: "ACCEPTED" } : {}),
        }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'enregistrement du devis.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="mt-14 rounded-md border border-cp-ink bg-cp-paper p-6 sm:p-8">
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
        Devis à établir
      </p>
      <p className="mt-3 font-display text-2xl italic leading-snug text-cp-ink sm:text-3xl">
        Posez le tarif personnalisé pour ce séjour.
      </p>
      <p className="mt-2 font-body text-sm text-cp-ink-soft">
        Les valeurs suggérées viennent de la grille tarifaire publique
        ({suggested.pricePerFirstCat}€ + {suggested.pricePerExtraCat}€ par
        chat supplémentaire). Ajustez selon les conditions particulières.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Tarif du 1er chat (€/nuit)" htmlFor="quote-first">
          <Input
            id="quote-first"
            name="pricePerFirstCat"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={pricePerFirstCat}
            onChange={(e) => setPricePerFirstCat(e.target.value)}
          />
        </Field>
        <Field
          label={`Tarif par chat supp. (×${extras})`}
          htmlFor="quote-extra"
        >
          <Input
            id="quote-extra"
            name="pricePerExtraCat"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={pricePerExtraCat}
            onChange={(e) => setPricePerExtraCat(e.target.value)}
          />
        </Field>

        <Field label="Acompte (%)" htmlFor="quote-deposit">
          <Input
            id="quote-deposit"
            name="depositPercentage"
            type="number"
            min={0}
            max={100}
            step={1}
            value={depositPercentage}
            onChange={(e) => setDepositPercentage(e.target.value)}
          />
        </Field>
        <Field label="Suppléments (€)" htmlFor="quote-extras-amount">
          <Input
            id="quote-extras-amount"
            name="extraAmount"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={extraAmount}
            onChange={(e) => setExtraAmount(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field
          label="Libellé des suppléments"
          htmlFor="quote-extras-notes"
          hint="Décrit ce que comprend le montant ci-dessus (nourriture spéciale, visite véto, soins…)."
        >
          <Textarea
            id="quote-extras-notes"
            name="extraNotes"
            rows={3}
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            placeholder="Ex. : régime hypoallergénique fourni + brossage quotidien long poil."
          />
        </Field>
      </div>

      {/* Récap calculé */}
      <div className="mt-6 grid gap-3 rounded-md border border-cp-cobalt bg-cp-paper-deep p-5 sm:grid-cols-3">
        <Summary
          label={`${nights} nuit${nights > 1 ? "s" : ""}`}
          value={`${perNight.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€/nuit`}
        />
        <Summary
          label="Total"
          value={`${total.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`}
          strong
        />
        <Summary
          label={`Acompte ${depositPercentage}%`}
          value={`${deposit.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 border border-cp-paprika bg-cp-paprika/8 px-4 py-3 font-body text-sm text-cp-paprika"
        >
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="default"
          onClick={() => submit({ withAccept: true })}
          disabled={pending}
        >
          {pending ? "Envoi…" : "Envoyer le devis et accepter →"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => submit({ withAccept: false })}
          disabled={pending}
        >
          Enregistrer le brouillon
        </Button>
      </div>
    </section>
  );
}

function Summary({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-cobalt">
        {label}
      </span>
      <span
        className={
          strong
            ? "font-display text-3xl font-bold leading-none text-cp-ink"
            : "font-display text-2xl font-semibold leading-tight text-cp-ink"
        }
      >
        {value}
      </span>
    </div>
  );
}
