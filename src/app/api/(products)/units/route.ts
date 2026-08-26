import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { UnitCreateSchema } from "@/lib/schemas";
import { withAuthAdmin } from "@/utils/handlers";

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.unit.findMany({});
    return fetchSuccess(items);
  } catch (e) {
    return serverError("unit", "fetch", e);
  }
}

export const POST = withAuthAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const res = UnitCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("unit", "create", res.error);
    }
    const newItem = await prisma.unit.create({ data: res.data });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("unit", "create", e);
  }
});
