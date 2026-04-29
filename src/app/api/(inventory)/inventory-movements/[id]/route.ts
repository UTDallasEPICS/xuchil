import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { InventoryMovementCreateSchema } from "@/lib/schemas";
import { withAuthAdmin } from "@/utils/handlers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("inventoryMovement");
    }
    const item = await prisma.inventoryMovement.findUnique({ where: { id: idParsed } });
    if (!item) {
      return notFoundError("inventoryMovement");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("inventoryMovement", "fetch", e);
  }
}

export const PUT = withAuthAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("inventoryMovement");
    }
    const body = await req.json();
    const res = InventoryMovementCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("inventoryMovement", "update", res.error);
    }
    const updatedItem = await prisma.inventoryMovement.update({ where: { id: idParsed }, data: res.data });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("inventoryMovement", "update", e);
  }
});

export const DELETE = withAuthAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("inventoryMovement");
    }
    await prisma.inventoryMovement.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("inventoryMovement", "delete", e);
  }
});
