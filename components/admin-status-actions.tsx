"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/// Boutons de décision admin pour un séjour PENDING ou QUESTION_ASKED.
/// Trois actions : Accepter, Poser une question, Refuser. Chacune envoie
/// un PATCH /api/admin/bookings/[id] avec le nouveau statut, puis refresh.

export function AdminStatusActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function applyStatus(status: "ACCEPTED" | "QUESTION_ASKED" | "REJECTED") {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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
    <section className="mt-14 rounded-md border border-cp-ink bg-cp-paper-deep/60 p-6 sm:p-8">
      <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
        Décision à prendre
      </p>
      <p className="mt-3 font-display text-2xl italic leading-snug text-cp-ink sm:text-3xl">
        Quelle suite donnez-vous ?
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => applyStatus("ACCEPTED")}
          disabled={pending}
          className={cn(
            buttonVariants({ size: "default" }),
            pending && "opacity-60",
          )}
        >
          Accepter →
        </button>
        <button
          type="button"
          onClick={() => applyStatus("QUESTION_ASKED")}
          disabled={pending}
          className={cn(
            buttonVariants({ variant: "secondary", size: "default" }),
            pending && "opacity-60",
          )}
        >
          Poser une question
        </button>
        <button
          type="button"
          onClick={() => applyStatus("REJECTED")}
          disabled={pending}
          className={cn(
            buttonVariants({ variant: "destructive", size: "default" }),
            pending && "opacity-60",
          )}
        >
          Refuser
        </button>
      </div>
      {error && (
        <p className="mt-4 font-body text-sm text-cp-paprika">{error}</p>
      )}
    </section>
  );
}
