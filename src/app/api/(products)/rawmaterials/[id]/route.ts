import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { RawMaterialCreateSchema } from "@/lib/schemas";
import { withAuthAdmin } from "@/utils/handlers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("rawMaterial");
    }
    const item = await prisma.rawMaterial.findUnique({ where: { id: idParsed } });
    if (!item) {
      return notFoundError("rawMaterial");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("rawMaterial", "fetch", e);
  }
}

export const PUT = withAuthAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("rawMaterial");
    }
    const body = await req.json();
    const res = RawMaterialCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("rawMaterial", "update", res.error);
    }
    const updatedItem = await prisma.rawMaterial.update({ where: { id: idParsed }, data: res.data });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("rawMaterial", "update", e);
  }
});

export const DELETE = withAuthAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("rawMaterial");
    }
    await prisma.rawMaterial.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("rawMaterial", "delete", e);
  }
});
