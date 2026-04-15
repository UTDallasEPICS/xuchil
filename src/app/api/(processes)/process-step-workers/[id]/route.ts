import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { ProcessStepWorkerCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processStepWorker");
    }
    const item = await prisma.processStepWorker.findUnique({ where: { id: idParsed } });
    if (!item) {
      return notFoundError("processStepWorker");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("processStepWorker", "fetch", e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processStepWorker");
    }
    const body = await req.json();
    const res = ProcessStepWorkerCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("processStepWorker", "update", res.error);
    }
    const updatedItem = await prisma.processStepWorker.update({ where: { id: idParsed }, data: res.data });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("processStepWorker", "update", e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processStepWorker");
    }
    await prisma.processStepWorker.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("processStepWorker", "delete", e);
  }
}
