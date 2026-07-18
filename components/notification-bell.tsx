"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Popover } from "@base-ui/react/popover";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  label: string;
  timeAgo: string;
  unread?: boolean;
  href?: string;
};

/// Cloche de notifications dans l'en-tête. Bouton + pastille sanguine s'il y a
/// des non-lues. Cliquer une notification la marque lue (PATCH) puis suit son
/// lien quand elle en a un ; le pied de liste marque tout lu d'un coup. Chaque
/// action rafraîchit la page pour que le compteur suive.
export function NotificationBell({ items }: { items: NotificationItem[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const unreadCount = items.filter((i) => i.unread).length;

  function openNotification(item: NotificationItem) {
    setIsOpen(false);
    startTransition(async () => {
      // Si le marquage échoue on navigue quand même : c'est l'intention du
      // clic. Le refresh la laissera « non lue », ce qui reste honnête.
      if (item.unread) {
        try {
          await fetch(`/api/notifications/${item.id}/read`, { method: "PATCH" });
        } catch {
          /* l'état réel est rétabli par le refresh ci-dessous */
        }
      }
      if (item.href) router.push(item.href);
      router.refresh();
    });
  }

  function markAllRead() {
    setError(null);
    startTransition(async () => {
      let ok = false;
      try {
        const res = await fetch("/api/notifications", { method: "PATCH" });
        ok = res.ok;
      } catch {
        ok = false;
      }
      // Ici l'utilisateur reste dans la popup : on lui dit si ça a raté.
      if (!ok) {
        setError("Échec, rien n'a été marqué comme lu.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} non lue${unreadCount > 1 ? "s" : ""})` : ""}`}
        className="group relative grid size-10 place-items-center rounded-md border border-cp-ink/40 bg-cp-paper text-cp-ink outline-none transition-colors hover:border-cp-cobalt hover:bg-cp-cobalt hover:text-cp-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cp-paprika"
      >
        <Bell className="size-4" strokeWidth={1.6} aria-hidden />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full border border-cp-paper bg-cp-paprika font-mono text-[0.6rem] font-bold leading-none text-cp-paper"
          >
            {unreadCount}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="end">
          <Popover.Popup className="origin-top w-[min(22rem,calc(100vw-1.5rem))] rounded-md border border-cp-ink bg-cp-paper text-cp-ink shadow-[6px_6px_0_0_var(--color-cp-cobalt)] outline-none">
            <header className="flex items-center justify-between border-b border-cp-ink px-4 py-3">
              <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.16em] text-cp-paprika">
                Notifications
              </p>
              <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
                {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout lu"}
              </p>
            </header>

            {items.length === 0 ? (
              <p className="px-4 py-10 text-center font-display italic text-cp-ink-soft">
                Aucune notification.
              </p>
            ) : (
              <ul className="max-h-80 divide-y divide-cp-ink/20 overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id}>
                    <NotificationRow item={n} onOpen={openNotification} />
                  </li>
                ))}
              </ul>
            )}

            <footer className="space-y-2 border-t border-cp-ink px-4 py-3">
              <button
                type="button"
                onClick={markAllRead}
                disabled={pending || unreadCount === 0}
                className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft transition-colors hover:text-cp-paprika disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-cp-ink-soft"
              >
                {pending ? "…" : "Tout marquer comme lu →"}
              </button>
              {error && (
                <p role="alert" className="font-body text-xs text-cp-paprika">
                  {error}
                </p>
              )}
            </footer>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
}) {
  const rowClass =
    "block w-full text-left transition-colors hover:bg-cp-paper-deep/60 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cp-paprika";

  const content = (
    <div className="flex flex-col gap-1 px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={cn(
              "font-body text-sm leading-snug text-cp-ink",
              item.unread && "font-medium",
            )}
          >
            {item.label}
          </p>
          {item.unread && (
            <span
              aria-hidden
              className="mt-1 size-2 shrink-0 rounded-full bg-cp-paprika"
            />
          )}
        </div>
        <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
          {item.timeAgo}
        </p>
    </div>
  );

  // Quand la notification porte un lien, on garde un VRAI <a> : ctrl-clic,
  // clic milieu et « ouvrir dans un nouvel onglet » doivent continuer de
  // marcher. On n'intercepte que le clic gauche simple, pour marquer lu
  // avant de naviguer.
  if (item.href) {
    return (
      <a
        href={item.href}
        className={rowClass}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
            return;
          }
          e.preventDefault();
          onOpen(item);
        }}
      >
        {content}
      </a>
    );
  }

  // Sans lien, il n'y a rien à ouvrir : un bouton suffit (marque lu).
  return (
    <button type="button" onClick={() => onOpen(item)} className={rowClass}>
      {content}
    </button>
  );
}
