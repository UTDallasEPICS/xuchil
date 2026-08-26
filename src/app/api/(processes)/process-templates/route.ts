import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { fetchSuccess, validationError, serverError, createSuccess } from "@/utils/responses";
import { ProcessTemplateCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  try {
  
    const items = await prisma.processTemplate.findMany({
      include: {
        processTemplateSteps: {
          orderBy: { position: "asc" },
          include: {
            processTemplateStepMaterials: {
              include: {
                rawMaterial: true
              }
            },
      
          },
        },
      
      }
    });
    return fetchSuccess(items);
  } catch (e) {
    return serverError("processTemplate", "fetch", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = ProcessTemplateCreateSchema.safeParse(body);
    if (!res.success) {
      return validationError("processTemplate", "create", res.error);
    }
    const newItem = await prisma.processTemplate.create({
      data: res.data,
      include: {
        processTemplateSteps: {
          orderBy: { position: "asc" },
          include: {
            processTemplateStepMaterials: true
          },
        }
      }
    });
    return createSuccess(newItem);
  } catch (e) {
    return serverError("processTemplate", "create", e);
  }
}
