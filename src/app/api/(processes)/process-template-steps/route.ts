import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessTemplateStepCreateSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const items = await prisma.processTemplateStep.findMany({
      include: {
        processTemplateStepMaterials: true
      }
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("processTemplateStep", "fetch", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = ProcessTemplateStepCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("processTemplateStep", "create", res.error);
    }
    const newItem = await prisma.processTemplateStep.create({
      data: res.data,
      include: {
        processTemplateStepMaterials: true
      }
    });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("processTemplateStep", "create", e);
  }
}
