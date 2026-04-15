import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessStepMaterialUsageCreateSchema } from "@/lib/schemas";
import { qsToObject } from "@/utils/handlers";

export async function GET(req: NextRequest) {
  try {
    const paginatedFilterSchema = z.strictObject({
      offset: z.coerce.number().int().optional(),
      limit: z.coerce.number().int().optional(),
    });
    const res = paginatedFilterSchema.safeParse(qsToObject(req.nextUrl.searchParams));
    if (!res.success) {
      return validationError("processStepMaterialUsage", "fetch", res.error);
    }
    const { limit, offset, ...where } = res.data as z.infer<typeof paginatedFilterSchema>;

    const items = await prisma.processStepMaterialUsage.findMany({
      where: where,
      skip: offset,
      take: limit,
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("processStepMaterialUsage", "fetch", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = ProcessStepMaterialUsageCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("processStepMaterialUsage", "create", res.error);
    }
    const newItem = await prisma.processStepMaterialUsage.create({ data: res.data });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("processStepMaterialUsage", "create", e);
  }
}
