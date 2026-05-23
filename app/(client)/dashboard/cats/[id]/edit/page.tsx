import { notFound } from "next/navigation";

import { CatForm } from "@/components/cat-form";
import { getCat } from "@/lib/fixtures";

/// Édition d'une fiche existante. Params en Promise (convention Next 16).
/// Le formulaire est pré-rempli depuis les fixtures ; le « Mettre à jour »
/// renvoie pour l'instant à la liste (pas de câblage Prisma).
export default async function EditCatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cat = getCat(id);
  if (!cat) notFound();

  return (
    <CatForm
      mode="edit"
      reference={cat.reference}
      defaultValues={{
        name: cat.name,
        sex: cat.sex,
        breed: cat.breed ?? undefined,
        // L'année est dérivable de l'âge en maquette : reste vide
        // tant que le champ birthdate n'est pas câblé.
        criteria: cat.criteria,
      }}
    />
  );
}
