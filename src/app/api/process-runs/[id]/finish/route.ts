import {NextResponse} from "next/server";
import prisma from "@/lib/db";
import {
  ProcessStatus,
  MovementReason,
  MovementDirection,
} from "@prisma/client";
import {idError, notFoundError, serverError} from "@/utils/responses";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const runId = parseInt((await context.params).id);
  if (isNaN(runId)) {
    return idError('process run')
  }
  try {
    const run = await prisma.processRun.findUnique({
      where: {id: runId},
      include: {stepExecutions: true},
    });

    if (!run) {
      return notFoundError('process run')
    }

    const incompleteSteps = run.stepExecutions.some(
      (s) => s.status !== "DONE"
    );

    if (incompleteSteps) {
      return NextResponse.json(
        {error: "Cannot finalize; some steps are incomplete"},
        {status: 400}
      );
    }

    const finishedRun = await prisma.processRun.update({
      where: {id: runId},
      data: {
        status: ProcessStatus.COMPLETED,
        finishedAt: new Date(),
      },
    });

    // Optional inventory update logic (sample)
    await prisma.inventoryMovement.create({
      data: {
        inventoryLotId: 3, // Example lot for Croissant output
        direction: MovementDirection.IN,
        qty: run.plannedQty ?? 0,
        unitId: run.outputUnitId ?? 5,
        reason: MovementReason.COMPLETION_RUN,
        relatedProcessRunId: runId,
        movedAt: new Date(),
      },
    });

    return NextResponse.json(finishedRun);
  } catch (error) {
    return serverError('process run', 'finalize', error)
  }
}