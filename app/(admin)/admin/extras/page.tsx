import Link from "next/link";

import {
  ExtrasPresetsEditor,
  type ExtraPresetItem,
} from "@/components/extras-presets-editor";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { prisma } from "@/lib/db";

/// Catalogue éditable des presets de suppléments. Server page : lecture
/// Prisma + délégation au composant client ExtrasPresetsEditor pour les
/// actions (PATCH / POST / DELETE via les routes /api/admin/extras-presets).

export default async function AdminExtrasPage() {
  const presetsRaw = await prisma.extraPreset.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const presets: ExtraPresetItem[] = presetsRaw.map((p) => ({
    id: p.id,
    label: p.label,
    unit: p.unit,
    defaultAmount: Number(p.defaultAmount),
    sortOrder: p.sortOrder,
  }));

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-paprika">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Suppléments</span>
      </nav>

      <header className="space-y-4">
        <LibraryStamp boxed>
          Catalogue — {presets.length} préset{presets.length > 1 ? "s" : ""}
        </LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Suppléments
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          Le catalogue des suppléments disponibles dans le formulaire de
          devis. Libellés et prix par défaut éditables — chaque ligne d&apos;un
          devis déjà posé conserve le libellé et le prix d&apos;origine.
        </p>
      </header>

      <RuleDivider className="my-12" />

      <ExtrasPresetsEditor presets={presets} />

      <p className="mt-10 max-w-2xl font-body text-sm text-cp-ink-soft">
        Modifier un préset n&apos;altère pas les devis déjà posés : chaque
        ligne d&apos;un séjour est un snapshot figé au moment où elle a été
        ajoutée. Idem pour la suppression.
      </p>
    </div>
  );
}
