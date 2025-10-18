import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// PUT /api/template-steps/:id  (id = stepId)
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }  
) {
  const { id } = await ctx.params;          
  const stepId = Number(id);
  if (Number.isNaN(stepId)) return NextResponse.json({ error: 'Invalid stepId' }, { status: 400 });

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

// DELETE /api/template-steps/:id  (id = stepId)
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }   // 👈 async params
) {
  const { id } = await ctx.params;           // 👈 await it
  const stepId = Number(id);
  if (Number.isNaN(stepId)) return NextResponse.json({ error: 'Invalid stepId' }, { status: 400 });

  await prisma.templateStep.delete({ where: { id: stepId } });
  return NextResponse.json({ success: true });
}