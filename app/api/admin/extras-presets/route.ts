import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { handle, json, parseJson, requireAdmin } from "@/lib/api";
import { extraPresetCreateSchema } from "@/lib/validations";

/// GET /api/admin/extras-presets — liste le catalogue de presets (admin).
export function GET() {
  return handle(async () => {
    await requireAdmin();
    const presets = await prisma.extraPreset.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return json({ presets });
  });
}

/// POST /api/admin/extras-presets — crée un préset. sortOrder par défaut
/// place le nouveau préset en fin de liste (max existant + 10).
export function POST(req: NextRequest) {
  return handle(async () => {
    await requireAdmin();
    const data = await parseJson(req, extraPresetCreateSchema);

    const sortOrder =
      data.sortOrder ??
      (await prisma.extraPreset.aggregate({ _max: { sortOrder: true } })).
        _max.sortOrder ??
      0;

    const preset = await prisma.extraPreset.create({
      data: {
        label: data.label,
        defaultAmount: new Prisma.Decimal(data.defaultAmount),
        sortOrder: data.sortOrder ?? sortOrder + 10,
      },
    });
    return json({ preset }, 201);
  });
}
