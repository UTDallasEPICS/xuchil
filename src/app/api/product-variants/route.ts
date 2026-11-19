import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { productVariantWithStockSchema } from "@/lib/schemas";
import { serverError, validationError } from "@/utils/responses";
import { verifySession } from "@/lib/session";
import { ItemType, MovementDirection, MovementReason, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productIdRaw = searchParams.get("product_id");
    const categoryIdRaw = searchParams.get("category_id");

    const where: Prisma.ProductVariantWhereInput = { isActive: true };
    if (productIdRaw) {
      const productId = parseInt(productIdRaw, 10);
      if (!Number.isNaN(productId)) {
        where.productId = productId;
      }
    }
    if (categoryIdRaw) {
      const categoryId = parseInt(categoryIdRaw, 10);
      if (!Number.isNaN(categoryId)) {
        where.product = { categoryId };
      }
    }

    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: true,
        defaultUnit: true,
        inventoryItems: {
          include: {
            inventoryLots: {
              select: {
                qtyOnHand: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const enrichedVariants = variants.map((variant) => {
      const availableStock = (variant.inventoryItems ?? []).reduce(
        (sum, item) =>
          sum +
          (item.inventoryLots ?? []).reduce(
            (lotSum, lot) => lotSum + Math.max(0, Number(lot.qtyOnHand ?? 0)),
            0
          ),
        0
      );

      return {
        ...variant,
        availableStock,
      };
    });

    return NextResponse.json(enrichedVariants);
  } catch (error) {
    return serverError("product variants", "fetch", error);
  }
}

export async function POST(request: NextRequest) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  const body = await request.json();
  const result = productVariantWithStockSchema.safeParse(body);
  if (!result.success) {
    return validationError("product variant", result.error);
  }

  const { initialStock = 0, lotCode, receivedAt, ...productVariantData } = result.data;

  if (initialStock > 0 && !productVariantData.defaultUnitId) {
    return NextResponse.json(
      { error: "defaultUnitId is required when initialStock is provided." },
      { status: 400 }
    );
  }

  try {
    const variant = await prisma.productVariant.create({
      data: productVariantData,
    });

    // Always create the inventory item so the variant shows up in inventory,
    // even with zero stock (stock can be added later via restock).
    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        itemType: ItemType.PRODUCT,
        productVariantId: variant.id,
        defaultUnitId: productVariantData.defaultUnitId ?? null,
      },
    });

    if (initialStock > 0 && productVariantData.defaultUnitId) {
      const lot = await prisma.inventoryLot.create({
        data: {
          inventoryItemId: inventoryItem.id,
          lotCode: lotCode || `PROD-${variant.id}-${Date.now()}`,
          qtyOnHand: initialStock,
          unitId: productVariantData.defaultUnitId,
          receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
        },
      });

      await prisma.inventoryMovement.create({
        data: {
          inventoryLotId: lot.id,
          direction: MovementDirection.IN,
          qty: initialStock,
          unitId: productVariantData.defaultUnitId,
          reason: MovementReason.ADJUSTMENT,
          movedAt: receivedAt ? new Date(receivedAt) : new Date(),
        },
      });
    }

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    return serverError("product variant", "create", error);
  }
}
