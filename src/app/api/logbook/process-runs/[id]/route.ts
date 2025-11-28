import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/db';
import {idError, notFoundError, serverError} from "@/utils/responses";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const processRunId = parseInt((await context.params).id);
  if (isNaN(processRunId)) {
    return idError('process run')
  }
  try {
    const processRun = await prisma.processRun.findUnique({
      where: {id: processRunId},
      include: {
        productVariant: {select: {name: true}},
        processTemplate: {select: {name: true, version: true}},
        creator: {select: {id: true, fullName: true}},
        plannedUnit: {select: {name: true}},
        outputUnit: {select: {name: true}},
        processPauses: {select: {startedAt: true, endedAt: true, reason: true}},
        stepExecutions: {
          orderBy: {templateStep: {position: 'asc'}},
          include: {
            templateStep: {select: {name: true, position: true}},
            worker: {select: {id: true, fullName: true}},
            stepParticipants: {
              include: {
                worker: {select: {id: true, fullName: true}},
                guest: {select: {id: true, displayName: true}}
              }
            }
          }
        }
      }
    })

    if (!processRun) {
      return notFoundError('process run')
    }
    return NextResponse.json(processRun);
  } catch (e) {
    return serverError('process run', 'fetch', e)
  }
}