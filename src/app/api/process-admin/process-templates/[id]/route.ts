// src/app/api/process-templates/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/process-templates/:id
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tplId = Number(id);
  if (Number.isNaN(tplId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const tpl = await prisma.processTemplate.findUnique({
    where: { id: tplId },
    include: { templateSteps: { orderBy: { position: "asc" } } },
  });

  if (!tpl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(tpl);
}

// PUT /api/process-templates/:id
// body: { name?, isActive?, notes? }
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const tplId = Number(id);
  if (Number.isNaN(tplId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const updated = await prisma.processTemplate.update({
      where: { id: tplId },
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