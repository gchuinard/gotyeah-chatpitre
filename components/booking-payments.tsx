"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { PaymentMethod } from "@prisma/client";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { formatEuros } from "@/lib/format";

/// Encaissements d'un séjour : plusieurs versements, chacun avec son montant,
/// son moyen, sa date et une référence facultative.
///
/// Le total encaissé et le reste dû se lisent sous la liste. Un trop-perçu est
/// SIGNALÉ mais accepté : il arrive, et refuser la saisie obligerait à mentir
/// dans les chiffres.

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Espèces",
  CHEQUE: "Chèque",
  TRANSFER: "Virement",
  OTHER: "Autre",
};

const METHOD_ORDER: PaymentMethod[] = ["CASH", "CHEQUE", "TRANSFER", "OTHER"];

const SELECT_CLASS =
  "h-11 w-full min-w-0 rounded-md border border-cp-ink bg-cp-paper px-3 py-2 font-body text-base text-cp-ink transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-paprika md:text-sm";

export type PaymentRow = {
  id: string;
  amount: number;
  method: PaymentMethod;
  /// Déjà formatée côté serveur, pour l'affichage.
  paidAtLabel: string;
  /// Format aaaa-mm-jj, pour repeupler le champ date à la correction.
  paidAtInput: string;
  reference: string | null;
  recordedByLabel: string | null;
};

type Draft = {
  /// Vide pour un nouveau versement, sinon l'identifiant corrigé.
  id: string | null;
  amount: string;
  method: PaymentMethod;
  paidAt: string;
  reference: string;
};

export function BookingPayments({
  bookingId,
  total,
  payments,
  today,
}: {
  bookingId: string;
  /// Total facturé, pour calculer le reste dû.
  total: number;
  payments: PaymentRow[];
  /// Date du jour à Paris, calculée côté serveur pour pré-remplir le champ.
  today: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft(today));
  const [toDelete, setToDelete] = useState<PaymentRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const collected = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - collected;

  function reset() {
    setDraft(emptyDraft(today));
  }

  function save() {
    setError(null);
    const amount = Number(draft.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Saisissez un montant supérieur à zéro.");
      return;
    }
    startTransition(async () => {
      const target = draft.id
        ? `/api/admin/payments/${draft.id}`
        : `/api/admin/bookings/${bookingId}/payments`;
      const res = await request(target, draft.id ? "PATCH" : "POST", {
        amount,
        method: draft.method,
        paidAt: draft.paidAt,
        reference: draft.reference.trim() || undefined,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      reset();
      router.refresh();
    });
  }

  function confirmDelete() {
    const payment = toDelete;
    if (!payment) return;
    setError(null);
    startTransition(async () => {
      const res = await request(`/api/admin/payments/${payment.id}`, "DELETE");
      if (!res.ok) {
        setError(res.message);
        return;
      }
      // Si on corrigeait justement cette ligne, le brouillon n'a plus d'objet.
      if (draft.id === payment.id) reset();
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {payments.length > 0 && (
        <ul className="divide-y divide-cp-ink/15 border-y border-cp-ink/15">
          {payments.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
            >
              <div className="min-w-0">
                <p className="font-body text-sm text-cp-ink">
                  <span className="font-display text-lg font-bold">
                    {formatEuros(p.amount)}€
                  </span>{" "}
                  · {PAYMENT_METHOD_LABEL[p.method]} · {p.paidAtLabel}
                </p>
                {(p.reference || p.recordedByLabel) && (
                  <p className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-cp-ink-soft">
                    {[p.reference, p.recordedByLabel && `saisi par ${p.recordedByLabel}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Corriger le versement de ${formatEuros(p.amount)} euros`}
                  title="Corriger"
                  disabled={pending}
                  onClick={() =>
                    setDraft({
                      id: p.id,
                      amount: String(p.amount),
                      method: p.method,
                      paidAt: p.paidAtInput,
                      reference: p.reference ?? "",
                    })
                  }
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Supprimer le versement de ${formatEuros(p.amount)} euros`}
                  title="Supprimer"
                  disabled={pending}
                  onClick={() => setToDelete(p)}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cp-ink-soft">
        {remaining > 0 ? (
          <>
            Encaissé {formatEuros(collected)}€ sur {formatEuros(total)}€, reste{" "}
            <span className="text-cp-paprika">{formatEuros(remaining)}€</span>
          </>
        ) : remaining < 0 ? (
          <span className="text-cp-cobalt">
            Trop-perçu de {formatEuros(-remaining)}€ ({formatEuros(collected)}€
            encaissés pour {formatEuros(total)}€ facturés)
          </span>
        ) : (
          <span className="text-cp-feuille">Soldé, {formatEuros(total)}€</span>
        )}
      </p>

      <div className="space-y-3 rounded-md border border-cp-ink/30 bg-cp-paper p-4">
        <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
          {draft.id ? "Corriger le versement" : "Nouveau versement"}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Montant (€)" htmlFor="payment-amount">
            <Input
              id="payment-amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
              placeholder="0"
            />
          </Field>
          <Field label="Moyen de paiement" htmlFor="payment-method">
            <select
              id="payment-method"
              className={SELECT_CLASS}
              value={draft.method}
              onChange={(e) =>
                setDraft({ ...draft, method: e.target.value as PaymentMethod })
              }
            >
              {METHOD_ORDER.map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABEL[m]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date du versement" htmlFor="payment-date">
            <Input
              id="payment-date"
              type="date"
              value={draft.paidAt}
              onChange={(e) => setDraft({ ...draft, paidAt: e.target.value })}
            />
          </Field>
          <Field label="Référence (facultatif)" htmlFor="payment-reference">
            <Input
              id="payment-reference"
              type="text"
              value={draft.reference}
              onChange={(e) => setDraft({ ...draft, reference: e.target.value })}
              placeholder="N° de chèque, référence de virement…"
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="sm" onClick={save} disabled={pending}>
            {pending ? "…" : draft.id ? "Enregistrer la correction" : "Ajouter le versement"}
          </Button>
          {draft.id && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={reset}
              disabled={pending}
            >
              Annuler la correction
            </Button>
          )}
          {error && <span className="font-body text-xs text-cp-paprika">{error}</span>}
        </div>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
        title="Supprimer ce versement ?"
        description="La ligne disparaîtra de l'encaissement du séjour, et le total sera recalculé."
        confirmLabel="Supprimer"
        cancelLabel="Revenir en arrière"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function emptyDraft(today: string): Draft {
  return { id: null, amount: "", method: "CASH", paidAt: today, reference: "" };
}

/// Enveloppe les appels : une panne réseau ne doit pas remonter en exception
/// non rattrapée, et le message du serveur vaut mieux que le nôtre.
async function request(
  url: string,
  method: string,
  body?: unknown,
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) return { ok: true };
    const data: { error?: string } = await res.json().catch(() => ({}));
    return { ok: false, message: data.error ?? "Échec de l'enregistrement." };
  } catch {
    return { ok: false, message: "Échec de l'enregistrement, vérifiez la connexion." };
  }
}
