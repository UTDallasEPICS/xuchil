import {InventoryLotCreateSchema} from "@/lib/schemas";
import {NextRequest} from "next/server";
import prisma from "@/lib/db";
import {fetchSuccess, validationError, serverError, createSuccess} from "@/utils/responses";

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.inventoryLot.findMany({});
    return fetchSuccess(items);
  } catch (e) {
    return serverError("inventoryLot", "fetch", e);
  }
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const res = InventoryLotCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("inventoryLot", "create", res.error);
    }
    const newItem = await prisma.inventoryLot.create({
      data: res.data,
    });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("inventoryLot", "create", e);
  }
};
