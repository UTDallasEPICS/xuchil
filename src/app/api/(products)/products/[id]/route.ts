import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { idError, notFoundError, serverError, validationError, updateSuccess, deleteSuccess, fetchSuccess } from "@/utils/responses";
import { ProductCreateSchema } from "@/lib/schemas";
import { withAuthAdmin } from "@/utils/handlers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("product");
    }
    const item = await prisma.product.findUnique({
      where: { id: idParsed },
      include: {
        unit: true,
      }
    });
    if (!item) {
      return notFoundError("product");
    }
    return fetchSuccess(item);
  } catch (e) {
    return serverError("product", "fetch", e);
  }
}

export const PUT = withAuthAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("product");
    }
    const body = await req.json();
    const res = ProductCreateSchema.partial().safeParse(body);
    if (!res.success) {
      return validationError("product", "update", res.error);
    }
    const updatedItem = await prisma.product.update({
      where: { id: idParsed },
      data: res.data,
      include: {
        unit: true,
      }
    });
    return updateSuccess(updatedItem);
  } catch (e) {
    return serverError("product", "update", e);
  }
});

export const DELETE = withAuthAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idParsed = parseInt(id);
    if (Number.isNaN(idParsed)) {
      return idError("product");
    }
    await prisma.product.delete({ where: { id: idParsed } });
    return deleteSuccess();
  } catch (e) {
    return serverError("product", "delete", e);
  }
});
