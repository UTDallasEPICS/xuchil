import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/db";

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    const variant = await prisma.productVariant.create({ data });
    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product variant" }, { status: 500 });
  }
}
