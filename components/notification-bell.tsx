"use client";

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

/// Cloche de notifications dans l'en-tête. Bouton + dot sanguine si non-lus.
/// Popover descendant à droite avec liste de notifications brutalist.
export function NotificationBell({
  items,
}: {
  items: NotificationItem[];
}) {
  const unreadCount = items.filter((i) => i.unread).length;

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} non lue${unreadCount > 1 ? "s" : ""})` : ""}`}
        className="group relative grid size-10 place-items-center border border-cp-ink/40 bg-cp-paper text-cp-ink outline-none transition-colors hover:border-cp-ink hover:bg-cp-ink hover:text-cp-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cp-paprika"
      >
        <Bell className="size-4" strokeWidth={1.6} aria-hidden />
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center border border-cp-paper bg-cp-paprika font-mono text-[0.55rem] font-bold leading-none text-cp-paper"
          >
            {unreadCount}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="end">
          <Popover.Popup className="origin-top w-[min(22rem,calc(100vw-1.5rem))] border border-cp-ink bg-cp-paper text-cp-ink shadow-[6px_6px_0_0_var(--color-cp-ink)] outline-none">
            <header className="flex items-center justify-between border-b border-cp-ink px-4 py-3">
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-paprika">
                § notifications
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
                    <NotificationRow item={n} />
                  </li>
                ))}
              </ul>
            )}

            <footer className="border-t border-cp-ink px-4 py-3">
              <button
                type="button"
                className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft transition-colors hover:text-cp-paprika"
              >
                Tout marquer comme lu →
              </button>
            </footer>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const content = (
    <div className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-cp-paper-deep/60">
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

  if (item.href) {
    return (
      <a
        href={item.href}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cp-paprika"
      >
        {content}
      </a>
    );
  }
  return content;
}
