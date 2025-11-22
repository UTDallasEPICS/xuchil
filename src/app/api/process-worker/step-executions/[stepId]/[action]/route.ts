import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { StepStatus, ProcessStatus} from "@prisma/client";
import {checkId} from "@/utils/responses";
import { processPauseSchema } from "@/lib/schemas";
import { z } from "zod";

export async function POST(
  _req: Request,
  context: { params: Promise<{ stepId: string; action: string }> }
) {
  const [stepId, stepIdError] = checkId('step-execution', (await context.params).stepId)
  if (stepIdError !== null) {
    return stepIdError;
  }
  const { action } = await context.params;

  const validActions = ["start", "pause", "resume", "finish"];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const now = new Date();

    const currentStep = await prisma.stepExecution.findUnique({
      where: { id: stepId },
      select: { status: true, startedAt: true, processRunId: true, processRun: { select: {status: true } } },
    });

    if (!currentStep) {
      return NextResponse.json({ error: "Step execution not found" }, { status: 404 });
    }

    let newStatus: StepStatus;
    let updateData: { startedAt?: Date | null, finishedAt?: Date | null, actualDurationMin?: number | null } = {};
    let processRunId = currentStep.processRunId;
    let runStatus = currentStep.processRun.status;

    
    switch (action) {
      case "start":
        if (currentStep.status !== StepStatus.PENDING) {
          return NextResponse.json({ error: "Step must be PENDING to start" }, { status: 400 });
        }
        newStatus = StepStatus.IN_PROGRESS;
        if (currentStep.startedAt === null) {
          updateData.startedAt = now;
        }
        break;
      case "resume":
        if (runStatus !== ProcessStatus.PAUSED) {
          return NextResponse.json({ error: `Cannot resume process run in ${runStatus} status` }, { status: 400 });
        }
        if (currentStep.status !== StepStatus.BLOCKED) {
          return NextResponse.json({ error: "Step must be BLOCKED (paused) to resume" }, { status: 400 });
        }
        newStatus = StepStatus.IN_PROGRESS;
        
        const activePause = await prisma.processPause.findFirst({
          where: { processRunId: processRunId, endedAt: null },
          orderBy: { startedAt: "desc" },
        });
        if (!activePause) {
          return NextResponse.json({ error: "No active process pause record found" }, { status: 404 });
        }
        {
          await prisma.$transaction([
            prisma.processRun.update({
              where: { id: processRunId },
              data: { status: ProcessStatus.IN_PROGRESS },
            }),
            prisma.processPause.update({
              where: { id: activePause.id },
              data: { endedAt: now, },
            }),
          ]);
        }
        break;
      case "pause":
        if (runStatus !== ProcessStatus.IN_PROGRESS) {
          return NextResponse.json({ error: `Cannot pause process run in ${runStatus} status` }, { status: 400 });
        }
        if (currentStep.status !== StepStatus.IN_PROGRESS) {
          return NextResponse.json({ error: "Step must be IN_PROGRESS to pause" }, { status: 400 });
        }
        newStatus = StepStatus.BLOCKED;
        
        let body: unknown;
        try {
          body = await _req.json();
        } catch {
          return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const result = processPauseSchema.safeParse(body);
        if (!result.success) {
          const formattedErr = z.flattenError(result.error);
          return NextResponse.json({ error: "Invalid request body", details: formattedErr }, { status: 400 });
        }
        const validBody = result.data;
        await prisma.$transaction([
          prisma.processRun.update({
            where: { id: processRunId },
            data: { status: ProcessStatus.PAUSED },
          }),
          prisma.processPause.create({
            data: {
              processRunId: processRunId,
              startedAt: now,
              reason: validBody.reason,
            },
          }),
        ]);
        break;
      case "finish":
        if (currentStep.status !== StepStatus.IN_PROGRESS) {
          return NextResponse.json({ error: "Step must be IN_PROGRESS to finish" }, { status: 400 });
        }
        const startedAt = currentStep.startedAt;
        const finishedAt = now;

        const completedPauses = await prisma.processPause.findMany({
          where: { processRunId: processRunId, endedAt: { not: null } },
        });
        let totalPausedMs = 0; 
        for (const pause of completedPauses) {
          if (pause.endedAt && pause.startedAt) {
            const pauseStart = pause.startedAt.getTime();
            const pauseEnd = pause.endedAt.getTime();

            const overlapStart = Math.max(startedAt? startedAt.getTime() : 0, pauseStart);
            const overlapEnd = Math.min(finishedAt.getTime(), pauseEnd);

            if (overlapEnd > overlapStart) {
              const overLapDuration = overlapEnd - overlapStart;
              totalPausedMs += overLapDuration;
            }
          }
        }
        const totalTimeMs = finishedAt.getTime() - (currentStep.startedAt ? currentStep.startedAt.getTime() : now.getTime());
        const actualDurationMin = Math.round((totalTimeMs - totalPausedMs) / 60000);
        newStatus = StepStatus.DONE;
        updateData = { ...updateData, finishedAt: finishedAt, actualDurationMin: actualDurationMin };
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.stepExecution.update({
      where: { id: stepId },
      data: {
        status: newStatus,
        ...updateData
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update step status", detail: error.message },
      { status: 500 }
    );
  }
}