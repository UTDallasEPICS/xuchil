import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { ProcessPauseCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processPause");
    }
    const item = await prisma.processPause.findUnique({ where: { id: idParsed } });
    if (!item) {
      return notFoundError("processPause");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("processPause", "fetch", e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processPause");
    }
    const body = await req.json();
    const res = ProcessPauseCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("processPause", "update", res.error);
    }
    const updatedItem = await prisma.processPause.update({ where: { id: idParsed }, data: res.data });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("processPause", "update", e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processPause");
    }
    await prisma.processPause.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("processPause", "delete", e);
  }
}
