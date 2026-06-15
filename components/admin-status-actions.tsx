"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/// Actions « sans devis » pour un séjour PENDING ou QUESTION_ASKED :
/// — Poser une question : écrit le message au client ET passe le séjour en
///   QUESTION_ASKED en un seul geste (le client reçoit une notification et
///   retrouve la question dans le fil de discussion).
/// — Refuser la demande.
/// L'acceptation se fait via le QuoteForm (qui pose le tarif en même temps).

export function AdminStatusActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");

  function askQuestion() {
    const content = question.trim();
    if (!content) {
      setError("Écrivez votre question avant de l'envoyer.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "QUESTION_ASKED",
          questionMessage: content,
        }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'envoi de la question.");
        return;
      }
      setQuestion("");
      router.refresh();
    });
  }

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
        Répondre sans accepter
      </p>

      {/* Poser une question : message + bascule en QUESTION_ASKED */}
      <div className="mt-4">
        <Field
          label="Poser une question au client"
          htmlFor="admin-question"
          hint="Le client reçoit une notification et retrouve la question dans le fil de discussion."
        >
          <Textarea
            id="admin-question"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex. : Salami suit-il un traitement en ce moment ? Pouvez-vous préciser la marque de ses croquettes ?"
          />
        </Field>
        <div className="mt-3">
          <Button type="button" onClick={askQuestion} disabled={pending}>
            {pending ? "Envoi…" : "Envoyer la question →"}
          </Button>
        </div>
      </div>

      {/* Refuser */}
      <div className="mt-6 border-t border-cp-ink/15 pt-5">
        <button
          type="button"
          onClick={reject}
          disabled={pending}
          className={cn(
            buttonVariants({ variant: "destructive", size: "default" }),
            pending && "opacity-60",
          )}
        >
          Refuser la demande
        </button>
      </div>

      {error && <p className="mt-4 font-body text-sm text-cp-paprika">{error}</p>}
    </section>
  );
}
