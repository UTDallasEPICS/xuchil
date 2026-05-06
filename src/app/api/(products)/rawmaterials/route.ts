import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { RawMaterialCreateSchema } from "@/lib/schemas";
import { withAuthAdmin } from "@/utils/handlers";

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.rawMaterial.findMany({
      include: {
        unit: true,
        inventoryItem: {
          include: {
            inventoryLots: true
          }
        }
      }
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("rawMaterial", "fetch", e);
  }
}

export const POST = withAuthAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const res = RawMaterialCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("rawMaterial", "create", res.error);
    }
    const newItem = await prisma.rawMaterial.create({
      data: res.data,
      include: {
        unit: true,
      }
    });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("rawMaterial", "create", e);
  }
});
