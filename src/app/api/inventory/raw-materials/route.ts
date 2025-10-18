import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/db";

export async function POST(request: NextRequest) {
  const data = await request.json();

  try {
    const rawMaterial = await prisma.rawMaterial.create({ data });
    return NextResponse.json(rawMaterial, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create raw material" }, { status: 500 });
  }
}
