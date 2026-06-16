import { handle, json, requireUser } from "@/lib/api";
import { getIceServers } from "@/lib/turn";

// Renvoie des serveurs ICE (STUN + TURN Cloudflare) à courte durée de vie pour
// initialiser un RTCPeerConnection côté client. Réservé aux utilisateurs
// authentifiés ; l'usage TURN est tagué par l'id utilisateur.
export function GET() {
  return handle(async () => {
    const user = await requireUser();
    const iceServers = await getIceServers(user.id);
    return json({ iceServers });
  });
}
