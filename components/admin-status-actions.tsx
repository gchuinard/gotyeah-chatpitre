"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/// Action « refuser » pour un séjour PENDING ou QUESTION_ASKED.
/// — L'acceptation se fait via le QuoteForm (qui pose le tarif).
/// — Poser une question se fait dans le fil de discussion (bouton dédié du
///   composer, qui poste le message et passe le séjour en QUESTION_ASKED).

export function AdminStatusActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function reject() {
    if (!window.confirm("Refuser définitivement cette demande de séjour ?")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de la mise à jour du statut.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="mt-8 rounded-md border border-cp-ink/40 bg-cp-paper-deep/60 p-5 sm:p-6">
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft">
        Refuser la demande
      </p>
      <p className="mt-2 font-body text-sm text-cp-ink-soft">
        Pour poser une question au client, utilisez le fil de discussion plus
        bas (bouton « Poser une question »).
      </p>
      <div className="mt-4">
        <button
          type="button"
          onClick={reject}
          disabled={pending}
          className={cn(
            buttonVariants({ variant: "destructive", size: "default" }),
            pending && "opacity-60",
          )}
        >
          {pending ? "…" : "Refuser la demande"}
        </button>
      </div>
      {error && <p className="mt-4 font-body text-sm text-cp-paprika">{error}</p>}
    </section>
  );
}
