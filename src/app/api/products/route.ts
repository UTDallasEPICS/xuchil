import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { serverError } from "@/utils/responses";

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
