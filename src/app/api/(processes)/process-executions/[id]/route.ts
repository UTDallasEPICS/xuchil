import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { ProcessExecutionCreateSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processExecution");
    }
    const item = await prisma.processExecution.findUnique({
      where: { id: idParsed },
      include: {
        processStepExecutions: {
          orderBy: {
            step: {
              position: "asc",
            }
          }
        }
      }
    });
    if (!item) {
      return notFoundError("processExecution");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("processExecution", "fetch", e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processExecution");
    }
    const body = await req.json();
    const res = ProcessExecutionCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("processExecution", "update", res.error);
    }
    const updatedItem = await prisma.processExecution.update({
      where: { id: idParsed }, data: res.data,
      include: {
        processStepExecutions: {
          orderBy: {
            step: {
              position: "asc",
            }
          }
        }
      }
    });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("processExecution", "update", e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("processExecution");
    }
    await prisma.processExecution.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("processExecution", "delete", e);
  }
}
