import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { idError, notFoundError, serverError, fetchSuccess, updateSuccess, deleteSuccess, validationError } from "@/utils/responses";
import { InventoryLotCreateSchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("inventoryLot");
    }
    const item = await prisma.inventoryLot.findUnique({ where: { id: idParsed }});
    if (!item) {
      return notFoundError("inventoryLot");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("inventoryLot", "fetch", e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("inventoryLot");
    }
    const body = await req.json();
    const res = InventoryLotCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("inventoryLot", "update", res.error);
    }
    const updatedLot = await prisma.inventoryLot.update({
      where: { id: idParsed },
      data: res.data,
    });
    return updateSuccess(updatedLot);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return notFoundError("inventoryLot");
    }
    return serverError("inventoryLot", "update", e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("inventoryLot");
    }
    await prisma.inventoryLot.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return notFoundError("inventoryLot");
    }
    return serverError("inventoryLot", "delete", e);
  }
}
