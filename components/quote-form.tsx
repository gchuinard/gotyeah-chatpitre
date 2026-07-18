"use client";

import { useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExtraUnit } from "@prisma/client";

import { Field } from "@/components/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EXTRA_UNIT_OPTIONS, extraLineTotalNumber } from "@/lib/extras";

/// Formulaire de devis admin. L'admin saisit les tarifs unitaires, le
/// pourcentage d'acompte et les éventuelles lignes de suppléments — chaque
/// ligne est soit un préset du catalogue (label + prix par défaut pré-
/// remplis), soit « Autre » (libellé libre). Le total et l'acompte sont
/// calculés en live.
/// Deux actions :
/// — « Enregistrer le brouillon » : PATCH sans changer le statut.
/// — « Envoyer le devis et accepter » : PATCH + status=ACCEPTED.

export type QuoteFormPreset = {
  id: string;
  label: string;
  unit: ExtraUnit;
  defaultAmount: number;
};

export type QuoteFormExtra = {
  label: string;
  unit: ExtraUnit;
  // null = ligne demandée par le client, pas encore chiffrée (« à chiffrer »).
  unitAmount: number | null;
  quantity: number;
  requestedByClient?: boolean;
};

type QuoteFormProps = {
  bookingId: string;
  nights: number;
  catsCount: number;
  current: {
    pricePerFirstCat: number | null;
    pricePerExtraCat: number | null;
    depositPercentage: number;
    extras: QuoteFormExtra[];
  };
  suggested: {
    pricePerFirstCat: number;
    pricePerExtraCat: number;
    depositPercentage: number;
  };
  presets: QuoteFormPreset[];
};

const OTHER_VALUE = "__other__";

type Line = {
  /** Identifiant local stable (clé React). */
  key: string;
  /** id du préset choisi, "" si aucun, OTHER_VALUE si Autre. */
  presetId: string;
  label: string;
  unit: ExtraUnit;
  /** Prix unitaire (saisi). Chaîne vide = « à chiffrer ». */
  unitAmount: string;
  /** Quantité (saisie) — utilisée seulement pour « par visite ». */
  quantity: string;
  /** Vrai si la ligne vient d'une option demandée par le client. */
  requestedByClient?: boolean;
};

let lineCounter = 0;
function nextKey(): string {
  lineCounter += 1;
  return `line-${lineCounter}`;
}

/// Convertit les extras déjà enregistrés en `Line[]`. Si le label correspond
/// exactement à un préset, on lie ; sinon c'est une ligne « Autre ».
function linesFromExtras(
  extras: QuoteFormExtra[],
  presets: QuoteFormPreset[],
): Line[] {
  return extras.map((e) => {
    const match = presets.find((p) => p.label === e.label);
    return {
      key: nextKey(),
      presetId: match ? match.id : OTHER_VALUE,
      label: e.label,
      unit: e.unit,
      // null (« à chiffrer ») → champ vide, à remplir par l'admin.
      unitAmount: e.unitAmount === null ? "" : String(e.unitAmount),
      quantity: String(e.quantity),
      requestedByClient: e.requestedByClient,
    };
  });
}

export function QuoteForm({
  bookingId,
  nights,
  catsCount,
  current,
  suggested,
  presets,
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
  const [lines, setLines] = useState<Line[]>(() =>
    linesFromExtras(current.extras, presets),
  );

  const extras = useMemo(() => Math.max(0, catsCount - 1), [catsCount]);

  const { total, deposit, perNight, extrasTotal } = useMemo(() => {
    const first = Number(pricePerFirstCat) || 0;
    const extra = Number(pricePerExtraCat) || 0;
    const perNightCalc = first + extras * extra;
    const extrasSum = lines.reduce(
      (sum, l) =>
        sum +
        (extraLineTotalNumber(
          l.unit,
          Number(l.unitAmount) || 0,
          Number(l.quantity) || 1,
          nights,
        ) ?? 0),
      0,
    );
    const totalCalc = perNightCalc * nights + extrasSum;
    const depositPct = Number(depositPercentage) || 0;
    const depositCalc = Math.round(totalCalc * depositPct) / 100;
    return {
      perNight: perNightCalc,
      extrasTotal: extrasSum,
      total: totalCalc,
      deposit: depositCalc,
    };
  }, [pricePerFirstCat, pricePerExtraCat, depositPercentage, nights, extras, lines]);

  function addLine(): void {
    setLines((prev) => [
      ...prev,
      {
        key: nextKey(),
        presetId: "",
        label: "",
        unit: "FLAT",
        unitAmount: "0",
        quantity: "1",
      },
    ]);
  }

  function removeLine(key: string): void {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  function changePreset(key: string, presetId: string): void {
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        if (presetId === OTHER_VALUE) {
          return { ...l, presetId: OTHER_VALUE, label: "", unit: "FLAT", unitAmount: "0" };
        }
        if (presetId === "") {
          return { ...l, presetId: "", label: "", unit: "FLAT", unitAmount: "0" };
        }
        const preset = presets.find((p) => p.id === presetId);
        if (!preset) return l;
        return {
          ...l,
          presetId,
          label: preset.label,
          unit: preset.unit,
          unitAmount: String(preset.defaultAmount),
        };
      }),
    );
  }

  function changeLineLabel(key: string, label: string): void {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, label } : l)));
  }

  function changeLineUnit(key: string, unit: ExtraUnit): void {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, unit } : l)));
  }

  function changeLineUnitAmount(key: string, unitAmount: string): void {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, unitAmount } : l)));
  }

  function changeLineQuantity(key: string, quantity: string): void {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, quantity } : l)));
  }

  function submit(opts: { withAccept: boolean }): void {
    setError(null);
    // Filtre les lignes vides (label vide après trim → on les ignore).
    const cleanExtras = lines
      .map((l) => ({
        label: l.label.trim(),
        unit: l.unit,
        unitAmount: Number(l.unitAmount) || 0,
        quantity: Math.max(1, Math.round(Number(l.quantity) || 1)),
      }))
      .filter((e) => e.label.length > 0);

    startTransition(async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricePerFirstCat: Number(pricePerFirstCat),
          pricePerExtraCat: Number(pricePerExtraCat),
          depositPercentage: Number(depositPercentage),
          extras: cleanExtras,
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
      </div>

      {/* Lignes de suppléments — ajout/suppression dynamique */}
      <div className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-cp-ink pb-2">
          <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-cobalt">
            Suppléments du séjour
          </p>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-cp-ink-soft">
            {lines.length === 0
              ? "Aucun supplément, ajoutez-en si besoin."
              : `${lines.length} ligne${lines.length > 1 ? "s" : ""} · ${extrasTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`}
          </p>
        </div>

        <ul className="mt-4 space-y-3">
          {lines.map((line) => (
            <ExtraLineRow
              key={line.key}
              line={line}
              presets={presets}
              nights={nights}
              onPresetChange={(v) => changePreset(line.key, v)}
              onLabelChange={(v) => changeLineLabel(line.key, v)}
              onUnitChange={(v) => changeLineUnit(line.key, v)}
              onUnitAmountChange={(v) => changeLineUnitAmount(line.key, v)}
              onQuantityChange={(v) => changeLineQuantity(line.key, v)}
              onRemove={() => removeLine(line.key)}
            />
          ))}
        </ul>

        <div className="mt-4">
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            + Ajouter un supplément
          </Button>
        </div>
      </div>

      {/* Récap calculé */}
      <div className="mt-8 grid gap-3 rounded-md border border-cp-cobalt bg-cp-paper-deep p-5 sm:grid-cols-3">
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

const SELECT_CLASS =
  "h-11 w-full min-w-0 rounded-md border border-cp-ink bg-cp-paper px-3 py-2 font-body text-base text-cp-ink transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-paprika md:text-sm";

function ExtraLineRow({
  line,
  presets,
  nights,
  onPresetChange,
  onLabelChange,
  onUnitChange,
  onUnitAmountChange,
  onQuantityChange,
  onRemove,
}: {
  line: Line;
  presets: QuoteFormPreset[];
  nights: number;
  onPresetChange: (v: string) => void;
  onLabelChange: (v: string) => void;
  onUnitChange: (v: ExtraUnit) => void;
  onUnitAmountChange: (v: string) => void;
  onQuantityChange: (v: string) => void;
  onRemove: () => void;
}) {
  const selectId = useId();
  const isOther = line.presetId === OTHER_VALUE;
  const lineTotal = extraLineTotalNumber(
    line.unit,
    line.unitAmount === "" ? null : Number(line.unitAmount) || 0,
    Number(line.quantity) || 1,
    nights,
  );
  return (
    <li className="rounded-md border border-cp-ink/30 bg-cp-paper-deep/40 p-3">
      {line.requestedByClient && (
        <p className="mb-2 font-mono text-[0.55rem] font-bold uppercase tracking-[0.18em] text-cp-cobalt">
          ★ Demandé par le client
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_auto] sm:items-start">
        <div className="space-y-2">
          <select
            id={selectId}
            aria-label="Choix du supplément"
            value={line.presetId}
            onChange={(e) => onPresetChange(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Choisir un supplément…</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} ({p.defaultAmount}€{unitShort(p.unit)})
              </option>
            ))}
            <option value={OTHER_VALUE}>Autre (à préciser)</option>
          </select>
          {isOther && (
            <Input
              type="text"
              placeholder="Préciser le libellé du supplément"
              aria-label="Libellé du supplément"
              value={line.label}
              onChange={(e) => onLabelChange(e.target.value)}
            />
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Supprimer cette ligne"
          className="inline-flex h-11 w-11 items-center justify-center self-start justify-self-end rounded-md border border-cp-ink bg-cp-paper text-cp-ink transition-colors hover:bg-cp-paprika hover:text-cp-paper"
        >
          <span aria-hidden className="text-lg leading-none">×</span>
        </button>
      </div>

      {/* Unité · prix unitaire · quantité (si par visite) · total de ligne */}
      <div className="mt-2 grid items-end gap-2 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto]">
        <label className="block">
          <span className="mb-1 block font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] text-cp-ink-soft">
            Unité
          </span>
          <select
            aria-label="Unité de facturation"
            value={line.unit}
            onChange={(e) => onUnitChange(e.target.value as ExtraUnit)}
            className={SELECT_CLASS}
          >
            {EXTRA_UNIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] text-cp-ink-soft">
            Prix unitaire (€)
          </span>
          <Input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            placeholder={line.requestedByClient ? "à chiffrer" : undefined}
            aria-label="Prix unitaire en euros"
            value={line.unitAmount}
            onChange={(e) => onUnitAmountChange(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] text-cp-ink-soft">
            {line.unit === "PER_VISIT" ? "Quantité" : line.unit === "PER_DAY" ? "Nuits" : "—"}
          </span>
          {line.unit === "PER_VISIT" ? (
            <Input
              type="number"
              min={1}
              step={1}
              aria-label="Nombre de visites"
              value={line.quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
            />
          ) : (
            <div className="flex h-11 items-center px-1 font-mono text-sm text-cp-ink-soft">
              {line.unit === "PER_DAY" ? `× ${nights}` : "—"}
            </div>
          )}
        </label>

        <div className="pb-2.5 text-right">
          <span className="font-mono text-sm font-bold whitespace-nowrap text-cp-ink">
            = {lineTotal === null ? "à chiffrer" : `${lineTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`}
          </span>
        </div>
      </div>
    </li>
  );
}

/// Suffixe court d'unité pour l'option du sélecteur (« /jour », « /visite »).
function unitShort(unit: ExtraUnit): string {
  return unit === "PER_DAY" ? "/jour" : unit === "PER_VISIT" ? "/visite" : "";
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
