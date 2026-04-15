import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { OrderCreateSchema } from "@/lib/schemas";
import { withAuthWorker } from "@/utils/handlers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("order");
    }
    const item = await prisma.order.findUnique({ where: { id: idParsed } });
    if (!item) {
      return notFoundError("order");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("order", "fetch", e);
  }
}

export const PUT = withAuthWorker(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("order");
    }
    const body = await req.json();
    const res = OrderCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("order", "update", res.error);
    }
    const updatedItem = await prisma.order.update({ where: { id: idParsed }, data: res.data });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("order", "update", e);
  }
});

export const DELETE = withAuthWorker(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("order");
    }
    await prisma.order.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("order", "delete", e);
  }
});
