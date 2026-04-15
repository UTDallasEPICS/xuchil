import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { OrderItemCreateSchema } from "@/lib/schemas";
import { withAuthWorker } from "@/utils/handlers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("orderItem");
    }
    const item = await prisma.orderItem.findUnique({ where: { id: idParsed } });
    if (!item) {
      return notFoundError("orderItem");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("orderItem", "fetch", e);
  }
}

export const PUT = withAuthWorker(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("orderItem");
    }
    const body = await req.json();
    const res = OrderItemCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("orderItem", "update", res.error);
    }
    const updatedItem = await prisma.orderItem.update({ where: { id: idParsed }, data: res.data });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("orderItem", "update", e);
  }
});

export const DELETE = withAuthWorker(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("orderItem");
    }
    await prisma.orderItem.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("orderItem", "delete", e);
  }
});
