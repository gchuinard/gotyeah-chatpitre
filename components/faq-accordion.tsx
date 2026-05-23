"use client";

import { Accordion } from "@base-ui/react/accordion";

import { cn } from "@/lib/utils";

/// FAQ accordéon — Base UI Accordion, restylé brutalist editorial.
/// Chaque entrée a un numéro mono, un trigger Bodoni Moda gros, et
/// révèle un panel avec corps en Inter. Animations CSS pures.

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({
  items,
  className,
}: {
  items: FaqItem[];
  className?: string;
}) {
  return (
    <Accordion.Root
      className={cn("border-t border-cp-ink", className)}
    >
      {items.map((item, i) => {
        const index = String(i + 1).padStart(2, "0");
        return (
          <Accordion.Item
            key={item.question}
            className="border-b border-cp-ink"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-baseline gap-6 py-7 text-left transition-colors hover:bg-cp-paper-deep/60 focus-visible:bg-cp-paper-deep/60 focus-visible:outline-none sm:py-8">
                <span className="shrink-0 font-mono text-xs font-bold uppercase tracking-[0.22em] text-cp-paprika">
                  {index}
                </span>
                <span className="flex-1 font-display text-2xl font-medium leading-snug tracking-tight text-cp-ink sm:text-3xl">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className="ml-auto shrink-0 self-center font-display text-3xl leading-none text-cp-ink transition-transform duration-300 group-data-[panel-open]:rotate-45 sm:text-4xl"
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
              <div className="pb-8 pl-[3.5rem] pr-6">
                <p className="max-w-2xl font-body text-base leading-relaxed text-cp-ink">
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
