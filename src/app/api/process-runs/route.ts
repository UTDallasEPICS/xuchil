import {NextResponse} from "next/server";
import prisma from "@/lib/db";
import {StepStatus} from "@prisma/client";
import {processRunSchema} from "@/lib/schemas";
import {notFoundError, serverError, validationError} from "@/utils/responses";

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = processRunSchema.safeParse(body);
    if (!result.success) {
      return validationError("process run", result.error)
    }

    const validBody = result.data;

    const template = await prisma.processTemplate.findFirst({
      where: {id: validBody.processTemplateId, isActive: true},
      include: {templateSteps: true},
    });

    if (!template) {
      return notFoundError('process template')
    }

    const newRun = await prisma.processRun.create({
      data: {
        productVariantId: validBody.productVariantId,
        processTemplateId: validBody.processTemplateId,
        batchCode: `BATCH-${Date.now()}`,
        createdByWorkerId: validBody.createdByWorkerId,
        plannedQty: validBody.plannedQty,
        plannedUnitId: validBody.plannedUnitId,
        status: validBody.status,
        startedAt: validBody.startedAt,
        finishedAt: validBody.finishedAt,
        goodOutputQty: validBody.goodOutputQty,
        scrapQty: validBody.scrapQty,
        outputUnitId: validBody.outputUnitId,
        notes: validBody.notes,
        stepExecutions: {
          create: template.templateSteps.map((s) => ({
            templateStep: {connect: {id: s.id}},
            status: StepStatus.PENDING,
            workerId: validBody.createdByWorkerId,
          })),
        },
      },
      include: {
        stepExecutions: {include: {templateStep: true}},
        productVariant: true,
      },
    });

    return NextResponse.json(newRun, {status: 201});
  } catch (error) {
    return serverError('process run', 'create', error)
  }
}