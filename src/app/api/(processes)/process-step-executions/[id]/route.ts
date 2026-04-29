import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { ProcessStepExecutionCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processStepExecution");
    }
    const item = await prisma.processStepExecution.findUnique({ where: { id: idParsed } });
    if (!item) {
      return notFoundError("processStepExecution");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("processStepExecution", "fetch", e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processStepExecution");
    }
    const body = await req.json();
    const res = ProcessStepExecutionCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("processStepExecution", "update", res.error);
    }
    const updatedItem = await prisma.processStepExecution.update({ where: { id: idParsed }, data: res.data });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("processStepExecution", "update", e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processStepExecution");
    }
    await prisma.processStepExecution.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("processStepExecution", "delete", e);
  }
}
