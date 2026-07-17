import { z } from "zod";
import { differenceInCalendarDays } from "date-fns";

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

// --- Réservations -----------------------------------------------------------

export const bookingCreateSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    catIds: z.array(z.string().min(1)).min(1, "Sélectionnez au moins un chat."),
    clientNotes: z.string().trim().optional(),
    // Options choisies par le client à la demande. `extraPresetIds` : cases
    // cochées dans le catalogue (le serveur résout label + prix indicatif).
    // `customExtras` : demandes libres (texte), chiffrées ensuite par l'admin.
    // Le client n'envoie jamais de montant — il est posé serveur.
    extraPresetIds: z.array(z.string().min(1)).max(30).optional(),
    customExtras: z
      .array(z.string().trim().min(1).max(120))
      .max(10, "Pas plus de 10 demandes personnalisées.")
      .optional(),
    // Entretien préalable souhaité (visio ou tél) pour un point précis.
    interviewRequested: z.boolean().optional(),
    interviewChannel: z.enum(["VIDEO", "PHONE"]).optional(),
    interviewTopic: z.string().trim().max(500).optional(),
  })
  .refine((d) => differenceInCalendarDays(d.endDate, d.startDate) >= 1, {
    message: "Le séjour doit durer au moins une nuit.",
    path: ["endDate"],
  })
  .refine((d) => !d.interviewRequested || Boolean(d.interviewChannel), {
    message: "Choisissez le format de l'entretien (visio ou téléphone).",
    path: ["interviewChannel"],
  });

export const bookingMessageSchema = z.object({
  content: z.string().trim().min(1, "Le message ne peut pas être vide."),
});

/// Modification d'une demande par le client (tant qu'elle est en attente).
/// Dates, pensionnaires, note et entretien. Les suppléments ne sont pas
/// modifiables ici (le modèle ne relie pas une ligne à son preset d'origine).
export const bookingUpdateSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    catIds: z.array(z.string().min(1)).min(1, "Sélectionnez au moins un chat."),
    clientNotes: z.string().trim().optional(),
    interviewRequested: z.boolean().optional(),
    interviewChannel: z.enum(["VIDEO", "PHONE"]).optional(),
    interviewTopic: z.string().trim().max(500).optional(),
  })
  .refine((d) => differenceInCalendarDays(d.endDate, d.startDate) >= 1, {
    message: "Le séjour doit durer au moins une nuit.",
    path: ["endDate"],
  })
  .refine((d) => !d.interviewRequested || Boolean(d.interviewChannel), {
    message: "Choisissez le format de l'entretien (visio ou téléphone).",
    path: ["interviewChannel"],
  });

// --- Admin ------------------------------------------------------------------

/// Unité de facturation d'un supplément (cf. enum Prisma ExtraUnit).
export const extraUnitSchema = z.enum(["PER_DAY", "PER_VISIT", "FLAT"]);

/// Une ligne de supplément posée sur le devis : libellé, unité de facturation,
/// prix unitaire et quantité. Le total de ligne est dérivé serveur.
export const bookingExtraInputSchema = z.object({
  label: z.string().trim().min(1, "Le libellé d'un supplément est requis."),
  unit: extraUnitSchema.default("FLAT"),
  unitAmount: z.coerce
    .number()
    .nonnegative("Suppléments négatifs impossibles."),
  quantity: z.coerce
    .number()
    .int("La quantité doit être un entier.")
    .min(1, "La quantité doit être d'au moins 1.")
    .default(1),
});

export const adminBookingUpdateSchema = z.object({
  status: z
    .enum(["PENDING", "QUESTION_ASKED", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"])
    .optional(),
  adminNotes: z.string().trim().optional(),
  // Question posée au client : quand ce champ est fourni (avec
  // status=QUESTION_ASKED), le message est posté dans le fil et le client
  // reçoit une unique notification « question posée ».
  questionMessage: z.string().trim().min(1, "La question ne peut pas être vide.").optional(),
  // Devis posé par l'admin. totalAmount et depositAmount sont recalculés
  // côté serveur — pas acceptés depuis le client.
  pricePerFirstCat: z.coerce.number().nonnegative("Tarif négatif impossible.").optional(),
  pricePerExtraCat: z.coerce.number().nonnegative("Tarif négatif impossible.").optional(),
  depositPercentage: z.coerce
    .number()
    .int("L'acompte doit être un entier (pourcentage).")
    .min(0)
    .max(100)
    .optional(),
  // Montant réellement encaissé sur le séjour (saisi par l'admin), distinct du
  // total facturé. 0 = rien d'encaissé.
  paidAmount: z.coerce
    .number()
    .nonnegative("Montant encaissé négatif impossible.")
    .optional(),
  // Lignes de suppléments — quand le champ est fourni, il remplace
  // intégralement les lignes existantes (un array vide vide les suppléments).
  extras: z.array(bookingExtraInputSchema).optional(),
});

/// Avis de l'admin sur un chat d'un séjour (état + note libre).
export const catReviewSchema = z.object({
  reviewStatus: z.enum(["PENDING", "OK", "RESERVE", "REJECTED"]),
  reviewNote: z.string().trim().max(500).optional(),
});

// --- Catalogue de presets de suppléments (admin) ---------------------------

export const extraPresetCreateSchema = z.object({
  label: z.string().trim().min(1, "Le libellé est requis."),
  unit: extraUnitSchema.default("FLAT"),
  defaultAmount: z.coerce
    .number()
    .nonnegative("Le prix par défaut ne peut pas être négatif."),
  sortOrder: z.coerce.number().int().optional(),
});

export const extraPresetUpdateSchema = extraPresetCreateSchema.partial();

// --- Télé-rendez-vous (signaling WebRTC) -----------------------------------

/// Message de signaling échangé entre les deux pairs d'un appel.
/// `from` = id de connexion de l'émetteur (le serveur ne lui renvoie pas
/// l'écho). `kind` distingue offre / réponse / candidat ICE / raccrochage ;
/// `sdp` et `candidate` sont relayés tels quels à l'autre pair.
export const rdvSignalSchema = z.object({
  from: z.string().min(1).max(64),
  kind: z.enum(["offer", "answer", "ice", "bye", "chat"]),
  sdp: z.string().max(100_000).optional(),
  candidate: z.unknown().optional(),
  // Message de chat texte éphémère échangé pendant l'appel (kind: "chat").
  text: z.string().trim().min(1).max(2000).optional(),
});

/// Planification d'un télé-rendez-vous par l'admin (depuis un séjour). Le
/// créneau doit être dans le futur (tolérance d'une minute pour l'horloge).
export const appointmentCreateSchema = z.object({
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now() - 60_000, {
    message: "Le créneau doit être dans le futur.",
  }),
  durationMin: z.coerce
    .number()
    .int("La durée doit être un entier.")
    .min(5)
    .max(180)
    .default(30),
  title: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
});

// --- Documents des chats ----------------------------------------------------

/// Type d'un document — doit refléter EXACTEMENT l'enum Prisma DocumentType.
export const documentTypeSchema = z.enum([
  "VACCINATION",
  "IDENTIFICATION",
  "HEALTH_CERTIFICATE",
  "ANTIPARASITIC",
  "PRESCRIPTION",
  "PASSPORT",
  "STERILIZATION",
  "INSURANCE",
  "CARE_AUTHORIZATION",
  "DIET",
  "PHOTO",
  "OTHER",
]);

/// Métadonnées d'un upload de document (le fichier lui-même est validé à part :
/// taille + type MIME). Un libellé libre est requis pour le type « Autre ».
export const documentUploadMetaSchema = z
  .object({
    type: documentTypeSchema,
    customLabel: z.string().trim().min(1).max(120).optional(),
    documentDate: z.coerce.date().optional(),
  })
  .refine((d) => d.type !== "OTHER" || Boolean(d.customLabel), {
    message: "Un libellé est requis pour le type « Autre ».",
    path: ["customLabel"],
  });

// --- Compte client (admin) --------------------------------------------------

/// Note interne de la maison sur un client (éditée depuis la fiche client).
/// `null` efface la note.
export const clientAdminNotesSchema = z.object({
  adminNotes: z.string().trim().max(2000).nullable(),
});

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
