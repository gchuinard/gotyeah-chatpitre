import Link from "next/link";
import { notFound } from "next/navigation";

import { CatDeleteControl } from "@/components/cat-delete-control";
import { CatDocuments } from "@/components/cat-documents";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { CAT_REVIEW_BADGE, CAT_REVIEW_LABEL } from "@/lib/cat-review";
import { prisma } from "@/lib/db";
import {
  ageLabel,
  displayRef,
  formatDate,
  getDocumentsForCat,
} from "@/lib/repository";

/// Fiche d'un pensionnaire côté client (lecture) : identité, avis de la maison
/// par séjour, et documents (carnet de vaccination…). L'édition se fait via le
/// bouton « Éditer ».
export default async function CatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const cat = await prisma.cat.findUnique({ where: { id } });
  if (!cat || cat.ownerId !== user.id) notFound();

  // Compté SANS filtrer sur le propriétaire, contrairement à `links` : c'est
  // exactement le critère qu'applique la route de suppression, et les deux
  // doivent dire la même chose sous peine de proposer un bouton qui échoue.
  const [stayCount, links, documents] = await Promise.all([
    prisma.bookingCat.count({ where: { catId: id } }),
    prisma.bookingCat.findMany({
      where: { catId: id, booking: { userId: user.id } },
      include: { booking: { select: { id: true, startDate: true, endDate: true } } },
      orderBy: { booking: { startDate: "desc" } },
    }),
    getDocumentsForCat(id),
  ]);

  const docItems = documents.map((d) => ({
    id: d.id,
    type: d.type,
    customLabel: d.customLabel,
    originalName: d.originalName,
    mimeType: d.mimeType,
    sizeBytes: d.sizeBytes,
    uploadedByLabel: d.uploadedById === user.id ? "Vous" : "Nous",
    documentDate: d.documentDate ? d.documentDate.toISOString() : null,
    reviewStatus: d.reviewStatus,
  }));

  const criteria = [
    { ok: cat.isSterilized, label: "Stérilisé" },
    { ok: cat.isIdentified, label: "Identifié" },
    { ok: cat.vaccinesUpToDate, label: "Vaccins à jour" },
    { ok: cat.isSociable, label: "Sociable" },
  ];

  return (
    <article className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/dashboard" className="hover:text-cp-paprika">
          Mon espace
        </Link>
        <span aria-hidden>/</span>
        <Link href="/dashboard" className="hover:text-cp-paprika">
          Pensionnaires
        </Link>
        <span aria-hidden>/</span>
        <span className="min-w-0 break-words text-cp-ink">{cat.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-4">
          <LibraryStamp boxed>Fiche N°{displayRef(cat.id)}</LibraryStamp>
          <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink break-words sm:text-6xl">
            {cat.name}
          </h1>
          <p className="font-display text-xl italic leading-snug text-cp-ink-soft">
            {cat.breed ?? "sans race"} · {ageLabel(cat.birthDate)}
          </p>
        </div>
        <Link
          href={`/dashboard/cats/${cat.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Éditer la fiche
        </Link>
      </header>

      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.14em] sm:grid-cols-4">
        {criteria.map((c) => (
          <li
            key={c.label}
            className={`flex items-center gap-1.5 ${c.ok ? "text-cp-ink" : "text-cp-paprika"}`}
          >
            <span aria-hidden className="inline-block w-3 text-center">
              {c.ok ? "✓" : "—"}
            </span>
            <span className={c.ok ? "" : "line-through decoration-[1.5px]"}>{c.label}</span>
          </li>
        ))}
      </ul>

      {cat.personality && (
        <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-cp-ink-soft">
          {cat.personality}
        </p>
      )}

      {links.length > 0 && (
        <>
          <RuleDivider className="my-12" tone="cobalt" />
          <section className="space-y-6">
            <SectionHeading
              number="01"
              title="Notre avis"
              kicker="Le verdict de la pension sur ce chat, séjour par séjour."
              tone="cobalt"
            />
            <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink">
              {links.map((link) => (
                <li
                  key={link.booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-cp-paper p-5"
                >
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/dashboard/bookings/${link.booking.id}`}
                      className="font-display text-lg italic text-cp-ink hover:text-cp-paprika"
                    >
                      Séjour du {formatDate(link.booking.startDate)} au{" "}
                      {formatDate(link.booking.endDate)}
                    </Link>
                    {link.reviewNote && (
                      <p className="font-body text-sm text-cp-ink-soft">{link.reviewNote}</p>
                    )}
                  </div>
                  {link.reviewStatus === "PENDING" ? (
                    <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-mute">
                      En cours d&apos;évaluation
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-0.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] ${CAT_REVIEW_BADGE[link.reviewStatus]}`}
                    >
                      {CAT_REVIEW_LABEL[link.reviewStatus]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <RuleDivider className="my-12" label="Documents" tone="feuille" />
      <section className="space-y-6">
        <SectionHeading
          number={links.length > 0 ? "02" : "01"}
          title="Documents"
          kicker="Carnet de vaccination, identification, certificats… Visibles par vous et nous."
          tone="feuille"
        />
        <CatDocuments catId={cat.id} documents={docItems} />
      </section>

      {/* En pied de page, discrètement : c'est un geste rare et sans retour.
          Le contrôle disparaît de lui-même dès que le chat a séjourné. */}
      <footer className="mt-16 border-t border-cp-ink/30 pt-6">
        <CatDeleteControl
          catId={cat.id}
          catName={cat.name}
          hasStayed={stayCount > 0}
        />
      </footer>
    </article>
  );
}
