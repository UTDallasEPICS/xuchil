import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { StepStatus } from "@prisma/client";
import {checkId} from "@/utils/responses";

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
    let newStatus: StepStatus;

    switch (action) {
      case "start":
      case "resume":
        newStatus = StepStatus.IN_PROGRESS;
        break;
      case "pause":
        newStatus = StepStatus.BLOCKED;
        break;
      case "finish":
        newStatus = StepStatus.DONE;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.stepExecution.update({
      where: { id: stepId },
      data: {
        status: newStatus,
        startedAt:
          action === "start" || action === "resume" ? now : undefined,
        finishedAt: action === "finish" ? now : undefined,
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