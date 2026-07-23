import { notFound } from "next/navigation";

import { CatForm } from "@/components/cat-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { displayRef } from "@/lib/repository";

/// Édition d'une fiche pensionnaire — lecture Prisma, vérification que le chat
/// appartient bien à l'utilisateur courant. Le CatForm gère le PATCH
/// /api/cats/[id] au submit. Les avis de la maison et les documents vivent sur
/// la fiche (page de détail), pas sur le formulaire d'édition.
export default async function EditCatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const cat = await prisma.cat.findUnique({ where: { id } });
  if (!cat || cat.ownerId !== user.id) notFound();

  return (
    <CatForm
      mode="edit"
      reference={displayRef(cat.id)}
      defaultValues={{
        id: cat.id,
        name: cat.name,
        sex: cat.sex,
        breed: cat.breed ?? undefined,
        birthYear: cat.birthDate ? String(cat.birthDate.getFullYear()) : undefined,
        notes: cat.personality ?? undefined,
        avatarKey: cat.avatarKey,
        criteria: {
          sterilized: cat.isSterilized,
          identified: cat.isIdentified,
          vaccines: cat.vaccinesUpToDate,
          sociable: cat.isSociable,
        },
      }}
    />
  );
}
