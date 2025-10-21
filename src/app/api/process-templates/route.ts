// src/app/api/process-templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/process-templates?product_variant_id=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pv = searchParams.get("product_variant_id");
    const where = pv ? { productVariantId: Number(pv) } : {};

    const items = await prisma.processTemplate.findMany({
      where,
      orderBy: [{ productVariantId: "asc" }, { version: "desc" }],
      include: {
        _count: { select: { templateSteps: true } }, // relation is "templateSteps" in your schema
      },
    });

    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to list templates", detail: err.message },
      { status: 500 }
    );
  }
}

// POST /api/process-templates
// body: { productVariantId:number, name:string, version?:number, isActive?:boolean, notes?:string }
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.productVariantId || !body?.name) {
    return NextResponse.json(
      { error: "productVariantId and name are required" },
      { status: 400 }
    );
  }

  try {
    // auto-pick next version if missing
    const last = await prisma.processTemplate.findFirst({
      where: { productVariantId: Number(body.productVariantId) },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const version = body.version ?? (last?.version ?? 0) + 1;

    const created = await prisma.processTemplate.create({
      data: {
        productVariantId: Number(body.productVariantId),
        name: String(body.name),
        version,
        isActive: body.isActive ?? true,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Failed to create template (version conflict or bad FK).",
        detail: err.message,
      },
      { status: 409 }
    );
  }
}