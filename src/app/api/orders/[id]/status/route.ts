// src/app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { OrderStatusEnum } from "@/lib/schemas";
import { z } from "zod";

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const orderId = Number(context.params.id);

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
    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: { status: typeof newStatus, deliveredAt?: Date | null } = { status: newStatus };

    // Automatically set deliveredAt if status is DELIVERED
    if (newStatus === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }
    // If setting status to anything else, ensure deliveredAt is null
    else if (existingOrder.deliveredAt) {
      updateData.deliveredAt = null;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // 3. Trigger Inventory/Accounting Logic Here
    // if (newStatus === 'DELIVERED') {
    //   // Call a service function to reduce inventory of items, update ledgers, etc.
    // }

    return NextResponse.json(updatedOrder);

  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}