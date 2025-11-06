import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST /api/template-steps/:id/steps  (id = processTemplateId)
// body: { name, position?, idealDurationMin?, requiresInput?, instructions? }
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;        
  const processTemplateId = Number(id);
  if (Number.isNaN(processTemplateId)) {
    return NextResponse.json({ error: 'Invalid templateId' }, { status: 400 });
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