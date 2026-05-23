import { cn } from "@/lib/utils";
import type { FixtureMessage } from "@/lib/fixtures";

/// Fil de discussion entre le client et la maison. Pas de bulles
/// arrondies — chaque message est un bloc imprimé avec en-tête mono caps
/// (auteur + horodatage) et corps en body. Les messages de la maison
/// sont en encre pleine (paper text) pour les distinguer.

export function MessageThread({
  messages,
  emptyLabel = "Aucun message échangé pour l'instant.",
}: {
  messages: FixtureMessage[];
  emptyLabel?: string;
}) {
  if (messages.length === 0) {
    return (
      <p className="border border-cp-ink/30 bg-cp-paper-deep/40 p-8 text-center font-display text-xl italic text-cp-ink-soft">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ol className="space-y-5">
      {messages.map((m) => (
        <li key={m.id}>
          <MessageBubble message={m} />
        </li>
      ))}
    </ol>
  );
}

export function MessageBubble({ message }: { message: FixtureMessage }) {
  const fromAdmin = message.fromAdmin;
  return (
    <article
      className={cn(
        "flex flex-col gap-3 border border-cp-ink p-5 sm:p-6",
        fromAdmin
          ? "bg-cp-ink text-cp-paper sm:ml-12"
          : "bg-cp-paper text-cp-ink sm:mr-12",
      )}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b pb-2.5">
        <span
          className={cn(
            "font-mono text-[0.6rem] font-bold uppercase tracking-[0.22em]",
            fromAdmin ? "text-cp-paper" : "text-cp-paprika",
          )}
        >
          {message.authorLabel}
        </span>
        <span
          className={cn(
            "font-mono text-[0.6rem] uppercase tracking-[0.16em]",
            fromAdmin ? "text-cp-paper/70" : "text-cp-ink-soft",
          )}
        >
          {message.sentAt}
        </span>
      </header>
      <p
        className={cn(
          "font-body text-base leading-relaxed",
          fromAdmin ? "text-cp-paper" : "text-cp-ink",
        )}
      >
        {message.body}
      </p>
    </article>
  );
}
