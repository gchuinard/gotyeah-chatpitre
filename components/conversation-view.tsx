"use client";

import { useRef, useState, type FormEvent } from "react";

import { MessageThread } from "@/components/message-thread";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FixtureMessage } from "@/lib/fixtures";

/// Vue conversation avec optimistic update. Le client component wrappe
/// le MessageThread + le formulaire de réponse : au submit, le message
/// est ajouté immédiatement à la liste locale (donc visible dans le fil
/// au-dessus du formulaire) et le textarea est vidé. Comme tout est en
/// state local, un refresh revient aux fixtures — c'est explicite via
/// la mention « non persisté (maquette) » discrète.
///
/// Deux « voix » prédéfinies :
/// - `client` : auteur « Vous », formulaire sur fond paper
/// - `admin`  : auteur « La maison », formulaire sur fond ink

type Voice = "client" | "admin";

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
  initialMessages,
  voice,
}: {
  initialMessages: FixtureMessage[];
  voice: Voice;
}) {
  const config = VOICE_CONFIG[voice];
  const [messages, setMessages] = useState<FixtureMessage[]>(initialMessages);
  const [showMaquetteNote, setShowMaquetteNote] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    const newMessage: FixtureMessage = {
      id: `m-local-${Date.now()}`,
      fromAdmin: config.fromAdmin,
      authorLabel: config.authorLabel,
      body,
      sentAt: "à l'instant · session locale",
    };

    setMessages((prev) => [...prev, newMessage]);
    formRef.current?.reset();
    setShowMaquetteNote(true);
  }

  return (
    <div className="space-y-6">
      <MessageThread messages={messages} />

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
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="default"
            variant={voice === "admin" ? "secondary" : "default"}
            className={config.buttonClass}
          >
            Envoyer →
          </Button>
        </div>
      </form>

      {showMaquetteNote && (
        <p className="font-body text-xs italic leading-relaxed text-cp-mute">
          Note : votre message apparaît dans le fil pour cette session,
          mais n&apos;est pas encore persisté côté serveur. Le câblage
          data viendra dans un prompt dédié.
        </p>
      )}
    </div>
  );
}
