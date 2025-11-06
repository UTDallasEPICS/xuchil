import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ProcessStatus, StepStatus } from "@prisma/client";

// GET /api/process-worker/process-runs
// Returns all "active" runs (IN_PROGRESS or PAUSED)
export async function GET() {
  try {
    const activeRuns = await prisma.processRun.findMany({
      where: {
        status: { in: [ProcessStatus.IN_PROGRESS, ProcessStatus.PAUSED] },
      },
      include: { productVariant: true },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json(activeRuns);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to list active runs", detail: error.message },
      { status: 500 }
    );
  }
}

// POST /api/process-worker/process-runs
// Body: { productVariantId: number, plannedQty: number }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productVariantId, plannedQty } = body;

    if (!productVariantId || !plannedQty) {
      return NextResponse.json(
        { error: "productVariantId and plannedQty are required" },
        { status: 400 }
      );
    }

    const template = await prisma.processTemplate.findFirst({
      where: { productVariantId, isActive: true },
      include: { templateSteps: true },
    });

    if (!template) {
      return NextResponse.json(
        { error: "No active process template found" },
        { status: 404 }
      );
    }

    const newRun = await prisma.processRun.create({
      data: {
        productVariantId,
        processTemplateId: template.id,
        plannedQty,
        batchCode: `BATCH-${Date.now()}`,
        status: ProcessStatus.IN_PROGRESS,
        startedAt: new Date(),
        stepExecutions: {
          create: template.templateSteps.map((s) => ({
            templateStep: { connect: { id: s.id } },
            status: StepStatus.PENDING,
          })),
        },
      },
      include: {
        stepExecutions: { include: { templateStep: true } },
        productVariant: true,
      },
    });

    return NextResponse.json(newRun, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to start process run", detail: error.message },
      { status: 500 }
    );
  }
}