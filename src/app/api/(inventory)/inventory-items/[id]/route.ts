import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { idError, notFoundError, serverError, fetchSuccess, updateSuccess, deleteSuccess, validationError } from "@/utils/responses";
import { InventoryItemCreateSchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("inventoryItem");
    }
    const item = await prisma.inventoryItem.findUnique({ where: { id: idParsed }});
    if (!item) {
      return notFoundError("inventoryItem");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("inventoryItem", "fetch", e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("inventoryItem");
    }
    const body = await req.json();
    const res = InventoryItemCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("inventoryItem", "update", res.error);
    }
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: idParsed },
      data: res.data,
    });
    return updateSuccess(updatedItem);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return notFoundError("inventoryItem");
    }
    return serverError("inventoryItem", "update", e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("inventoryItem");
    }
    await prisma.inventoryItem.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return notFoundError("inventoryItem");
    }
    return serverError("inventoryItem", "delete", e);
  }
}
