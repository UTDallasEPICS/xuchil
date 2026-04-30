import {InventoryItemCreateSchema} from "@/lib/schemas";
import {NextRequest} from "next/server";
import prisma from "@/lib/db";
import {fetchSuccess, validationError, serverError, createSuccess, } from "@/utils/responses";
import {z} from "zod";
import qs from "qs";
import {ItemType} from "@prisma/client";

export async function GET(req: NextRequest) {
  const paginatedFilterSchema = z.strictObject({
    itemType: z.enum(ItemType),
    offset: z.coerce.number().int(),
    limit: z.coerce.number().int(),
  });
  const res = paginatedFilterSchema.partial().safeParse(qs.parse(req.nextUrl.search));
  if (!res.success) {
    return validationError("inventoryItem", "fetch", res.error);
  }
  const { limit, offset, ...where } = res.data;

  try {
    const items = await prisma.inventoryItem.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { id: "asc" },
      include: {
        inventoryMovements: true,
        product: {
          include: {
            unit: true
          }
        },
        rawMaterial: {
          include: {
            unit: true
          }
        },
      },
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("inventoryItem", "fetch", e);
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const res = InventoryItemCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("inventoryItem", "create", res.error);
    }
    const newItem = await prisma.inventoryItem.create({
      data: res.data,
      include: {
        inventoryMovements: true,
        product: {
          include: {
            unit: true
          }
        },
        rawMaterial: {
          include: {
            unit: true
          }
        },
      },
    });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("inventoryItem", "create", e);
  }
};
