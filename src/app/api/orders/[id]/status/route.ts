import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { OrderStatusEnum } from "@/lib/schemas";
import { MovementDirection, MovementReason } from "@prisma/client";
import { z } from "zod";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const orderId = Number((await context.params).id);

  if (Number.isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = OrderStatusEnum.safeParse(body);

  if (!result.success) {
    const formattedErr = z.flattenError(result.error);
    return NextResponse.json(
      { error: "Invalid request body", details: formattedErr },
      { status: 400 }
    );
  }

  const newStatus = result.data;

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!existingOrder || existingOrder.status === "CANCELLED") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const now = new Date();
    const updateData: { status: typeof newStatus; deliveredAt?: Date | null } = {
      status: newStatus,
    };

    if (newStatus === "DELIVERED") {
      updateData.deliveredAt = now;
    } else if (existingOrder.deliveredAt) {
      updateData.deliveredAt = null;
    }

    const stockWarnings: string[] = [];

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Transitioning into DELIVERED -> deduct finished product lots in FIFO order
      if (newStatus === "DELIVERED" && existingOrder.status !== "DELIVERED") {
        const fallbackUnit = await tx.unit.findFirst({ select: { id: true } });

        for (const item of existingOrder.orderItems) {
          const requestedQty = Number(item.quantity ?? 0);
          if (requestedQty <= 0) continue;

          let remaining = requestedQty;

          const lots = await tx.inventoryLot.findMany({
            where: {
              inventoryItem: {
                productVariantId: item.productVariantId,
              },
              qtyOnHand: {
                gt: 0,
              },
            },
            orderBy: [{ receivedAt: "asc" }, { id: "asc" }],
          });

          for (const lot of lots) {
            if (remaining <= 0) break;
            const available = Number(lot.qtyOnHand ?? 0);
            if (available <= 0) continue;

            const deduct = Math.min(remaining, available);
            const nextQty = Number((available - deduct).toFixed(4));

            await tx.inventoryLot.update({
              where: { id: lot.id },
              data: { qtyOnHand: nextQty },
            });

            const unitId =
              lot.unitId ??
              item.unitId ??
              item.productVariant?.defaultUnitId ??
              fallbackUnit?.id;

            if (unitId) {
              await tx.inventoryMovement.create({
                data: {
                  inventoryLotId: lot.id,
                  direction: MovementDirection.OUT,
                  qty: deduct,
                  unitId,
                  reason: MovementReason.OUTBOUND_ORDER,
                  relatedOrderId: orderId,
                  note: `Salida por entrega de pedido #${orderId}`,
                  movedAt: now,
                },
              });
            }

            remaining = Number((remaining - deduct).toFixed(4));
          }

          if (remaining > 0) {
            const deducted = Number((requestedQty - remaining).toFixed(4));
            const baseName = item.productVariant?.product?.name;
            const variantName = item.productVariant?.name;
            const label =
              baseName && variantName
                ? `${baseName} (${variantName})`
                : variantName || baseName || `Producto #${item.productVariantId}`;

            stockWarnings.push(
              `${label}: se descontaron ${deducted} de ${requestedQty} unidades (faltaron ${remaining} en inventario).`
            );
          }
        }
      }

      // Transitioning out of DELIVERED -> restore previously deducted lots
      if (newStatus !== "DELIVERED" && existingOrder.status === "DELIVERED") {
        const outboundMovements = await tx.inventoryMovement.findMany({
          where: {
            relatedOrderId: orderId,
            reason: MovementReason.OUTBOUND_ORDER,
            direction: MovementDirection.OUT,
          },
        });

        for (const mov of outboundMovements) {
          const lot = await tx.inventoryLot.findUnique({
            where: { id: mov.inventoryLotId },
          });
          if (lot) {
            const currentQty = Number(lot.qtyOnHand ?? 0);
            const restoredQty = Number((currentQty + Number(mov.qty)).toFixed(4));
            await tx.inventoryLot.update({
              where: { id: lot.id },
              data: { qtyOnHand: restoredQty },
            });
          }
        }

        if (outboundMovements.length > 0) {
          await tx.inventoryMovement.deleteMany({
            where: {
              id: { in: outboundMovements.map((m) => m.id) },
            },
          });
        }
      }

      return tx.order.update({
        where: { id: orderId },
        data: updateData,
      });
    });

    return NextResponse.json({
      ...updatedOrder,
      stockWarnings,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
