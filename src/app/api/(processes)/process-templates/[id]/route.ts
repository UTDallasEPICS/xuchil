import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { ProcessTemplateCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processTemplate");
    }
    const item = await prisma.processTemplate.findUnique({
      where: { id: idParsed },
      include: {
        processTemplateSteps: {
          orderBy: { position: "asc" },
          include: {
            processTemplateStepMaterials: true
          },
        }
      }
    });
    if (!item) {
      return notFoundError("processTemplate");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("processTemplate", "fetch", e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processTemplate");
    }
    const body = await req.json();
    const res = ProcessTemplateCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("processTemplate", "update", res.error);
    }
    const updatedItem = await prisma.processTemplate.update({
      where: { id: idParsed },
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
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("processTemplate", "update", e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processTemplate");
    }
    await prisma.processTemplate.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("processTemplate", "delete", e);
  }
}
