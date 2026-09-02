import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { InventoryMovementCreateSchema } from "@/lib/schemas";
import { withAuthWorker } from "@/utils/handlers";
import qs from "qs";

export async function GET(req: NextRequest) {
  try {
    const paginatedFilterSchema = z.strictObject({
      inventoryItemId: z.coerce.number().int(),
      offset: z.coerce.number().int(),
      limit: z.coerce.number().int(),
    });
    const res = paginatedFilterSchema.partial().safeParse(qs.parse(req.nextUrl.search));
    if (!res.success) {
      return validationError("inventoryMovement", "fetch", res.error);
    }
    const { limit, offset, ...where } = res.data;

    const items = await prisma.inventoryMovement.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { id: "asc" },
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("inventoryMovement", "fetch", e);
  }
}

export const POST = withAuthWorker(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const res = InventoryMovementCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("inventoryMovement", "create", res.error);
    }
    const newItem = await prisma.inventoryMovement.create({ data: res.data });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("inventoryMovement", "create", e);
  }
});
