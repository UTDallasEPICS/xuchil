import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  ProcessStatus,
  MovementReason,
  MovementDirection,
} from "@prisma/client";

// POST /api/process-worker/process-runs/:id/finish
export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const runId = Number(id);

  if (Number.isNaN(runId)) {
    return NextResponse.json({ error: "Invalid run ID" }, { status: 400 });
  }

  try {
    const run = await prisma.processRun.findUnique({
      where: { id: runId },
      include: { stepExecutions: true },
    });

    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const incompleteSteps = run.stepExecutions.some(
      (s) => s.status !== "DONE"
    );

    if (incompleteSteps) {
      return NextResponse.json(
        { error: "Cannot finalize; some steps are incomplete" },
        { status: 400 }
      );
    }

    const finishedRun = await prisma.processRun.update({
      where: { id: runId },
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
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to finalize process run", detail: error.message },
      { status: 500 }
    );
  }
}