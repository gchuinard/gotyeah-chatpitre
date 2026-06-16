"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ChatMessage = { id: string; mine: boolean; text: string };

/// Panneau de chat texte éphémère affiché à côté de la visio. Présentationnel :
/// l'état des messages et l'envoi (relais via le signaling) vivent dans VideoCall.
export function CallChat({
  messages,
  onSend,
  peerName,
  disabled = false,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  peerName: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  return (
    <div className="flex flex-col rounded-md border border-cp-ink bg-cp-paper">
      <p className="border-b border-cp-ink/30 px-4 py-2 font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
        Messages
      </p>
      <div className="flex max-h-72 min-h-[8rem] flex-col gap-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-center font-display text-base italic text-cp-mute">
            Aucun message pour l&apos;instant.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col gap-0.5 ${m.mine ? "items-end" : "items-start"}`}
            >
              <span className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] text-cp-mute">
                {m.mine ? "Vous" : peerName}
              </span>
              <span
                className={`max-w-[85%] break-words rounded-md px-3 py-1.5 font-body text-sm leading-snug whitespace-pre-wrap ${
                  m.mine
                    ? "bg-cp-ink text-cp-paper"
                    : "border border-cp-ink bg-cp-paper text-cp-ink"
                }`}
              >
                {m.text}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-cp-ink/30 p-3"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écrire un message…"
          maxLength={2000}
          disabled={disabled}
          aria-label="Message"
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !draft.trim()}
          aria-label="Envoyer"
        >
          <Send />
        </Button>
      </form>
    </div>
  );
}
