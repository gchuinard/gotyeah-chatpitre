import type {
  CatIllustrationPose,
  CatIllustrationVariant,
} from "@/components/cat-illustration";

/// Avatar choisi par le propriétaire pour son chat.
///
/// Rien de nouveau n'est dessiné : le projet possède déjà seize illustrations,
/// quatre couleurs par quatre poses, utilisées jusqu'ici en tirage aléatoire.
/// Cette carte ne fait que rendre ce choix explicite. Inventer un second jeu de
/// dessins aurait donné deux styles de chats dans la même application.
///
/// La clé stockée est « couleur/pose », par exemple « cobalt/sitting ». Une
/// CLÉ et non un chemin de fichier : renommer ou réorganiser les illustrations
/// ne doit pas invalider ce qui est déjà en base.

export const AVATAR_VARIANTS: CatIllustrationVariant[] = [
  "cobalt",
  "paprika",
  "canari",
  "feuille",
];

export const AVATAR_POSES: CatIllustrationPose[] = [
  "sitting",
  "sleeping",
  "standing",
  "watching",
];

export const VARIANT_LABEL: Record<CatIllustrationVariant, string> = {
  cobalt: "Bleu",
  paprika: "Orange",
  canari: "Jaune",
  feuille: "Vert",
};

export const POSE_LABEL: Record<CatIllustrationPose, string> = {
  sitting: "assis",
  sleeping: "endormi",
  standing: "debout",
  watching: "aux aguets",
};

export type Avatar = {
  variant: CatIllustrationVariant;
  pose: CatIllustrationPose;
};

/// Les seize combinaisons, dans un ordre stable.
export const AVATARS: Avatar[] = AVATAR_VARIANTS.flatMap((variant) =>
  AVATAR_POSES.map((pose) => ({ variant, pose })),
);

export function avatarKey(a: Avatar): string {
  return `${a.variant}/${a.pose}`;
}

/// Nom lisible par un lecteur d'écran : « Chat vert, endormi ».
export function avatarLabel(a: Avatar): string {
  return `Chat ${VARIANT_LABEL[a.variant].toLowerCase()}, ${POSE_LABEL[a.pose]}`;
}

/// Relit une clé stockée, en refusant tout ce qui n'appartient pas au jeu.
///
/// Le contrôle est indispensable : la clé vient de la base, donc d'une requête
/// utilisateur. Une valeur libre qui traverserait jusqu'au rendu ouvrirait la
/// porte à autre chose qu'un nom de couleur.
export function parseAvatarKey(key: string | null | undefined): Avatar | null {
  if (!key) return null;
  const [variant, pose] = key.split("/");
  const okVariant = AVATAR_VARIANTS.find((v) => v === variant);
  const okPose = AVATAR_POSES.find((p) => p === pose);
  if (!okVariant || !okPose) return null;
  return { variant: okVariant, pose: okPose };
}
