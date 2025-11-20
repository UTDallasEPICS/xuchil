import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/db";
import { productVariantSchema } from "@/lib/schemas";
import { z } from "zod";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  }
  catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = productVariantSchema.safeParse(body);

    if(!result.success){
      const formattedErr = z.flattenError(result.error);
      return NextResponse.json({ error: "Invalid request body", details: formattedErr }, { status: 400 });
    }

  try {
    const variant = await prisma.productVariant.create({
      data:result.data
    });
    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product variant" }, { status: 500 });
  }
}
