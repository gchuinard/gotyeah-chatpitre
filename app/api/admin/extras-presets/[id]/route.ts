import type { NextRequest } from "next/server";
import type { Prisma as PrismaTypes } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { handle, HttpError, json, parseJson, requireAdmin } from "@/lib/api";
import { extraPresetUpdateSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

/// PATCH /api/admin/extras-presets/[id] — édite un préset (label, prix par
/// défaut, ordre d'affichage). Une modification n'altère PAS les
/// BookingExtra déjà posés (snapshot label+amount).
export function PATCH(req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    const data = await parseJson(req, extraPresetUpdateSchema);

    const updateData: PrismaTypes.ExtraPresetUpdateInput = {};
    if (data.label !== undefined) updateData.label = data.label;
    if (data.defaultAmount !== undefined) {
      updateData.defaultAmount = new Prisma.Decimal(data.defaultAmount);
    }
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    try {
      const preset = await prisma.extraPreset.update({
        where: { id },
        data: updateData,
      });
      return json({ preset });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new HttpError(404, "Préset introuvable.");
      }
      throw err;
    }
  });
}

/// DELETE /api/admin/extras-presets/[id] — supprime un préset du catalogue.
/// Les BookingExtra existants ne sont pas affectés.
export function DELETE(_req: NextRequest, { params }: RouteContext) {
  return handle(async () => {
    await requireAdmin();
    const { id } = await params;
    try {
      await prisma.extraPreset.delete({ where: { id } });
      return json({ ok: true });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2025"
      ) {
        throw new HttpError(404, "Préset introuvable.");
      }
      throw err;
    }
  });
}
