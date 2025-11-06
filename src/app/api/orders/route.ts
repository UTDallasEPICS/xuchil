import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";


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


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, addressText, deliveryDate, deliveryVariant, orderItems } = body;

    // Create the order first
    const newOrder = await prisma.order.create({
      data: {
        clientName,
        addressText,
        deliveryDate: new Date(deliveryDate),
        deliveryVariant,
        orderItems: {
          createMany: {
            data: orderItems.map((item: { productVariantId: number; quantity: number; unitId?: number }) => ({
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              unitId: item.unitId,
            })),
          },
        },
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
