import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {checkId} from "@/utils/responses";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const [orderId, orderIdError] = checkId('order', (await context.params).id);
  if (orderIdError !== null) {
    return orderIdError;
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
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const [orderId, orderIdError] = checkId('order', (await context.params).id);
  if (orderIdError !== null) {
    return orderIdError;
  }
  try {
    const body = await req.json();
    const { clientName, addressText, deliveryDate, deliveryVariant, status } = body;

    const order = await prisma.order.update({
      where: { id: orderId},
      data: {
        clientName,
        addressText,
        deliveryDate: new Date(deliveryDate),
        deliveryVariant,
        status,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const [orderId, orderIdError] = checkId('order', (await context.params).id);
  if (orderIdError !== null) {
    return orderIdError;
  }
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}

