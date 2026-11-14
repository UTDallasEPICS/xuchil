import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { productCategorySchema } from "@/lib/schemas";
import { serverError, validationError } from "@/utils/responses";
import { verifySession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = productCategorySchema.safeParse(body);
    if (!result.success) {
      return validationError("product category", result.error);
    }

    const category = await prisma.productCategory.create({
      data: result.data,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return serverError("product category", "create", error);
  }
}

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return serverError("product categories", "fetch", error);
  }
}
