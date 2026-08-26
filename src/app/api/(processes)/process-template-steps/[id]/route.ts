import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { ProcessTemplateStepCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processTemplateStep");
    }
    const item = await prisma.processTemplateStep.findUnique({
      where: { id: idParsed },
      include: {
        processTemplateStepMaterials: true
      }
    });
    if (!item) {
      return notFoundError("processTemplateStep");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("processTemplateStep", "fetch", e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processTemplateStep");
    }
    const body = await req.json();
    const res = ProcessTemplateStepCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("processTemplateStep", "update", res.error);
    }
    const updatedItem = await prisma.processTemplateStep.update({
      where: { id: idParsed },
      data: res.data,
      include: {
        processTemplateStepMaterials: true
      }
    });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("processTemplateStep", "update", e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processTemplateStep");
    }
    await prisma.processTemplateStep.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("processTemplateStep", "delete", e);
  }
}
