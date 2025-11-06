import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { StepStatus } from "@prisma/client";

// POST /api/process-worker/step-executions/:stepId/:action
export async function POST(
  _req: Request,
  context: { params: Promise<{ stepId: string; action: string }> }
) {
  const { stepId, action } = await context.params;
  const id = Number(stepId);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid step ID" }, { status: 400 });
  }

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
      where: { id },
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