// src/app/api/process-templates/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { processTemplateSchema } from "@/lib/schemas";
import { z } from "zod";

// GET /api/process-templates?product_variant_id=123
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
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

  let body: unknown;
  try {
    body = await request.json();
  }
  catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = processTemplateSchema.safeParse(body);

  if(!result.success){
    const formattedErr = z.flattenError(result.error);
    return NextResponse.json({ error: "Invalid request body", details: formattedErr }, { status: 400 });
  }

  const validBody = result.data;

  try {
    let newVersion = validBody.version;

    if (newVersion === undefined) {
      // If version is NOT provided, calculate the next auto-incremented version.

      // Find the template with the highest version for this productVariantId
      const lastTemplate = await prisma.processTemplate.findFirst({
        where: { productVariantId: validBody.productVariantId },
        orderBy: { version: "desc" },
        select: { version: true },
      });

      // Calculate the next version: (last version + 1) or 1 if no templates exist
      newVersion = (lastTemplate?.version ?? 0) + 1;
    }

    const created = await prisma.processTemplate.create({
      data: {
        productVariantId: validBody.productVariantId,
        name: validBody.name,
        version: newVersion,
        isActive: validBody.isActive,
        notes: validBody.notes
      }
    })

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