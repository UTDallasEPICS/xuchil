import {NextRequest} from "next/server";
import prisma from "@/lib/db";
import {fetchSuccess, validationError, serverError, createSuccess} from "@/utils/responses";
import {ProductCreateSchema} from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.product.findMany({
      include: {
        unit: true,
        inventoryItem: true,
      }
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("product", "fetch", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = ProductCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("product", "create", res.error);
    }
    const newItem = await prisma.product.create({
      data: res.data,
      include: {
        unit: true,
      }
    });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("product", "create", e);
  }
}
