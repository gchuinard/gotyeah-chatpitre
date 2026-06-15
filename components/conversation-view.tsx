"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { MessageThread } from "@/components/message-thread";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/// Vue conversation câblée sur l'API : POST /api/bookings/[id]/messages.
/// Optimistic update au submit (le message apparaît immédiatement),
/// router.refresh() au succès pour récupérer le message persisté avec
/// son vrai id + horodatage. En cas d'échec, on retire le message
/// optimistic et on affiche l'erreur.
///
/// Deux « voix » prédéfinies :
/// - `client` : auteur « Vous », formulaire sur fond paper
/// - `admin`  : auteur « La maison », formulaire sur fond ink

type Voice = "client" | "admin";

export type ConversationMessage = {
  id: string;
  body: string;
  fromAdmin: boolean;
  authorLabel: string;
  /** ISO string (sera formatée à l'affichage). */
  sentAt: string;
};

const VOICE_CONFIG: Record<
  Voice,
  {
    authorLabel: string;
    fromAdmin: boolean;
    formClass: string;
    textareaClass: string;
    label: string;
    labelClass: string;
    placeholder: string;
    buttonClass: string;
  }
> = {
  client: {
    authorLabel: "Vous",
    fromAdmin: false,
    formClass: "rounded-md border border-cp-ink bg-cp-paper p-6 sm:p-8",
    textareaClass: "",
    label: "Nouveau message",
    labelClass:
      "block font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika",
    placeholder: "Écrivez votre réponse à la maison…",
    buttonClass: "",
  },
  admin: {
    authorLabel: "La maison",
    fromAdmin: true,
    formClass:
      "rounded-md border border-cp-ink bg-cp-ink text-cp-paper p-6 sm:p-8",
    textareaClass:
      "border-cp-paper/40 bg-cp-ink text-cp-paper placeholder:text-cp-paper/50 focus-visible:outline-cp-paper",
    label: "Réponse de la maison",
    labelClass:
      "block font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paper/70",
    placeholder: "Écrivez votre réponse au client…",
    buttonClass:
      "border-cp-paper text-cp-paper bg-transparent hover:bg-cp-paper hover:text-cp-ink",
  },
};

export function ConversationView({
  bookingId,
  initialMessages,
  voice,
  canRespond = false,
}: {
  bookingId: string;
  initialMessages: ConversationMessage[];
  voice: Voice;
  /** Admin uniquement, tant que la demande n'est pas tranchée : affiche les
   *  actions « Poser une question » (message + QUESTION_ASKED) et « Refuser ». */
  canRespond?: boolean;
}) {
  const router = useRouter();
  const config = VOICE_CONFIG[voice];
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  /// Envoie le contenu du composer, soit comme message simple, soit comme
  /// question (qui bascule le séjour en QUESTION_ASKED via la route admin).
  function send(mode: "message" | "question") {
    setError(null);
    const content = body.trim();
    if (!content) {
      setError(
        mode === "question"
          ? "Écrivez votre question avant de l'envoyer."
          : "Écrivez un message avant de l'envoyer.",
      );
      return;
    }

    const optimisticId = `m-optimistic-${Date.now()}`;
    const optimistic: ConversationMessage = {
      id: optimisticId,
      body: content,
      fromAdmin: config.fromAdmin,
      authorLabel: config.authorLabel,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");

    startTransition(async () => {
      const res =
        mode === "question"
          ? await fetch(`/api/admin/bookings/${bookingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                status: "QUESTION_ASKED",
                questionMessage: content,
              }),
            })
          : await fetch(`/api/bookings/${bookingId}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ content }),
            });

      if (!res.ok) {
        // Retire l'optimistic + affiche l'erreur
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'envoi.");
        return;
      }

      // Au succès, on rafraîchit la page pour récupérer les messages
      // re-fetchés depuis Prisma (avec les vrais ids + horodatages).
      router.refresh();
    });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    send("message");
  }

  /// Refuse la demande (statut REJECTED). Confirmé via ConfirmDialog.
  function reject() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec du refus de la demande.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <MessageThread
        messages={messages.map((m) => ({
          id: m.id,
          fromAdmin: m.fromAdmin,
          authorLabel: m.authorLabel,
          body: m.body,
          sentAt: formatSentAt(m.sentAt),
        }))}
      />

      <form
        onSubmit={onSubmit}
        className={cn("space-y-4", config.formClass)}
        noValidate
      >
        <label htmlFor={`${voice}-reply`} className={config.labelClass}>
          {config.label}
        </label>
        <Textarea
          id={`${voice}-reply`}
          name="body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={config.placeholder}
          className={config.textareaClass}
          disabled={pending}
        />
        <div className="flex flex-wrap items-center justify-end gap-3">
          {error && (
            <p className="mr-auto font-body text-xs text-cp-paprika">{error}</p>
          )}
          {canRespond && (
            <button
              type="button"
              disabled={pending}
              onClick={() => setRejectOpen(true)}
              className={cn(
                "mr-auto font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] underline-offset-4 transition-colors hover:underline",
                voice === "admin" ? "text-cp-paper/70 hover:text-cp-paper" : "text-cp-paprika",
                pending && "opacity-60",
              )}
            >
              Refuser la demande
            </button>
          )}
          <Button
            type="submit"
            size="default"
            variant={voice === "admin" ? "secondary" : "default"}
            className={config.buttonClass}
            disabled={pending}
          >
            {pending ? "Envoi…" : "Envoyer →"}
          </Button>
          {canRespond && (
            <Button
              type="button"
              size="default"
              variant="secondary"
              className={config.buttonClass}
              disabled={pending}
              onClick={() => send("question")}
              title="Envoie le message et marque le séjour « Question posée » (le client est notifié)."
            >
              {pending ? "Envoi…" : "Poser une question →"}
            </Button>
          )}
        </div>
      </form>

      {canRespond && (
        <ConfirmDialog
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          title="Refuser cette demande ?"
          description="Le séjour passera en « Refusé » et le client en sera notifié. Vous pourrez toujours échanger dans le fil, mais la demande ne pourra plus être acceptée."
          confirmLabel="Refuser la demande"
          cancelLabel="Annuler"
          confirmVariant="destructive"
          onConfirm={reject}
        />
      )}
    </div>
  );
}

const sentAtFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatSentAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return sentAtFormatter.format(date).replace(", ", " · ").replace(":", "h");
}
