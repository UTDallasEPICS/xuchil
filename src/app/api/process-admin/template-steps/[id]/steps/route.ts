import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {checkId} from "@/utils/responses";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const [processTemplateId, processTemplateIdError] = checkId('process-template', (await context.params).id)
  if (processTemplateIdError !== null) {
    return processTemplateIdError;
  }

  const body = await req.json();
  if (!body?.name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  // default position = max + 1
  const last = await prisma.templateStep.findFirst({
    where: { processTemplateId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });
  const position = body.position ?? (last?.position ?? 0) + 1;

  try {
    const created = await prisma.templateStep.create({
      data: {
        processTemplateId,
        name: String(body.name),
        position,
        idealDurationMin: body.idealDurationMin ?? null,
        requiresInput: body.requiresInput ?? false,
        instructions: body.instructions ?? null,
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