"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/// Clôture et réouverture d'un séjour, côté administration.
///
/// Les deux gestes passent par PATCH /api/admin/bookings/[id], mais la
/// réouverture y envoie un drapeau `reopen` dédié plutôt qu'un simple `status`.
/// C'est la seule écriture admise sur un séjour clôturé en dehors de
/// l'encaissement : la route doit pouvoir la reconnaître explicitement, et non
/// la déduire de la valeur d'un champ que le formulaire de devis et le fil
/// d'échanges envoient tous les deux.

const MODES = {
  complete: {
    label: "Marquer comme terminé",
    variant: "secondary" as const,
    title: "Marquer ce séjour comme terminé ?",
    description:
      "La fiche passera en lecture seule : plus d'avis sur les pensionnaires, plus de carnet, plus de rendez-vous, plus de message. Seul l'encaissement restera modifiable. Le client sera prévenu, avec un renvoi vers sa facture et le carnet.",
    confirmLabel: "Marquer comme terminé",
    payload: { status: "COMPLETED" },
    failure: "Échec de la clôture du séjour.",
  },
  reopen: {
    label: "Rouvrir le séjour",
    variant: "outline" as const,
    title: "Rouvrir ce séjour ?",
    description:
      "Le séjour redeviendra modifiable. Un séjour terminé repasse en « Accepté ». Un séjour annulé repasse en « En attente », et devra donc être accepté à nouveau. Le client n'est pas prévenu de la réouverture.",
    confirmLabel: "Rouvrir",
    payload: { reopen: true },
    failure: "Échec de la réouverture du séjour.",
  },
};

export function BookingClosureControl({
  bookingId,
  mode,
}: {
  bookingId: string;
  mode: keyof typeof MODES;
}) {
  const router = useRouter();
  const config = MODES[mode];
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      let ok = false;
      let message: string | null = null;
      try {
        const res = await fetch(`/api/admin/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config.payload),
        });
        ok = res.ok;
        if (!ok) {
          const data: { error?: string } = await res.json().catch(() => ({}));
          message = data.error ?? null;
        }
      } catch {
        ok = false;
      }
      if (!ok) {
        setError(message ?? config.failure);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant={config.variant}
        size="default"
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
      >
        {pending ? "…" : config.label}
      </Button>

      {error && (
        <p role="alert" className="font-body text-xs text-cp-paprika">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={config.title}
        description={config.description}
        confirmLabel={config.confirmLabel}
        cancelLabel="Revenir en arrière"
        onConfirm={submit}
      />
    </div>
  );
}
