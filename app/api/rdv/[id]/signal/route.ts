import type { NextRequest } from "next/server";

import { handle, HttpError, json, parseJson, requireUser } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { getAppointmentFor } from "@/lib/repository";
import { publishSignal } from "@/lib/signaling";
import { rdvSignalSchema } from "@/lib/validations";

// Publication d'un message de signaling (offre / réponse / candidat ICE) vers
// l'autre pair du rdv. Réservé au client concerné et à l'admin.
type RouteContext = { params: Promise<{ id: string }> };

export function POST(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    const { id } = await params;
    const user = await requireUser();
    const appointment = await getAppointmentFor(id, user.id, isAdmin(user));
    if (!appointment) throw new HttpError(404, "Rendez-vous introuvable.");

    const { from, ...message } = await parseJson(req, rdvSignalSchema);
    publishSignal(id, from, message);
    return json({ ok: true }, 202);
  });
}
