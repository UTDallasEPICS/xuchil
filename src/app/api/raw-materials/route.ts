import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { rawMaterialSchema } from "@/lib/schemas";
import { z } from "zod";
import { serverError, validationError } from "@/utils/responses";
import { verifySession } from "@/lib/session";
import {
  ItemType,
  MovementDirection,
  MovementReason,
} from "@prisma/client";

const rawMaterialWithStockSchema = rawMaterialSchema.extend({
  initialStock: z.number().nonnegative().optional(),
  lotCode: z.string().optional(),
  receivedAt: z.string().optional(),
});

export async function GET() {
  try {
    const rawMaterials = await prisma.rawMaterial.findMany({
      where: { isActive: true },
      include: { defaultUnit: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(rawMaterials);
  } catch (error) {
    return serverError("raw materials", "fetch", error);
  }
}

export async function POST(request: NextRequest) {
  const payload = await verifySession();

  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  const body = await request.json();
  const result = rawMaterialWithStockSchema.safeParse(body);

  if (!result.success) {
    return validationError("raw material", result.error);
  }

  const {
    initialStock = 0,
    lotCode,
    receivedAt,
    ...rawMaterialData
  } = result.data;

  try {
    const rawMaterial = await prisma.rawMaterial.create({
      data: rawMaterialData,
    });

    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        itemType: ItemType.RAW,
        rawMaterialId: rawMaterial.id,
        defaultUnitId: rawMaterial.defaultUnitId,
      },
    });

    if (initialStock > 0 && rawMaterial.defaultUnitId) {
      const lot = await prisma.inventoryLot.create({
        data: {
          inventoryItemId: inventoryItem.id,
          lotCode: lotCode || `RAW-${rawMaterial.code}-${Date.now()}`,
          qtyOnHand: initialStock,
          unitId: rawMaterial.defaultUnitId,
          receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
        },
      });

      await prisma.inventoryMovement.create({
        data: {
          inventoryLotId: lot.id,
          direction: MovementDirection.IN,
          qty: initialStock,
          unitId: rawMaterial.defaultUnitId,
          reason: MovementReason.PURCHASE,
          movedAt: receivedAt ? new Date(receivedAt) : new Date(),
        },
      });
    }

    return NextResponse.json(rawMaterial, { status: 201 });
  } catch (error) {
    return serverError("raw material", "create", error);
  }
}
