import type { NextRequest } from "next/server";

import { apiError } from "@/lib/api";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { getAppointmentFor } from "@/lib/repository";
import { joinRoom, type SignalingEvent } from "@/lib/signaling";

// Flux SSE du canal de signaling d'un rdv. Runtime Node.js obligatoire (le bus
// pub/sub vit en mémoire du process) ; force-dynamic pour exclure tout cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const HEARTBEAT_MS = 20_000;

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  // Auth + contrôle d'accès AVANT d'ouvrir le flux : on ne s'appuie pas sur
  // cookies()/Prisma dans les callbacks du stream (contexte de requête non
  // garanti une fois la Response renvoyée).
  const user = await getCurrentUser();
  if (!user) return apiError("Authentification requise.", 401);
  const appointment = await getAppointmentFor(id, user.id, isAdmin(user));
  if (!appointment) return apiError("Rendez-vous introuvable.", 404);

  const role = isAdmin(user) ? "admin" : "client";
  const encoder = new TextEncoder();
  let leave: () => void = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: SignalingEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // flux déjà fermé — ignoré
        }
      };

      leave = joinRoom(id, { role, send }).leave;

      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          // ignoré
        }
      }, HEARTBEAT_MS);

      // Déconnexion du client → nettoyage (sinon fuite d'abonné + interval).
      req.signal.addEventListener("abort", () => {
        if (heartbeat) clearInterval(heartbeat);
        leave();
        try {
          controller.close();
        } catch {
          // ignoré
        }
      });
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      leave();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      // no-transform empêche la compression/altération par Cloudflare ;
      // X-Accel-Buffering désactive le buffering Nginx (Nginx Proxy Manager).
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
