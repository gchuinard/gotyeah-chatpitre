import Link from "next/link";
import { notFound } from "next/navigation";

import { LibraryStamp } from "@/components/library-stamp";
import { RdvDocumentButton } from "@/components/rdv-document-button";
import { VideoCall } from "@/components/video-call";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import {
  formatDateTime,
  getAppointmentFor,
  getCatsForBookingOrOwner,
} from "@/lib/repository";

/// Page d'appel côté client — in-chrome (hérite du header + de l'auth-gate du
/// layout). Le client est le pair « répondeur » (l'admin émet l'offre).

export default async function ClientRdvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const appointment = await getAppointmentFor(id, user.id, isAdmin(user));
  if (!appointment) notFound();

  const cats = await getCatsForBookingOrOwner(appointment.bookingId, appointment.clientId);
  const backHref = appointment.bookingId
    ? `/dashboard/bookings/${appointment.bookingId}`
    : "/dashboard";

  return (
    <article className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
      <header className="space-y-4">
        <LibraryStamp boxed>Télé-rendez-vous</LibraryStamp>
        <h1 className="font-display text-4xl font-medium leading-[0.95] tracking-[-0.01em] text-cp-ink sm:text-5xl">
          {appointment.title ?? "Appel vidéo avec nous"}
        </h1>
        <p className="font-display text-xl italic leading-snug text-cp-ink-soft">
          Prévu le {formatDateTime(appointment.scheduledAt)} · {appointment.durationMin} min
        </p>
      </header>

      <div className="mt-6">
        <RdvDocumentButton cats={cats} />
      </div>

      <div className="mt-10">
        <VideoCall
          appointmentId={appointment.id}
          selfRole="client"
          selfName={user.firstName}
          peerName="Le Chat-Pitre"
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
