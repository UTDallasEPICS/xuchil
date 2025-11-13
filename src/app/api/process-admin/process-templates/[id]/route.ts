import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {checkId} from "@/utils/responses";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const [processTemplateId, processTemplateIdError] = checkId('process-template', (await context.params).id);
  if (processTemplateIdError !== null) {
    return processTemplateIdError;
  }
  const tpl = await prisma.processTemplate.findUnique({
    where: { id: processTemplateId },
    include: { templateSteps: { orderBy: { position: "asc" } } },
  });

  if (!tpl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(tpl);
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const [processTemplateId, processTemplateIdError] = checkId('process-template', (await context.params).id);
  if (processTemplateIdError !== null) {
    return processTemplateIdError;
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const updated = await prisma.processTemplate.update({
      where: { id: processTemplateId },
      data: {
        name: body.name ?? undefined,
        isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
        notes: body.notes ?? undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Update failed", detail: e.message },
      { status: 400 }
    );
  }
}