import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { orderSchema } from "@/lib/schemas";
import { z } from "zod";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        orderItems: {
          include: { productVariant: true, unit: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const orderId = Number(id);
  if (Number.isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = orderSchema.safeParse(body);

  if (!result.success) {
    const formattedErr = z.flattenError(result.error);
    return NextResponse.json(
      { error: "Invalid request body", details: formattedErr },
      { status: 400 }
    );
  }

  try {
    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const validBody = result.data;
    const transaction = await prisma.$transaction([
      // Delete all existing items for this order
      prisma.orderItem.deleteMany({
        where: { orderId: orderId },
      }),

      prisma.order.update({
        where: { id: orderId },
        data: {
          clientName: validBody.clientName,
          addressText: validBody.addressText,
          deliveryDate: validBody.deliveryDate,
          deliveryVariant: validBody.deliveryVariant,
          status: validBody.status,
          deliveredAt: validBody.deliveredAt,
          consignmentPartner: validBody.consignmentPartner,
          notes: validBody.notes,
          orderItems: {
            createMany: {
              data: validBody.orderItems.map(item => ({
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                unitId: item.unitId,
                notes: item.notes,
              })),
            },
          },
        },
        include: { orderItems: true },
      }),
    ]);
    return NextResponse.json(transaction[1]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.order.update({
      where: { id: Number(id) },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}

