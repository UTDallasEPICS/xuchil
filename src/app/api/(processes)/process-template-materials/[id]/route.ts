import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { ProcessTemplateStepMaterialCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processTemplateStepMaterial");
    }
    const item = await prisma.processTemplateStepMaterial.findUnique({ where: { id: idParsed } });
    if (!item) {
      return notFoundError("processTemplateStepMaterial");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("processTemplateStepMaterial", "fetch", e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processTemplateStepMaterial");
    }
    const body = await req.json();
    const res = ProcessTemplateStepMaterialCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("processTemplateStepMaterial", "update", res.error);
    }
    const updatedItem = await prisma.processTemplateStepMaterial.update({ where: { id: idParsed }, data: res.data });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("processTemplateStepMaterial", "update", e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processTemplateStepMaterial");
    }
    await prisma.processTemplateStepMaterial.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("processTemplateStepMaterial", "delete", e);
  }
}
