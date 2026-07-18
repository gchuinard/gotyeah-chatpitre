"use client";

import { Accordion } from "@base-ui/react/accordion";

import { cn } from "@/lib/utils";

/// FAQ accordéon — Base UI Accordion, restylé Charley Harper. Chaque
/// entrée a un numéro mono paprika, un trigger Newsreader gros, et
/// révèle un panel avec corps Manrope.

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({
  items,
  className,
  startIndex = 0,
}: {
  items: FaqItem[];
  className?: string;
  /** Décalage de numérotation, pour garder une suite continue quand la FAQ
      est scindée en deux colonnes. */
  startIndex?: number;
}) {
  return (
    <Accordion.Root
      className={cn("border-t border-cp-ink", className)}
    >
      {items.map((item, i) => {
        const index = String(startIndex + i + 1).padStart(2, "0");
        return (
          <Accordion.Item
            key={item.question}
            className="border-b border-cp-ink"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-baseline gap-4 py-5 text-left transition-colors hover:bg-cp-paper-deep/60 focus-visible:bg-cp-paper-deep/60 focus-visible:outline-none sm:py-6">
                <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-[0.18em] text-cp-paprika">
                  {index}
                </span>
                <span className="flex-1 font-display text-lg font-medium leading-snug text-cp-ink sm:text-xl">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className="ml-auto shrink-0 self-center font-display text-2xl leading-none text-cp-paprika transition-transform duration-300 group-data-[panel-open]:rotate-45 sm:text-3xl"
                >
                  +
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel
              hiddenUntilFound
              className="overflow-hidden transition-[height] duration-300 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 [&[hidden]]:hidden"
              style={{ height: "var(--accordion-panel-height)" }}
            >
              <div className="pb-6 pl-[3rem] pr-4">
                <p className="max-w-2xl font-body text-sm leading-relaxed text-cp-ink">
                  {item.answer}
                </p>
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
