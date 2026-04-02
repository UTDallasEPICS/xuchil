import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/db";
import {idError, notFoundError, serverError} from "@/utils/responses";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await context.params).id)
  if (isNaN(id)) {
    return idError("item");
  }

  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        rawMaterial: {
          include: {
            defaultUnit: true,
          },
        },
        productVariant: {
          include: {
            product: true,
            defaultUnit: true,
          },
        },
        inventoryLots: {
          include: {
            unit: true,
          },
        },
      },
    });

    if (!item) return notFoundError('item');

    return NextResponse.json(item);
  } catch (e) {
    return serverError('item', 'fetch', e)
  }
}
