import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { templateStepSchema } from '@/lib/schemas';
import { z } from "zod";
import {idError, serverError, validationError} from "@/utils/responses";
import {verifySession} from "@/lib/session";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  const processTemplateId = parseInt((await context.params).id);
  if (isNaN(processTemplateId)) {
    return idError('process template')
  }
  const body = await req.json();
  const result = templateStepSchema.safeParse(body);
  if(!result.success){
    return validationError("template step", result.error);
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
  } catch (e) {
    return serverError("template step", "create", e)
  }
}