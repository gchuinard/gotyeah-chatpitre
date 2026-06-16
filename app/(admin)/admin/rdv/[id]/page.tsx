import Link from "next/link";
import { notFound } from "next/navigation";

import { LibraryStamp } from "@/components/library-stamp";
import { VideoCall } from "@/components/video-call";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { formatDateTime, getAppointmentFor } from "@/lib/repository";

/// Page d'appel côté maison (admin) — in-chrome. L'admin est le pair
/// « initiateur » (émet l'offre dès que le client est présent).

export default async function AdminRdvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return null;

  const appointment = await getAppointmentFor(id, user.id, true);
  if (!appointment) notFound();

  const client = appointment.client;
  const backHref = appointment.bookingId
    ? `/admin/bookings/${appointment.bookingId}`
    : "/admin";

  return (
    <article className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
      <header className="space-y-4">
        <LibraryStamp boxed>Télé-rendez-vous</LibraryStamp>
        <h1 className="font-display text-4xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-5xl">
          {appointment.title ?? `Appel vidéo avec ${client.firstName}`}
        </h1>
        <p className="font-display text-xl italic leading-snug text-cp-ink-soft">
          {client.firstName} {client.lastName} · prévu le{" "}
          {formatDateTime(appointment.scheduledAt)} · {appointment.durationMin} min
        </p>
      </header>

      <div className="mt-10">
        <VideoCall
          appointmentId={appointment.id}
          selfRole="admin"
          selfName="La maison"
          peerName={client.firstName}
          backHref={backHref}
        />
      </div>

      <footer className="mt-12">
        <Link
          href={backHref}
          className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cp-ink-soft hover:text-cp-paprika"
        >
          ← Retour
        </Link>
      </footer>
    </article>
  );
}
