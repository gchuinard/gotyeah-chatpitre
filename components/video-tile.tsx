"use client";

import type { RefObject } from "react";

/// Tuile vidéo bordée (grammaire flat Charley Harper) : un <video> en ratio
/// 16:9 avec le libellé du participant en surimpression, et un placeholder
/// optionnel (connexion, caméra coupée…). Le flux local est `muted` (anti-écho)
/// et `mirrored` (effet miroir naturel).
export function VideoTile({
  videoRef,
  label,
  muted = false,
  mirrored = false,
  placeholder = null,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  label: string;
  muted?: boolean;
  mirrored?: boolean;
  placeholder?: string | null;
}) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-md border border-cp-ink bg-cp-ink">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full bg-cp-ink object-cover ${mirrored ? "-scale-x-100" : ""}`}
      />
      {placeholder && (
        <div className="absolute inset-0 grid place-items-center bg-cp-ink px-6 text-center font-display text-lg italic leading-snug text-cp-paper/80">
          {placeholder}
        </div>
      )}
      <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-sm bg-cp-ink/70 px-2 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-cp-paper">
        {label}
      </span>
    </div>
  );
}
