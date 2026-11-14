import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ProcessStatus, ReservationStatus } from "@prisma/client";
import { reserveMaterialsSchema } from "@/lib/schemas";
import { idError, notFoundError, serverError, validationError } from "@/utils/responses";
import { getRawMaterialAvailability, EPS } from "@/lib/availability";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const runId = parseInt((await context.params).id);
  if (isNaN(runId)) {
    return idError("process run");
  }

  try {
    const body = await req.json();
    const result = reserveMaterialsSchema.safeParse(body);
    if (!result.success) {
      return validationError("material reservation", result.error);
    }
    const { items } = result.data;

    const run = await prisma.processRun.findUnique({
      where: { id: runId },
      select: { id: true, status: true },
    });
    if (!run) {
      return notFoundError("process run");
    }
    if (run.status !== ProcessStatus.PLANNED) {
      return NextResponse.json(
        { error: "Solo se puede apartar materia prima antes de iniciar el proceso." },
        { status: 400 }
      );
    }

    // Factor map to normalize requested quantities to base units.
    const units = await prisma.unit.findMany({
      select: { id: true, factorToBase: true },
    });
    const factorByUnit = new Map<number, number>(
      units.map((u) => [u.id, Number(u.factorToBase)])
    );

    // Aggregate requested quantity per raw material (in base units).
    const requestedBaseByMaterial = new Map<number, number>();
    for (const item of items) {
      const factor = factorByUnit.get(item.unitId) ?? 1;
      const prev = requestedBaseByMaterial.get(item.rawMaterialId) ?? 0;
      requestedBaseByMaterial.set(item.rawMaterialId, prev + item.qty * factor);
    }

    const materialIds = Array.from(requestedBaseByMaterial.keys());
    const availability = await getRawMaterialAvailability(materialIds);

    const insufficient: Array<{
      rawMaterialId: number;
      name: string;
      requestedBase: number;
      availableBase: number;
    }> = [];
    for (const [rawMaterialId, requestedBase] of requestedBaseByMaterial) {
      const info = availability.get(rawMaterialId);
      const availableBase = info?.availableBase ?? 0;
      if (requestedBase > availableBase + EPS) {
        insufficient.push({
          rawMaterialId,
          name: info?.name ?? `Materia prima ${rawMaterialId}`,
          requestedBase,
          availableBase,
        });
      }
    }

    if (insufficient.length > 0) {
      return NextResponse.json(
        { error: "No hay suficiente materia prima disponible.", insufficient },
        { status: 409 }
      );
    }

    const reservations = await prisma.$transaction(
      items.map((item) =>
        prisma.materialReservation.create({
          data: {
            processRunId: runId,
            templateStepId: item.templateStepId,
            rawMaterialId: item.rawMaterialId,
            qty: item.qty,
            unitId: item.unitId,
            status: ReservationStatus.RESERVED,
          },
        })
      )
    );

    return NextResponse.json(reservations, { status: 201 });
  } catch (error) {
    return serverError("material reservation", "create", error);
  }
}
