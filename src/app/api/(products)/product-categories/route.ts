import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProductCategoryCreateSchema } from "@/lib/schemas";
import { withAuthAdmin } from "@/utils/handlers";

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.productCategory.findMany({});
    return fetchSuccess(items);
  } catch (e) {
    return serverError("productCategory", "fetch", e);
  }
}

export const POST = withAuthAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const res = ProductCategoryCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("productCategory", "create", res.error);
    }
    const newItem = await prisma.productCategory.create({ data: res.data });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("productCategory", "create", e);
  }
});
