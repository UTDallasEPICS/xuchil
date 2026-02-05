import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/db';
import {idError, notFoundError, serverError} from "@/utils/responses";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const stepExecutionId = parseInt((await context.params).id);
  if (isNaN(stepExecutionId)) {
    return idError('task')
  }
  try {
    const stepExecution = await prisma.stepExecution.findUnique({
      where: {id: stepExecutionId},
      include: {
        processRun: {include: {productVariant: {select: {name: true}}}},
        templateStep: {include: {processTemplate: {select: {id: true, name: true}}}},
        stepMaterialUsages: {include: {rawMaterial: true, inventoryLot: true, unit: true}},
        worker: {select: {id: true, fullName: true}},
        stepParticipants: {
          include: {
            worker: {select: {id: true, fullName: true}},
            guest: {select: {id: true, displayName: true}}
          }
        },
        inventoryMovements: true
      }
    })

    if (!stepExecution) {
      return notFoundError('task')
    }
    return NextResponse.json(stepExecution);
  } catch (e) {
    return serverError('task', 'fetch', e);
  }
}