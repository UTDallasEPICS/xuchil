import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { templateStepSchema } from '@/lib/schemas';
import { z } from "zod";
import { checkId } from "@/utils/responses";
import { verifySession } from '@/lib/session';

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  const [processTemplateId, err] = checkId(
    "process-template",
    (await context.params).id
  );
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

  let position = validBody.position;
  if (position === undefined) {
    const last = await prisma.templateStep.findFirst({
      where: { processTemplateId: validBody.processTemplateId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    position = (last?.position ?? 0) + 1;
  }

  try {
    const created = await prisma.templateStep.create({
      data: {
        processTemplateId: validBody.processTemplateId,
        name: validBody.name,
        position,
        idealDurationMin: validBody.idealDurationMin,
        requiresInput: validBody.requiresInput,
        instructions: validBody.instructions,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Could not create step (position conflict or bad FK)",
        detail: e.message,
      },
      { status: 409 }
    );
  }
}