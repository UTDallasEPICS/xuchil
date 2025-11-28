import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { orderSchema } from "@/lib/schemas";
import { z } from "zod";
import {serverError, validationError} from "@/utils/responses";


export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: { productVariant: true, unit: true },
        },
      },
      orderBy: { deliveryDate: "asc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return serverError('orders', 'fetch', error);
  }
}


export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = orderSchema.safeParse(body);
  if (!result.success) {
    return validationError('order', result.error)
  }
  try {
    const validBody = result.data
    const newOrder = await prisma.order.create({
      data: {
        clientName: validBody.clientName,
        addressText: validBody.addressText,
        deliveryDate: validBody.deliveryDate,
        deliveryVariant: validBody.deliveryVariant,
        orderItems: {
          createMany: {
            // Map the validated orderItems array for nested creation
            data: validBody.orderItems.map(item => ({
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              unitId: item.unitId,
              notes: item.notes,
            })),
          },
        },
        status: validBody.status,
        deliveredAt: validBody.deliveredAt,
        consignmentPartner: validBody.consignmentPartner,
        notes: validBody.notes,
      },
      include: {
        orderItems: true,
      },
    });


    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return serverError('order', 'create', error)
  }
}
