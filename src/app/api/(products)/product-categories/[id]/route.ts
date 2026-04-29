import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { ProductCategoryCreateSchema } from "@/lib/schemas";
import { withAuthAdmin } from "@/utils/handlers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("productCategory");
    }
    const item = await prisma.productCategory.findUnique({ where: { id: idParsed } });
    if (!item) {
      return notFoundError("productCategory");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("productCategory", "fetch", e);
  }
}

export const PUT = withAuthAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("productCategory");
    }
    const body = await req.json();
    const res = ProductCategoryCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("productCategory", "update", res.error);
    }
    const updatedItem = await prisma.productCategory.update({ where: { id: idParsed }, data: res.data });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("productCategory", "update", e);
  }
});

export const DELETE = withAuthAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("productCategory");
    }
    await prisma.productCategory.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("productCategory", "delete", e);
  }
});
