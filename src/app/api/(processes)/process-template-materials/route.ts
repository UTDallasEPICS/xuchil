import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessTemplateStepMaterialCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.processTemplateStepMaterial.findMany({});
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
