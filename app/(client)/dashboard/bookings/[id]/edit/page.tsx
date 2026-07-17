import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EditBookingForm } from "@/components/edit-booking-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { displayRef } from "@/lib/repository";

/// Édition d'une demande de séjour en attente. Réservé au propriétaire ; si la
/// demande n'est plus modifiable (déjà traitée), on renvoie vers le détail.

/// La date de séjour est stockée en minuit UTC : on en extrait « yyyy-mm-dd »
/// pour pré-remplir le calendrier sans décalage de fuseau.
function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { cats: { select: { catId: true } } },
  });
  if (!booking || booking.userId !== user.id) notFound();
  if (!["PENDING", "QUESTION_ASKED"].includes(booking.status)) {
    redirect(`/dashboard/bookings/${id}`);
  }

  const cats = await prisma.cat.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "asc" },
  });

  const ref = displayRef(booking.id);

  return (
    <article className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
      <nav
        aria-label="Fil d'Ariane"
        className="mb-10 flex items-center gap-2 font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft"
      >
        <Link href="/dashboard" className="hover:text-cp-paprika">
          Mon espace
        </Link>
        <span aria-hidden>/</span>
        <Link href="/dashboard/bookings" className="hover:text-cp-paprika">
          Séjours
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/dashboard/bookings/${booking.id}`}
          className="hover:text-cp-paprika"
        >
          N° {ref}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-cp-ink">Modifier</span>
      </nav>

      <header className="mb-12 space-y-4">
        <h1 className="font-display text-5xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-6xl">
          Modifier la demande
        </h1>
        <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
          Ajustez les dates, les pensionnaires ou la note. Tant que la demande
          est en attente, tout reste modifiable.
        </p>
      </header>

      <EditBookingForm
        bookingId={booking.id}
        cats={cats}
        initialCatIds={booking.cats.map((c) => c.catId)}
        initialStart={toIsoDate(booking.startDate)}
        initialEnd={toIsoDate(booking.endDate)}
        initialNotes={booking.clientNotes}
        initialInterview={{
          requested: booking.interviewRequested,
          channel: booking.interviewChannel,
          topic: booking.interviewTopic,
        }}
      />
    </article>
  );
}
