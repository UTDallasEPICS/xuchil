import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { orderSchema } from "@/lib/schemas";
import { z } from "zod";


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
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    // 1. Parse JSON body
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
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
