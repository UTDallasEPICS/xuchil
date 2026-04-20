import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { OrderCreateSchema } from "@/lib/schemas";
import { withAuthWorker } from "@/utils/handlers";

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.order.findMany({
      include: {
        orderItems: true,
      }
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("order", "fetch", e);
  }
}

export const POST = withAuthWorker(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const res = OrderCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("order", "create", res.error);
    }
    const newItem = await prisma.order.create({
      data: res.data,
      include: {
        orderItems: true,
      }
    });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("order", "create", e);
  }
});
