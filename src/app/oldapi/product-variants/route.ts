import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/db";
import {productVariantSchema} from "@/lib/schemas";
import {serverError, validationError} from "@/utils/responses";
import {verifySession} from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productIdRaw = searchParams.get("product_id");

    const where: any = { isActive: true };
    if (productIdRaw) {
      const productId = parseInt(productIdRaw, 10);
      if (!Number.isNaN(productId)) {
        where.productId = productId;
      }
    }

    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: true,
        defaultUnit: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(variants);
  } catch (error) {
    return serverError("product variants", "fetch", error);
  }
}

export async function POST(request: NextRequest) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  const body = await request.json();
  const result = productVariantSchema.safeParse(body);
  if (!result.success) {
    return validationError("product variant", result.error);
  }

  try {
    const variant = await prisma.productVariant.create({
      data: result.data
    });
    return NextResponse.json(variant, {status: 201});
  } catch (error) {
    return serverError("product variant", "create", error);
  }
}
