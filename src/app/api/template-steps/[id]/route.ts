import {NextResponse} from 'next/server';
import prisma from '@/lib/db';
import {templateStepSchema} from '@/lib/schemas';
import {idError, serverError, validationError} from "@/utils/responses";
import {verifySession} from "@/lib/session";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }
  const stepId = parseInt((await context.params).id);
  if (isNaN(stepId)) {
    return idError('template step')
  }
  const body = await req.json()
  const result = templateStepSchema.safeParse(body);
  if (!result.success) {
    return validationError('template step', result.error);
  }
  // materials are handled separately; the rest are scalar columns to update.
  const { materials, ...stepData } = result.data;
  const newPosition = stepData.position;

  try {
    // Guard against position collisions before writing.
    if (newPosition !== undefined) {
      const currentStep = await prisma.templateStep.findUnique({
        where: {id: stepId},
        select: {position: true, processTemplateId: true}
      });
      if (!currentStep) {
        return NextResponse.json({error: 'Template step not found.'}, {status: 404});
      }
      if (newPosition !== currentStep.position) {
        const conflictingStep = await prisma.templateStep.findFirst({
          where: {
            processTemplateId: currentStep.processTemplateId,
            position: newPosition,
            id: {not: stepId}
          }
        });
        if (conflictingStep) {
          return NextResponse.json({error: `Position ${newPosition} is already occupied.`}, {status: 409});
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.templateStep.update({
        where: {id: stepId},
        data: stepData,
      });

      // Replace the step's required materials when provided.
      if (materials !== undefined) {
        await tx.stepRequiredMaterial.deleteMany({ where: { templateStepId: stepId } });
        if (materials.length > 0) {
          await tx.stepRequiredMaterial.createMany({
            data: materials.map((m) => ({
              templateStepId: stepId,
              rawMaterialId: m.rawMaterialId,
              qtyPerUnitOutput: m.qtyPerUnitOutput,
              unitId: m.unitId,
            })),
          });
        }
      }
    });

    const updated = await prisma.templateStep.findUnique({
      where: {id: stepId},
      include: { stepRequiredMaterials: { include: { rawMaterial: true, unit: true } } },
    });
    return NextResponse.json(updated);
  } catch (e) {
    return serverError('template step', 'update', e)
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
  const stepId = parseInt((await context.params).id);
  if (isNaN(stepId)) {
    return idError('template step')
  }
  await prisma.templateStep.delete({where: {id: stepId}});
  return new NextResponse(null, {status: 204})
}