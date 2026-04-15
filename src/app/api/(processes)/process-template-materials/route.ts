import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessTemplateStepMaterialCreateSchema } from "@/lib/schemas";
import { qsToObject } from "@/utils/handlers";

export async function GET(req: NextRequest) {
  try {
    const paginatedFilterSchema = z.strictObject({
      offset: z.coerce.number().int().optional(),
      limit: z.coerce.number().int().optional(),
    });
    const res = paginatedFilterSchema.safeParse(qsToObject(req.nextUrl.searchParams));
    if (!res.success) {
      return validationError("processTemplateStepMaterial", "fetch", res.error);
    }
    const { limit, offset, ...where } = res.data as z.infer<typeof paginatedFilterSchema>;

    const items = await prisma.processTemplateStepMaterial.findMany({
      where: where,
      skip: offset,
      take: limit,
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("processTemplateStepMaterial", "fetch", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = ProcessTemplateStepMaterialCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("processTemplateStepMaterial", "create", res.error);
    }
    const newItem = await prisma.processTemplateStepMaterial.create({ data: res.data });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("processTemplateStepMaterial", "create", e);
  }
}
