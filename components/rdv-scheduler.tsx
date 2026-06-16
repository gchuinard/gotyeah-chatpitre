"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";

import { Field } from "@/components/field";
import { RdvJoinButton } from "@/components/rdv-join-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/format";

export type AppointmentItem = {
  id: string;
  scheduledAt: string; // ISO
  durationMin: number;
  status: AppointmentStatus;
  title: string | null;
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  SCHEDULED: "Planifié",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
};

const STATUS_TONE: Record<AppointmentStatus, string> = {
  SCHEDULED: "text-cp-cobalt",
  COMPLETED: "text-cp-feuille",
  CANCELLED: "text-cp-mute",
};

const DURATIONS = [15, 30, 45, 60];

const SELECT_CLASS =
  "h-11 w-full min-w-0 rounded-md border border-cp-ink bg-cp-paper px-3 font-body text-base text-cp-ink transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cp-paprika";

/// Planificateur de télé-rendez-vous (admin) : liste les rdv du séjour et pose
/// un nouveau créneau (POST /api/admin/bookings/[id]/appointments). Le client
/// est notifié et rejoint l'appel depuis son espace.
export function RdvScheduler({
  bookingId,
  appointments,
}: {
  bookingId: string;
  appointments: AppointmentItem[];
}) {
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMin, setDurationMin] = useState(30);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function schedule() {
    setError(null);
    if (!scheduledAt) {
      setError("Choisissez une date et une heure.");
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/bookings/${bookingId}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: new Date(scheduledAt).toISOString(),
          durationMin,
          title: title.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data: { error?: string } = await res.json().catch(() => ({}));
        setError(data.error ?? "Échec de la planification.");
        return;
      }
      setScheduledAt("");
      setTitle("");
      setDurationMin(30);
      router.refresh();
    });
  }

  return (
    <section className="space-y-6">
      <p className="max-w-2xl font-display text-xl italic leading-snug text-cp-ink-soft">
        Planifiez un appel vidéo avec le client. Il reçoit une notification et
        rejoint l&apos;appel depuis son espace, à l&apos;heure dite.
      </p>

      {appointments.length > 0 && (
        <ul className="grid gap-px overflow-hidden rounded-md border border-cp-ink bg-cp-ink">
          {appointments.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 bg-cp-paper p-4"
            >
              <div>
                <p className="font-display text-lg italic leading-tight text-cp-ink">
                  {formatDateTime(new Date(a.scheduledAt))}
                </p>
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-cp-ink-soft">
                  {a.durationMin} min{a.title ? ` · ${a.title}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] ${STATUS_TONE[a.status]}`}
                >
                  {STATUS_LABEL[a.status]}
                </span>
                {a.status === "SCHEDULED" && (
                  <RdvJoinButton
                    href={`/admin/rdv/${a.id}`}
                    scheduledAt={a.scheduledAt}
                    durationMin={a.durationMin}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-4 rounded-md border border-cp-ink bg-cp-paper p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Date et heure" htmlFor="rdv-when" required>
          <Input
            id="rdv-when"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </Field>
        <Field label="Durée" htmlFor="rdv-duration">
          <select
            id="rdv-duration"
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            className={SELECT_CLASS}
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} minutes
              </option>
            ))}
          </select>
        </Field>
        <Field label="Motif (optionnel)" htmlFor="rdv-title" className="sm:col-span-2">
          <Input
            id="rdv-title"
            type="text"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex. : visite de pré-admission, point sur le séjour…"
          />
        </Field>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="button" onClick={schedule} disabled={pending}>
            {pending ? "Planification…" : "Planifier le rendez-vous"}
          </Button>
          {error && <span className="font-body text-xs text-cp-paprika">{error}</span>}
        </div>
      </div>
    </section>
  );
}
