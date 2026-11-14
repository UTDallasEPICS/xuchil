import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ItemType, MovementDirection, MovementReason } from "@prisma/client";
import { idError, notFoundError, serverError } from "@/utils/responses";
import { verifySession } from "@/lib/session";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  const itemId = parseInt((await context.params).id);
  if (isNaN(itemId)) {
    return idError("inventory item");
  }

  let body: { qty?: number; unitId?: number; note?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const qty = Number(body.qty);
  if (!Number.isFinite(qty) || qty <= 0) {
    return NextResponse.json({ error: "La cantidad debe ser mayor a 0." }, { status: 400 });
  }

  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: { rawMaterial: true, productVariant: true },
    });
    if (!item) {
      return notFoundError("inventory item");
    }

    const unitId =
      body.unitId ??
      item.defaultUnitId ??
      item.rawMaterial?.defaultUnitId ??
      item.productVariant?.defaultUnitId ??
      null;
    if (!unitId) {
      return NextResponse.json(
        { error: "No hay una unidad definida para este artículo." },
        { status: 400 }
      );
    }

    const now = new Date();
    const isRaw = item.itemType === ItemType.RAW;
    const codePart = isRaw
      ? item.rawMaterial?.code ?? item.rawMaterialId
      : item.productVariantId;
    const lotCode = `${isRaw ? "RAW" : "PROD"}-${codePart}-${now.getTime()}`;

    const lot = await prisma.$transaction(async (tx) => {
      const created = await tx.inventoryLot.create({
        data: {
          inventoryItemId: item.id,
          lotCode,
          qtyOnHand: qty,
          unitId,
          receivedAt: now,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryLotId: created.id,
          direction: MovementDirection.IN,
          qty,
          unitId,
          reason: isRaw ? MovementReason.PURCHASE : MovementReason.ADJUSTMENT,
          note: body.note?.trim() || null,
          movedAt: now,
        },
      });

      return created;
    });

    return NextResponse.json(lot, { status: 201 });
  } catch (error) {
    return serverError("inventory item", "restock", error);
  }
}
