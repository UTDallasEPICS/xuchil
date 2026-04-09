import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ProcessStatus,
  MovementReason,
  MovementDirection,
  ItemType,
} from "@prisma/client";
import { idError, notFoundError, serverError } from "@/utils/responses";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const runId = parseInt((await context.params).id);
  if (isNaN(runId)) {
    return idError("process run");
  }

  let body: {
    goodOutputQty?: number;
    scrapQty?: number;
    outputUnitId?: number;
    notes?: string;
    wasPackaged?: boolean;
    packageType?: string | null;
    contentPerPackage?: number | null;
    packageContentUnitId?: number | null;
  } = {};
  try {
    body = await req.json();
  } catch {
    // body is optional for backward compat
  }

  try {
    const run = await prisma.processRun.findUnique({
      where: { id: runId },
      include: {
        stepExecutions: true,
        productVariant: {
          include: {
            contentUnit: true,
            defaultUnit: true,
          },
        },
      },
    });

    if (!run) {
      return notFoundError("process run");
    }

    const incompleteSteps = run.stepExecutions.some(
      (s) => s.status !== "DONE"
    );

    if (incompleteSteps) {
      return NextResponse.json(
        { error: "Cannot finalize; some steps are incomplete" },
        { status: 400 }
      );
    }

    const now = new Date();
    const variant = run.productVariant;
    const goodOutputQty = body.goodOutputQty ?? 0;
    const scrapQty = body.scrapQty ?? 0;
    const wasPackaged = Boolean(body.wasPackaged);
    const packageType = body.packageType?.trim() || null;
    const contentPerPackage =
      body.contentPerPackage != null && body.contentPerPackage > 0
        ? body.contentPerPackage
        : null;
    const packageContentUnitId =
      body.packageContentUnitId != null && body.packageContentUnitId > 0
        ? body.packageContentUnitId
        : null;
    const packageContentUnit = packageContentUnitId
      ? await prisma.unit.findUnique({ where: { id: packageContentUnitId }, select: { name: true, factorToBase: true } })
      : null;
    const packagingNote = wasPackaged
      ? `Empaque: ${packageType || "Sin tipo"}. Contenido por empaque: ${contentPerPackage ?? "No definido"} ${packageContentUnit?.name ?? ""}.`
      : "Empaque: No.";
    const mergedNotes = [body.notes?.trim(), packagingNote]
      .filter((entry): entry is string => Boolean(entry && entry.length > 0))
      .join("\n");

    // Use outputUnitId from body, or variant's contentUnitId, or variant's defaultUnitId
    const outputUnitId = body.outputUnitId ?? variant.contentUnitId ?? variant.defaultUnitId;

    // 1. Update the ProcessRun with results
    const finishedRun = await prisma.processRun.update({
      where: { id: runId },
      data: {
        status: ProcessStatus.COMPLETED,
        finishedAt: now,
        goodOutputQty: goodOutputQty,
        scrapQty: scrapQty,
        outputUnitId: outputUnitId,
        notes: mergedNotes || null,
      },
    });

    // 2. Find or create InventoryItem for this ProductVariant
    if (goodOutputQty > 0 && outputUnitId) {
      let inventoryItem = await prisma.inventoryItem.findFirst({
        where: {
          itemType: ItemType.PRODUCT,
          productVariantId: variant.id,
        },
      });

      if (!inventoryItem) {
        inventoryItem = await prisma.inventoryItem.create({
          data: {
            itemType: ItemType.PRODUCT,
            productVariantId: variant.id,
            defaultUnitId: outputUnitId,
          },
        });
      }

      // 3. Calculate quantity in package units if netContent is set
      let inventoryQty = goodOutputQty;
      let inventoryUnitId = outputUnitId;

      // If run was packaged and content was provided, convert to package count.
      // Fallback to variant.netContent for backward compatibility.
      const outputUnit = await prisma.unit.findUnique({
        where: { id: outputUnitId },
        select: { factorToBase: true },
      });

      const outputFactor = Number(outputUnit?.factorToBase ?? 1);
      const packageFactor = Number(packageContentUnit?.factorToBase ?? variant.contentUnit?.factorToBase ?? 1);

      const effectiveContentPerPackage = wasPackaged
        ? contentPerPackage ??
          (variant.netContent && Number(variant.netContent) > 0
            ? Number(variant.netContent)
            : null)
        : null;

      if (effectiveContentPerPackage) {
        const totalInBase = goodOutputQty * outputFactor;
        const packageSizeInBase = effectiveContentPerPackage * packageFactor;
        inventoryQty = packageSizeInBase > 0 ? Math.floor(totalInBase / packageSizeInBase) : 0;
        // Store in "pieces/units" — use the variant's default unit or keep same
        inventoryUnitId = variant.defaultUnitId ?? outputUnitId;
      }

      // 4. Create InventoryLot for this batch
      const lot = await prisma.inventoryLot.create({
        data: {
          inventoryItemId: inventoryItem.id,
          lotCode: run.batchCode,
          qtyOnHand: inventoryQty,
          unitId: inventoryUnitId,
          receivedAt: now,
        },
      });

      // 5. Create InventoryMovement record
      await prisma.inventoryMovement.create({
        data: {
          inventoryLotId: lot.id,
          direction: MovementDirection.IN,
          qty: inventoryQty,
          unitId: inventoryUnitId,
          reason: MovementReason.COMPLETION_RUN,
          relatedProcessRunId: runId,
          movedAt: now,
        },
      });
    }

    return NextResponse.json(finishedRun);
  } catch (error) {
    return serverError("process run", "finalize", error);
  }
}