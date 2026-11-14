import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { StepStatus, ProcessStatus } from "@prisma/client";
import { idError, notFoundError, serverError } from "@/utils/responses";
import { processPauseSchema } from "@/lib/schemas";
import { consumeForStep, InsufficientStockError } from "@/lib/consumption";
import { z } from "zod";
import { verifySession } from "@/lib/session";

export async function POST(
  _req: Request,
  context: { params: Promise<{ stepId: string; action: string }> }
) {
  const stepId = parseInt((await context.params).stepId);
  if (isNaN(stepId)) {
    return idError('step execution')
  }
  const { action } = await context.params;
  const validActions = ["start", "pause", "resume", "finish"];
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const now = new Date();
    const payload = await verifySession();
    const workerId = payload?.workerId ?? null;

    const currentStep = await prisma.stepExecution.findUnique({
      where: { id: stepId },
      select: {
        status: true,
        startedAt: true,
        processRunId: true,
        templateStepId: true,
        workerId: true,
        processRun: { select: { status: true, createdByWorkerId: true } },
      },
    });

    if (!currentStep) {
      return notFoundError('step execution')
    }

    let newStatus: StepStatus;
    let updateData: { startedAt?: Date | null, finishedAt?: Date | null, actualDurationMin?: number | null } = {};
    let processRunId = currentStep.processRunId;
    let runStatus = currentStep.processRun.status;


    switch (action) {
      case "start": {
        if (currentStep.status !== StepStatus.PENDING) {
          return NextResponse.json({ error: "Step must be PENDING to start" }, { status: 400 });
        }

        // Optional per-step quantity adjustments for material consumption.
        let actualByMaterial: Map<number, { qty: number; unitId: number }> | undefined;
        try {
          const startBody = await _req.json();
          if (startBody && Array.isArray(startBody.materials)) {
            actualByMaterial = new Map();
            for (const m of startBody.materials) {
              if (
                typeof m?.rawMaterialId === "number" &&
                typeof m?.qty === "number" &&
                typeof m?.unitId === "number"
              ) {
                actualByMaterial.set(m.rawMaterialId, { qty: m.qty, unitId: m.unitId });
              }
            }
          }
        } catch {
          // body is optional
        }

        try {
          const updatedStep = await prisma.$transaction(async (tx) => {
            // Start or resume the process run as needed.
            if (runStatus === ProcessStatus.PLANNED || runStatus === ProcessStatus.PAUSED) {
              const runData: { status: typeof ProcessStatus.IN_PROGRESS; startedAt?: Date } = {
                status: ProcessStatus.IN_PROGRESS,
              };
              if (runStatus === ProcessStatus.PLANNED) {
                runData.startedAt = now;
              }
              const processRunUpdate = currentStep.processRun.createdByWorkerId == null && workerId
                ? { ...runData, createdByWorkerId: workerId }
                : runData;
              await tx.processRun.update({ where: { id: processRunId }, data: processRunUpdate });
              if (runStatus === ProcessStatus.PAUSED) {
                const openPause = await tx.processPause.findFirst({
                  where: { processRunId, endedAt: null },
                  orderBy: { startedAt: "desc" },
                });
                if (openPause) {
                  await tx.processPause.update({ where: { id: openPause.id }, data: { endedAt: now } });
                }
              }
            }

            // Consume reserved materials for this step (no-op if none reserved).
            await consumeForStep(tx, {
              stepExecutionId: stepId,
              processRunId,
              templateStepId: currentStep.templateStepId,
              now,
              actualByMaterial,
            });

            // Flip the step to IN_PROGRESS.
            return tx.stepExecution.update({
              where: { id: stepId },
              data: {
                status: StepStatus.IN_PROGRESS,
                ...(workerId ? { workerId } : {}),
                ...(currentStep.startedAt === null ? { startedAt: now } : {}),
              },
            });
          });

          return NextResponse.json(updatedStep);
        } catch (err) {
          if (err instanceof InsufficientStockError) {
            return NextResponse.json(
              {
                error: "No hay suficiente materia prima para iniciar el paso.",
                rawMaterialId: err.rawMaterialId,
                neededBase: err.neededBase,
                availableBase: err.availableBase,
              },
              { status: 409 }
            );
          }
          throw err;
        }
      }
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
        {
          const txOps = [];
          // Only change run status if it's not already paused
          if (runStatus !== ProcessStatus.PAUSED) {
            txOps.push(
              prisma.processRun.update({
                where: { id: processRunId },
                data: { status: ProcessStatus.PAUSED },
              })
            );
          }
          txOps.push(
            prisma.processPause.create({
              data: {
                processRunId: processRunId,
                startedAt: now,
                reason: validBody.reason,
              },
            })
          );
          await prisma.$transaction(txOps);
        }
        break;
      case "finish":
        if (currentStep.status !== StepStatus.IN_PROGRESS && currentStep.status !== StepStatus.BLOCKED) {
          return NextResponse.json({ error: "Step must be IN_PROGRESS or BLOCKED to finish" }, { status: 400 });
        }
        // If step was paused (BLOCKED), auto-close the pause and resume the run
        if (currentStep.status === StepStatus.BLOCKED) {
          const openPause = await prisma.processPause.findFirst({
            where: { processRunId, endedAt: null },
            orderBy: { startedAt: "desc" },
          });
          if (openPause) {
            await prisma.processPause.update({
              where: { id: openPause.id },
              data: { endedAt: now },
            });
          }
          if (runStatus === ProcessStatus.PAUSED) {
            await prisma.processRun.update({
              where: { id: processRunId },
              data: { status: ProcessStatus.IN_PROGRESS },
            });
          }
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

            const overlapStart = Math.max(startedAt ? startedAt.getTime() : 0, pauseStart);
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
  } catch (error) {
    return serverError('step execution', 'execute', error)
  }
}