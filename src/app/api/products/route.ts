import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { productSchema } from "@/lib/schemas";
import { serverError, validationError } from "@/utils/responses";
import { verifySession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = productSchema.safeParse(body);
    if (!result.success) {
      return validationError("product", result.error);
    }

    const product = await prisma.product.create({
      data: result.data,
      include: { category: true, defaultUnit: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return serverError("product", "create", error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryIdRaw = searchParams.get("category_id");

    const where: any = { isActive: true };
    if (categoryIdRaw) {
      const categoryId = parseInt(categoryIdRaw, 10);
      if (!Number.isNaN(categoryId)) {
        where.categoryId = categoryId;
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        defaultUnit: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    return serverError("products", "fetch", error);
  }
}
