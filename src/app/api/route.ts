import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// ✅ GET /api/orders — list all orders
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: { productVariant: true },
        },
      },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// ✅ POST /api/orders — create a new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, addressText, deliveryDate, deliveryVariant, items } = body;

    // Create the order with items (transaction ensures data consistency)
    const order = await prisma.order.create({
      data: {
        clientName,
        addressText,
        deliveryDate: new Date(deliveryDate),
        deliveryVariant,
        status: "SCHEDULED",
        orderItems: {
          create: items.map((item: any) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
