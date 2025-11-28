import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { processTemplateSchema } from "@/lib/schemas";
import {serverError, validationError} from "@/utils/responses";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pv = searchParams.get("product_variant_id");
    const filter: any = {}
    if (pv != null) {
      filter.productVariantId = parseInt(pv)
    }
    const items = await prisma.processTemplate.findMany({
      where: filter,
      orderBy: [{ productVariantId: "asc" }, { version: "desc" }],
    });

    return NextResponse.json(items);
  } catch (err) {
    return serverError('process templates', 'fetch', err)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = processTemplateSchema.safeParse(body);
  if(!result.success){
    return validationError("process templates", result.error)
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
    return serverError('process templates', 'create', err)
  }
}