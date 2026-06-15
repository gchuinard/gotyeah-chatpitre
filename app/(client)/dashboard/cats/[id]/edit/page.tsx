import Link from "next/link";
import { notFound } from "next/navigation";

import { CatForm } from "@/components/cat-form";
import { RuleDivider } from "@/components/rule-divider";
import { SectionHeading } from "@/components/section-heading";
import { getCurrentUser } from "@/lib/auth";
import { CAT_REVIEW_BADGE, CAT_REVIEW_LABEL } from "@/lib/cat-review";
import { prisma } from "@/lib/db";
import { displayRef, formatDate } from "@/lib/repository";

/// Édition d'une fiche pensionnaire — lecture Prisma, vérification que
/// le chat appartient bien à l'utilisateur courant. Le CatForm gère le
/// PATCH /api/cats/[id] au submit. On affiche aussi l'avis de la maison
/// sur ce chat pour chacun de ses séjours.
export default async function EditCatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const cat = await prisma.cat.findUnique({ where: { id } });
  if (!cat || cat.ownerId !== user.id) notFound();

  // Séjours de ce chat (du plus récent au plus ancien) avec l'avis de la maison.
  const links = await prisma.bookingCat.findMany({
    where: { catId: id, booking: { userId: user.id } },
    include: {
      booking: { select: { id: true, startDate: true, endDate: true } },
    },
    orderBy: { booking: { startDate: "desc" } },
  });

  const reviewSlot =
    links.length > 0 ? (
      <>
        <RuleDivider className="my-12" tone="cobalt" />
        <section className="space-y-6">
          <SectionHeading
            number="00"
            title="Avis de la maison"
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
                    <p className="font-body text-sm text-cp-ink-soft">
                      {link.reviewNote}
                    </p>
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
    ) : null;

  return (
    <CatForm
      mode="edit"
      reference={displayRef(cat.id)}
      reviewSlot={reviewSlot}
      defaultValues={{
        id: cat.id,
        name: cat.name,
        sex: cat.sex,
        breed: cat.breed ?? undefined,
        birthYear: cat.birthDate
          ? String(cat.birthDate.getFullYear())
          : undefined,
        notes: cat.personality ?? undefined,
        criteria: {
          sterilized: cat.isSterilized,
          identified: cat.isIdentified,
          vaccines: cat.vaccinesUpToDate,
          sociable: cat.isSociable,
        },
      }}
    />
  );
}
