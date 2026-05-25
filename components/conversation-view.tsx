"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { MessageThread } from "@/components/message-thread";
import { Button } from "@/components/ui/button";
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
}: {
  bookingId: string;
  initialMessages: ConversationMessage[];
  voice: Voice;
}) {
  const router = useRouter();
  const config = VOICE_CONFIG[voice];
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    const optimisticId = `m-optimistic-${Date.now()}`;
    const optimistic: ConversationMessage = {
      id: optimisticId,
      body,
      fromAdmin: config.fromAdmin,
      authorLabel: config.authorLabel,
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    formRef.current?.reset();

    startTransition(async () => {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: body }),
      });

      if (!res.ok) {
        // Retire l'optimistic + affiche l'erreur
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de l'envoi du message.");
        return;
      }

      // Au succès, on rafraîchit la page pour récupérer les messages
      // re-fetchés depuis Prisma (avec les vrais ids + horodatages).
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
        ref={formRef}
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
          placeholder={config.placeholder}
          className={config.textareaClass}
          disabled={pending}
        />
        <div className="flex items-center justify-end gap-4">
          {error && (
            <p className="font-body text-xs text-cp-paprika">{error}</p>
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
        </div>
      </form>
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
