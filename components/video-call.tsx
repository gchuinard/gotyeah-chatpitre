"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";

import { CallChat, type ChatMessage } from "@/components/call-chat";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { VideoTile } from "@/components/video-tile";
import type { SignalingEvent } from "@/lib/signaling";
import type { IceServer } from "@/lib/turn";

type Phase = "connecting" | "waiting" | "live" | "ended" | "error";

/// Îlot d'appel vidéo WebRTC 1:1. Récupère les serveurs ICE (STUN + TURN), ouvre
/// la caméra/le micro, établit la connexion pair-à-pair et échange le signaling
/// via SSE (réception) + POST (émission). L'admin est l'initiateur (émet l'offre)
/// dès qu'il détecte le client présent ; le client répond. 1:1 strict, donc pas
/// de glare possible (un seul côté émet l'offre).
export function VideoCall({
  appointmentId,
  selfRole,
  selfName,
  peerName,
  backHref,
}: {
  appointmentId: string;
  selfRole: "client" | "admin";
  selfName: string;
  peerName: string;
  backHref: string;
}) {
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const connectionIdRef = useRef<string>("");
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const [phase, setPhase] = useState<Phase>("connecting");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const isInitiator = selfRole === "admin";

  useEffect(() => {
    let active = true;

    async function postSignal(msg: {
      kind: string;
      sdp?: string;
      candidate?: RTCIceCandidateInit;
    }) {
      const from = connectionIdRef.current;
      if (!from) return;
      try {
        await fetch(`/api/rdv/${appointmentId}/signal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ from, ...msg }),
        });
      } catch {
        // réseau — l'autre pair re-signalera (trickle ICE)
      }
    }

    async function flushCandidates() {
      const pc = pcRef.current;
      if (!pc) return;
      const queued = pendingCandidatesRef.current;
      pendingCandidatesRef.current = [];
      for (const c of queued) {
        try {
          await pc.addIceCandidate(c);
        } catch {
          // candidat obsolète — ignoré
        }
      }
    }

    async function startOffer() {
      const pc = pcRef.current;
      if (!pc || pc.signalingState !== "stable") return;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await postSignal({ kind: "offer", sdp: offer.sdp });
      } catch {
        // négociation échouée — l'autre pair peut recharger
      }
    }

    async function handleSignal(ev: Extract<SignalingEvent, { type: "signal" }>) {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        if (ev.kind === "offer" && ev.sdp) {
          await pc.setRemoteDescription({ type: "offer", sdp: ev.sdp });
          await flushCandidates();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await postSignal({ kind: "answer", sdp: answer.sdp });
        } else if (ev.kind === "answer" && ev.sdp) {
          await pc.setRemoteDescription({ type: "answer", sdp: ev.sdp });
          await flushCandidates();
        } else if (ev.kind === "ice" && ev.candidate) {
          const candidate = ev.candidate as RTCIceCandidateInit;
          if (!pc.remoteDescription) pendingCandidatesRef.current.push(candidate);
          else await pc.addIceCandidate(candidate).catch(() => {});
        } else if (ev.kind === "bye") {
          if (active) setPhase("ended");
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        } else if (ev.kind === "chat" && ev.text) {
          const text = ev.text;
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), mine: false, text }]);
        }
      } catch {
        // message de signaling défaillant — ignoré
      }
    }

    async function setup() {
      // 1. Serveurs ICE (STUN + TURN Cloudflare).
      let iceServers: IceServer[] = [];
      try {
        const res = await fetch("/api/rdv/turn-credentials");
        if (res.ok) {
          const data: { iceServers?: IceServer[] } = await res.json();
          iceServers = data.iceServers ?? [];
        }
      } catch {
        // repli : RTCPeerConnection sans serveurs explicites
      }

      // 2. Caméra + micro.
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        if (active) {
          setErrorMsg(
            "Impossible d'accéder à la caméra ou au micro. Vérifiez les autorisations du navigateur, puis rechargez la page.",
          );
          setPhase("error");
        }
        return;
      }
      if (!active) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // 3. Connexion pair-à-pair.
      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) postSignal({ kind: "ice", candidate: e.candidate.toJSON() });
      };
      pc.onconnectionstatechange = () => {
        if (!active) return;
        const s = pc.connectionState;
        if (s === "connected") setPhase("live");
        else if (s === "failed" || s === "disconnected") setPhase("waiting");
      };

      if (active) setPhase("waiting");

      // 4. Canal de signaling (SSE).
      const es = new EventSource(`/api/rdv/${appointmentId}/events`);
      esRef.current = es;
      es.onmessage = (e) => {
        let data: SignalingEvent;
        try {
          data = JSON.parse(e.data) as SignalingEvent;
        } catch {
          return;
        }
        if (data.type === "ready") {
          connectionIdRef.current = data.connectionId;
          if (isInitiator && data.peers.length > 0) startOffer();
        } else if (data.type === "peer-joined") {
          if (isInitiator) startOffer();
        } else if (data.type === "peer-left") {
          if (active) setPhase("waiting");
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        } else if (data.type === "signal") {
          handleSignal(data);
        }
      };
    }

    setup();

    return () => {
      active = false;
      esRef.current?.close();
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [appointmentId, isInitiator]);

  function toggleMic() {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !micOn;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = next;
    });
    setMicOn(next);
  }

  function toggleCam() {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !camOn;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = next;
    });
    setCamOn(next);
  }

  function sendChat(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Affichage optimiste local, puis relais au pair via le canal de signaling.
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), mine: true, text: trimmed }]);
    const from = connectionIdRef.current;
    if (from) {
      fetch(`/api/rdv/${appointmentId}/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, kind: "chat", text: trimmed }),
      }).catch(() => {});
    }
  }

  function hangUp() {
    // Prévenir l'autre pair (keepalive : la requête survit à la navigation).
    const from = connectionIdRef.current;
    if (from) {
      fetch(`/api/rdv/${appointmentId}/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, kind: "bye" }),
        keepalive: true,
      }).catch(() => {});
    }
    router.push(backHref);
  }

  const STATUS: Record<Phase, { label: string; dot: string }> = {
    connecting: { label: "Initialisation…", dot: "bg-cp-cobalt" },
    waiting: { label: `En attente de ${peerName}`, dot: "bg-cp-canari" },
    live: { label: "En communication", dot: "bg-cp-feuille" },
    ended: { label: "Appel terminé", dot: "bg-cp-mute" },
    error: { label: "Erreur", dot: "bg-cp-paprika" },
  };

  const remotePlaceholder =
    phase === "live"
      ? null
      : phase === "connecting"
        ? "Connexion…"
        : phase === "ended"
          ? `${peerName} a quitté l'appel.`
          : `En attente de ${peerName}…`;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2.5">
        <span className={`inline-block size-2.5 rounded-full ${STATUS[phase].dot}`} />
        <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.18em] text-cp-ink-soft">
          {STATUS[phase].label}
        </span>
      </div>

      {phase === "error" ? (
        <div className="rounded-md border border-cp-paprika bg-cp-paprika-light p-6 font-body text-base leading-relaxed text-cp-ink sm:p-8">
          {errorMsg}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="relative self-start">
            <VideoTile
              videoRef={remoteVideoRef}
              label={peerName}
              placeholder={remotePlaceholder}
            />
            <div className="absolute bottom-3 right-3 w-1/3 max-w-[12rem] shadow-[4px_4px_0_0_var(--color-cp-ink)]">
              <VideoTile
                videoRef={localVideoRef}
                label={`${selfName} (vous)`}
                muted
                mirrored
                placeholder={camOn ? null : "Caméra coupée"}
              />
            </div>
          </div>
          <CallChat messages={messages} onSend={sendChat} peerName={peerName} />
        </div>
      )}

      <div className="sticky bottom-0 z-30 flex items-center justify-center gap-3 bg-cp-paper/95 py-3 backdrop-blur-sm sm:static sm:bg-transparent sm:py-0 sm:backdrop-blur-none">
        <Button
          type="button"
          variant={micOn ? "outline" : "secondary"}
          size="icon"
          onClick={toggleMic}
          disabled={phase === "error"}
          aria-label={micOn ? "Couper le micro" : "Activer le micro"}
        >
          {micOn ? <Mic /> : <MicOff />}
        </Button>
        <Button
          type="button"
          variant={camOn ? "outline" : "secondary"}
          size="icon"
          onClick={toggleCam}
          disabled={phase === "error"}
          aria-label={camOn ? "Couper la caméra" : "Activer la caméra"}
        >
          {camOn ? <Video /> : <VideoOff />}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => setConfirmOpen(true)}
          aria-label="Quitter l'appel"
        >
          <PhoneOff />
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Quitter l'appel ?"
        description="Vous quitterez la visioconférence. Vous pourrez la rejoindre à nouveau tant que le rendez-vous est ouvert."
        confirmLabel="Quitter"
        confirmVariant="destructive"
        onConfirm={hangUp}
      />
    </section>
  );
}
