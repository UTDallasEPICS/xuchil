import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { templateStepSchema } from '@/lib/schemas';
import { z } from "zod";
import {checkId} from "@/utils/responses";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const [stepId, stepIdError] = checkId('step', (await context.params).id)
  if (stepIdError !== null) {
    return stepIdError;
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
  const newPosition = validBody.position;

try {
    if (newPosition !== undefined) {
      
      const currentStep = await prisma.templateStep.findUnique({
        where: { id: stepId },
        select: { position: true, processTemplateId: true }
      });

      if (!currentStep) {
        return NextResponse.json({ error: 'Template step not found.' }, { status: 404 });
      }

      const templateId = currentStep.processTemplateId;
      
      if (newPosition !== currentStep.position) {
        
        const updated = await prisma.$transaction(async (tx) => {
          
          // --- STAGE 1: CHECK FOR CONFLICT ---
          const conflictingStep = await tx.templateStep.findFirst({
            where: {
              processTemplateId: templateId,
              position: newPosition,
              // Exclude the current step being updated, in case newPosition == oldPosition
              // However, the outer check (newPosition !== currentStep.position) should cover this.
              id: { not: stepId } 
            }
          });

          if (conflictingStep) {
            // If another step already occupies this position, throw an error.
            // This rolls back the transaction.
            throw new Error(`Position ${newPosition} is already occupied.`);
          }

          // --- STAGE 2: SET THE NEW POSITION ---
          return tx.templateStep.update({
            where: { id: stepId },
            data: { ...validBody, position: newPosition }
          });
        });
        
        return NextResponse.json(updated);
      }
    }

    // Standard update for non-position changes, or if position was provided but unchanged
    const updatedBody = { ...validBody };
    const updated = await prisma.templateStep.update({
      where: { id: stepId },
      data: updatedBody
    });
    return NextResponse.json(updated);
  }catch (e: any) {
    return NextResponse.json({ error: 'Update failed (position conflict?)', detail: e.message }, { status: 409 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const [stepId, stepIdError] = checkId('step', (await context.params).id)
  if (stepIdError !== null) {
    return stepIdError;
  }
  await prisma.templateStep.delete({ where: { id: stepId } });
  return NextResponse.json({ success: true });
}