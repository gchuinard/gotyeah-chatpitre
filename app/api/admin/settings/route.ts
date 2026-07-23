import type { NextRequest } from "next/server";
import { z } from "zod";

import { handle, HttpError, json, parseJson, requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/db";
import { SETTINGS, validateSetting, type SettingKey } from "@/lib/settings";

const KEYS = SETTINGS.map((s) => s.key);

/// Toutes les clés sont facultatives : l'écran n'envoie que ce qui a changé.
const settingsSchema = z.record(z.string(), z.string());

/// PATCH /api/admin/settings — enregistre un ou plusieurs réglages.
///
/// La validation s'appuie sur le registre de lib/settings.ts et non sur un
/// schéma écrit ici : dupliquer les règles garantirait qu'elles divergent le
/// jour où une clé s'ajoute.
export function PATCH(req: NextRequest) {
  return handle(async () => {
    await requireAdmin();

    const body = await parseJson(req, settingsSchema);
    const entries = Object.entries(body);
    if (entries.length === 0) {
      throw new HttpError(400, "Aucun réglage à enregistrer.");
    }

    // On valide TOUT avant d'écrire QUOI QUE CE SOIT. Sans ce premier passage,
    // une valeur fautive en milieu de liste laisserait la moitié des réglages
    // enregistrés et l'autre non, sans que l'écran puisse le dire.
    const fields: Record<string, string> = {};
    for (const [key, value] of entries) {
      if (!KEYS.includes(key as SettingKey)) {
        throw new HttpError(400, `Réglage inconnu : ${key}`);
      }
      const problem = validateSetting(key as SettingKey, value);
      if (problem) fields[key] = problem;
    }
    if (Object.keys(fields).length > 0) {
      // Réponse construite ici plutôt que levée en HttpError : celui-ci ne
      // porte qu'un message, et l'écran a besoin de savoir QUEL champ est
      // fautif pour le signaler au bon endroit. C'est la même forme que celle
      // produite par une erreur de schéma, { error, fields }.
      return json({ error: "Données invalides.", fields }, 400);
    }

    // Une transaction : les tarifs se lisent ensemble, et une base laissée à
    // mi-chemin chiffrerait les séjours avec un prix neuf et un acompte ancien.
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          create: { key, value: value.trim() },
          update: { value: value.trim() },
        }),
      ),
    );

    return json({ saved: entries.length });
  });
}
