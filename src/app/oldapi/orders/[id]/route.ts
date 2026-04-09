import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { orderSchema } from "@/lib/schemas";
import { z } from "zod";
import {idError, notFoundError, serverError, validationError} from "@/utils/responses";
import {verifySession} from "@/lib/session";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const orderId = parseInt((await context.params).id);
  if (isNaN(orderId)) {
    return idError('order')
  }
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { productVariant: true, unit: true },
        },
      },
    });

    if (!order) {
      return notFoundError('order')
    }

    return NextResponse.json(order);
  } catch (error) {
    return serverError('order', 'fetch', error)
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const orderId = parseInt((await context.params).id);
  if (isNaN(orderId)) {
    return idError('order')
  }

  const body = await request.json();
  const result = orderSchema.safeParse(body);
  if (!result.success) {
    return validationError('order', result.error)
  }

  try {
    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder) {
        return notFoundError('order')
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
    return serverError('order', 'update', error)
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  const orderId = parseInt((await context.params).id);
  if (isNaN(orderId)) {
    return idError('order')
  }
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return serverError('order', 'delete', error)
  }
}

