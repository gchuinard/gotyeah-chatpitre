"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/// Saisie admin du montant réellement encaissé sur un séjour (PATCH
/// /api/admin/bookings/[id]). Affiche le reste à encaisser par rapport au total.
export function BookingPaymentControl({
  bookingId,
  total,
  initialPaid,
}: {
  bookingId: string;
  total: number;
  initialPaid: number | null;
}) {
  const router = useRouter();
  const [paid, setPaid] = useState(initialPaid != null ? String(initialPaid) : "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const paidNum = Math.max(0, Number(paid) || 0);
  const remaining = total - paidNum;

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paidAmount: paidNum }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'enregistrement.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <Field label="Montant encaissé (€)" htmlFor="booking-paid">
        <Input
          id="booking-paid"
          type="number"
          min="0"
          step="0.01"
          value={paid}
          onChange={(e) => {
            setPaid(e.target.value);
            setSaved(false);
          }}
          placeholder="0"
        />
      </Field>
      <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-ink-soft">
        {remaining > 0
          ? `Reste à encaisser : ${remaining.toLocaleString("fr-FR")}€ sur ${total.toLocaleString("fr-FR")}€`
          : `Soldé (${total.toLocaleString("fr-FR")}€)`}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" onClick={save} disabled={pending}>
          {pending ? "…" : "Enregistrer l'encaissement"}
        </Button>
        {saved && !pending && (
          <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-feuille">
            Enregistré ✓
          </span>
        )}
        {error && <span className="font-body text-xs text-cp-paprika">{error}</span>}
      </div>
    </div>
  );
}
