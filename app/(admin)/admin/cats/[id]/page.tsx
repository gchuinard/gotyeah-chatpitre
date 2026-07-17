import Link from "next/link";
import { notFound } from "next/navigation";

import { CatDocuments } from "@/components/cat-documents";
import { LibraryStamp } from "@/components/library-stamp";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { CAT_REVIEW_BADGE, CAT_REVIEW_LABEL } from "@/lib/cat-review";
import { prisma } from "@/lib/db";
import { ageLabel, displayRef, formatDate, getDocumentsForCat } from "@/lib/repository";

/// Fiche d'un pensionnaire côté maison (admin) : identité, propriétaire, avis
/// par séjour et documents (manageables par l'admin comme par le client).
export default async function AdminCatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return null;

  const cat = await prisma.cat.findUnique({ where: { id }, include: { owner: true } });
  if (!cat) notFound();

  const [links, documents] = await Promise.all([
    prisma.bookingCat.findMany({
      where: { catId: id },
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
    uploadedByLabel:
      d.uploadedById == null
        ? null
        : d.uploadedById === cat.ownerId
          ? cat.owner.firstName
          : "La maison",
    documentDate: d.documentDate ? d.documentDate.toISOString() : null,
  }));

  return (
    <article className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/admin" className="hover:text-cp-paprika">
          Administration
        </Link>
        <span aria-hidden>/</span>
        <Link href="/admin/clients" className="hover:text-cp-paprika">
          Clients
        </Link>
        <span aria-hidden>/</span>
        <span className="min-w-0 break-words text-cp-ink">{cat.name}</span>
      </nav>

      <header className="space-y-4">
        <LibraryStamp boxed>Fiche N°{displayRef(cat.id)}</LibraryStamp>
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink break-words sm:text-6xl">
          {cat.name}
        </h1>
        <p className="font-display text-xl italic leading-snug text-cp-ink-soft">
          {cat.breed ?? "sans race"} · {ageLabel(cat.birthDate)} — confié par{" "}
          {cat.owner.firstName} {cat.owner.lastName}
        </p>
      </header>

      {links.length > 0 && (
        <>
          <RuleDivider className="my-12" tone="cobalt" />
          <section className="space-y-6">
            <SectionHeading
              number="01"
              title="Avis de la maison"
              kicker="Le verdict sur ce chat, séjour par séjour."
              tone="cobalt"
            />
            <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink">
              {links.map((link) => (
                <li
                  key={link.booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 bg-cp-paper p-5"
                >
                  <Link
                    href={`/admin/bookings/${link.booking.id}`}
                    className="font-display text-lg italic text-cp-ink hover:text-cp-paprika"
                  >
                    Séjour du {formatDate(link.booking.startDate)} au{" "}
                    {formatDate(link.booking.endDate)}
                  </Link>
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
          kicker="Carnet de vaccination, identification, certificats… Partagés avec le client."
          tone="feuille"
        />
        <CatDocuments catId={cat.id} documents={docItems} />
      </section>

      <RuleDivider className="my-12" />
      <footer>
        <Link
          href="/admin/bookings"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Retour aux séjours
        </Link>
      </footer>
    </article>
  );
}
