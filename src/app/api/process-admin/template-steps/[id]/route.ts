import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {checkId} from "@/utils/responses";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const [stepId, stepIdError] = checkId('step', (await context.params).id)
  if (stepIdError !== null) {
    return stepIdError;
  }

  const body = await req.json();
  try {
    const updated = await prisma.templateStep.update({
      where: { id: stepId },
      data: {
        name: body.name ?? undefined,
        position: body.position ?? undefined,
        idealDurationMin: body.idealDurationMin ?? undefined,
        requiresInput: typeof body.requiresInput === 'boolean' ? body.requiresInput : undefined,
        instructions: body.instructions ?? undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: 'Update failed (position conflict?)', detail: e.message }, { status: 409 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }  // 👈 async params
) {
  const [stepId, stepIdError] = checkId('step', (await context.params).id)
  if (stepIdError !== null) {
    return stepIdError;
  }
  await prisma.templateStep.delete({ where: { id: stepId } });
  return NextResponse.json({ success: true });
}