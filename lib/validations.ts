import { z } from "zod";

// Schémas de validation Zod des entrées des routes API.

// --- Authentification -------------------------------------------------------

export const signupSchema = z.object({
  email: z.email("Email invalide."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
  firstName: z.string().trim().min(1, "Le prénom est requis."),
  lastName: z.string().trim().min(1, "Le nom est requis."),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  city: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.email("Email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

// --- Chats ------------------------------------------------------------------

export const catCreateSchema = z.object({
  name: z.string().trim().min(1, "Le nom du chat est requis."),
  sex: z.enum(["MALE", "FEMALE"]),
  birthDate: z.coerce.date().optional(),
  breed: z.string().trim().optional(),
  color: z.string().trim().optional(),
  weight: z.number().positive("Le poids doit être positif.").optional(),
  photoUrl: z.string().trim().optional(),
  personality: z.string().trim().optional(),
  isSterilized: z.boolean().optional(),
  isIdentified: z.boolean().optional(),
  vaccinesUpToDate: z.boolean().optional(),
  isSociable: z.boolean().optional(),
  vetName: z.string().trim().optional(),
  vetClinic: z.string().trim().optional(),
  vetPhone: z.string().trim().optional(),
  vetAddress: z.string().trim().optional(),
  allergies: z.string().trim().optional(),
  currentTreatments: z.string().trim().optional(),
  medicalNotes: z.string().trim().optional(),
  specialDiet: z.string().trim().optional(),
});

/// Mise à jour d'un chat : tous les champs deviennent facultatifs.
export const catUpdateSchema = catCreateSchema.partial();

// --- Utilitaire -------------------------------------------------------------

/// Transforme une ZodError en un objet plat { champ: message } facile à
/// renvoyer au client.
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
