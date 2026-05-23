"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/// Bouton « Annuler la demande » côté client — confirmation native (window.confirm)
/// pour éviter un faux clic, puis PATCH /api/bookings/[id] avec action: "cancel".
/// Au succès, refresh la page pour rafraîchir le statut affiché.

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    if (!window.confirm("Annuler cette demande de séjour ? Cette action ne peut pas être annulée.")) return;

    startTransition(async () => {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'annulation.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={cn(
          buttonVariants({ variant: "destructive", size: "sm" }),
          pending && "opacity-60",
        )}
      >
        {pending ? "Annulation…" : "Annuler la demande"}
      </button>
      {error && (
        <p className="font-body text-xs text-cp-paprika">{error}</p>
      )}
    </div>
  );
}
