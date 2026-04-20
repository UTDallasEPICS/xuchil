import { NextResponse } from "next/server";
import prisma from "@/lib/db";

import {serverError,} from "@/utils/responses";


export async function GET() {


  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { deliveryDate: "asc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    return serverError("orders", "fetch", error);
  }
}


