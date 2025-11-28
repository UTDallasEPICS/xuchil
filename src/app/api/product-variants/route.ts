import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/db";
import {productVariantSchema} from "@/lib/schemas";
import {serverError, validationError} from "@/utils/responses";

export async function POST(request: NextRequest) {
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
