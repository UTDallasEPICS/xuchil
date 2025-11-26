import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { templateStepSchema } from '@/lib/schemas';
import { z } from "zod";
import {checkId} from "@/utils/responses";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const [processTemplateId, processTemplateIdError] = checkId('process-template', (await context.params).id)
  if (processTemplateIdError !== null) {
    return processTemplateIdError;
  }

  let body: unknown;
  try {
    body = await req.json();
  }
  catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = templateStepSchema.safeParse(body);

    if(!result.success){
      const formattedErr = z.flattenError(result.error);
      return NextResponse.json({ error: "Invalid request body", details: formattedErr }, { status: 400 });
    }

  const validBody = result.data;

  // default position = max + 1
  let position = validBody.position;
  if (position === undefined) {
    const last = await prisma.templateStep.findFirst({
      where: { processTemplateId: validBody.processTemplateId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    position = (last?.position ?? 0) + 1;
  }
  position = position as number;

  try {
    const created = await prisma.templateStep.create({
      data: {
        processTemplateId: validBody.processTemplateId,
        name: validBody.name,
        position: position, // Use the calculated or provided position
        idealDurationMin: validBody.idealDurationMin,
        requiresInput: validBody.requiresInput,
        instructions: validBody.instructions,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Could not create step (position conflict or bad FK).', detail: e.message },
      { status: 409 }
    );
  }
}