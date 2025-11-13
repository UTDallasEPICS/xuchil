import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/db';
import {checkId} from "@/utils/responses";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const [stepExecutionId, stepExecutionIdError] = checkId('task', (await context.params).id);
  if (stepExecutionIdError !== null) {
    return stepExecutionIdError;
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
      return NextResponse.json({message: 'Step Execution not found'}, {status: 404});
    }
    return NextResponse.json({stepExecution, status: 200});
  } catch (e) {
    console.error('Error fetching Step Execution details: ', e);
    return NextResponse.json({message: 'Internal Server Error'}, {status: 500});
  }
}