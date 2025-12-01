import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { templateStepSchema } from "@/lib/schemas";
import { z } from "zod";
import { checkId } from "@/utils/responses";
import { verifySession } from "@/lib/session";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  const [stepId, err] = checkId("step", (await context.params).id);
  if (err) return err;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = templateStepSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: z.flattenError(result.error) },
      { status: 400 }
    );
  }

  const validBody = result.data;
  const newPos = validBody.position;

  try {
    if (newPos !== undefined) {
      const current = await prisma.templateStep.findUnique({
        where: { id: stepId },
        select: { position: true, processTemplateId: true },
      });

      if (!current) {
        return NextResponse.json({ error: "Template step not found" }, { status: 404 });
      }

      if (newPos !== current.position) {
        const updated = await prisma.$transaction(async (tx) => {
          const conflict = await tx.templateStep.findFirst({
            where: {
              processTemplateId: current.processTemplateId,
              position: newPos,
              id: { not: stepId },
            },
          });

          if (conflict) throw new Error(`Position ${newPos} already exists.`);

          return tx.templateStep.update({
            where: { id: stepId },
            data: { ...validBody, position: newPos },
          });
        });

        return NextResponse.json(updated);
      }
    }

    const updated = await prisma.templateStep.update({
      where: { id: stepId },
      data: validBody,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Update failed (position conflict?)", detail: e.message },
      { status: 409 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {

  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  const [stepId, err] = checkId("step", (await context.params).id);
  if (err) return err;

  await prisma.templateStep.delete({ where: { id: stepId } });

  return NextResponse.json({ success: true });
}