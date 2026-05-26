"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/field";
import { Input } from "@/components/ui/input";

/// Éditeur du catalogue des presets de suppléments. Affiche chaque préset
/// avec actions « Modifier » / « Supprimer » (édition inline), et une
/// section « + Ajouter un préset » en bas qui ouvre un mini-formulaire.
///
/// Chaque action déclenche une requête à l'API et un router.refresh() qui
/// re-fetch les données serveur de la page.

export type ExtraPresetItem = {
  id: string;
  label: string;
  defaultAmount: number;
  sortOrder: number;
};

export function ExtrasPresetsEditor({ presets }: { presets: ExtraPresetItem[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <ul className="overflow-hidden rounded-md border border-cp-ink">
        {presets.length === 0 ? (
          <li className="bg-cp-paper p-6 text-center font-body text-sm text-cp-ink-soft">
            Aucun préset pour l&apos;instant — ajoutez-en un ci-dessous.
          </li>
        ) : (
          presets.map((preset, idx) => (
            <PresetRow
              key={preset.id}
              preset={preset}
              striped={idx % 2 === 1}
            />
          ))
        )}
      </ul>

      {adding ? (
        <AddForm onDone={() => setAdding(false)} />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => setAdding(true)}
        >
          + Ajouter un préset
        </Button>
      )}
    </div>
  );
}

function PresetRow({
  preset,
  striped,
}: {
  preset: ExtraPresetItem;
  striped: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(preset.label);
  const [amount, setAmount] = useState(String(preset.defaultAmount));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function cancel(): void {
    setLabel(preset.label);
    setAmount(String(preset.defaultAmount));
    setEditing(false);
    setError(null);
  }

  function save(): void {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/extras-presets/${preset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          defaultAmount: Number(amount) || 0,
        }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'enregistrement.");
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  function remove(): void {
    if (!window.confirm(`Supprimer le préset « ${preset.label} » ?`)) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/extras-presets/${preset.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de la suppression.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <li
      className={`flex flex-wrap items-center gap-3 border-b border-cp-ink/15 px-5 py-4 last:border-b-0 ${striped ? "bg-cp-paper-deep/40" : "bg-cp-paper"}`}
    >
      {editing ? (
        <div className="flex w-full flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1">
            <Field label="Libellé" htmlFor={`label-${preset.id}`}>
              <Input
                id={`label-${preset.id}`}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </Field>
          </div>
          <div className="w-32">
            <Field label="Prix par défaut (€)" htmlFor={`amount-${preset.id}`}>
              <Input
                id={`amount-${preset.id}`}
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={save} disabled={pending}>
              {pending ? "Envoi…" : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={cancel}
              disabled={pending}
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-1 flex-wrap items-baseline gap-3">
            <p className="font-display text-xl italic text-cp-ink">
              {preset.label}
            </p>
            <p className="font-mono text-sm font-bold text-cp-paprika">
              {preset.defaultAmount.toLocaleString("fr-FR")}€
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              disabled={pending}
            >
              Modifier
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={remove}
              disabled={pending}
            >
              {pending ? "…" : "Supprimer"}
            </Button>
          </div>
        </>
      )}
      {error && (
        <p
          role="alert"
          className="basis-full border border-cp-paprika bg-cp-paprika/8 px-3 py-2 font-body text-xs text-cp-paprika"
        >
          {error}
        </p>
      )}
    </li>
  );
}

function AddForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(): void {
    setError(null);
    if (!label.trim()) {
      setError("Le libellé est requis.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/extras-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          defaultAmount: Number(amount) || 0,
        }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de la création.");
        return;
      }
      onDone();
      router.refresh();
    });
  }

  return (
    <div className="rounded-md border border-cp-cobalt bg-cp-paper-deep p-5">
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-cobalt">
        Nouveau préset
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div className="min-w-[16rem] flex-1">
          <Field label="Libellé" htmlFor="new-preset-label">
            <Input
              id="new-preset-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex. : Brossage long poil"
            />
          </Field>
        </div>
        <div className="w-32">
          <Field label="Prix par défaut (€)" htmlFor="new-preset-amount">
            <Input
              id="new-preset-amount"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="default" onClick={submit} disabled={pending}>
            {pending ? "Envoi…" : "Créer"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={onDone}
            disabled={pending}
          >
            Annuler
          </Button>
        </div>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-3 border border-cp-paprika bg-cp-paprika/8 px-3 py-2 font-body text-xs text-cp-paprika"
        >
          {error}
        </p>
      )}
    </div>
  );
}
