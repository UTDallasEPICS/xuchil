import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { ProcessStepMaterialUsageCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processStepMaterialUsage");
    }
    const item = await prisma.processStepMaterialUsage.findUnique({ where: { id: idParsed } });
    if (!item) {
      return notFoundError("processStepMaterialUsage");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("processStepMaterialUsage", "fetch", e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processStepMaterialUsage");
    }
    const body = await req.json();
    const res = ProcessStepMaterialUsageCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("processStepMaterialUsage", "update", res.error);
    }
    const updatedItem = await prisma.processStepMaterialUsage.update({ where: { id: idParsed }, data: res.data });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("processStepMaterialUsage", "update", e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processStepMaterialUsage");
    }
    await prisma.processStepMaterialUsage.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("processStepMaterialUsage", "delete", e);
  }
}
