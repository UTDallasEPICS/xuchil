import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { OrderItemCreateSchema } from "@/lib/schemas";
import { withAuthWorker, qsToObject } from "@/utils/handlers";

export async function GET(req: NextRequest) {
  try {
    const paginatedFilterSchema = z.strictObject({
      offset: z.coerce.number().int().optional(),
      limit: z.coerce.number().int().optional(),
    });
    const res = paginatedFilterSchema.safeParse(qsToObject(req.nextUrl.searchParams));
    if (!res.success) {
      return validationError("orderItem", "fetch", res.error);
    }
    const { limit, offset, ...where } = res.data as z.infer<typeof paginatedFilterSchema>;

    const items = await prisma.orderItem.findMany({
      where: where,
      skip: offset,
      take: limit,
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("orderItem", "fetch", e);
  }
}

export const POST = withAuthWorker(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const res = OrderItemCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("orderItem", "create", res.error);
    }
    const newItem = await prisma.orderItem.create({ data: res.data });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("orderItem", "create", e);
  }
});
