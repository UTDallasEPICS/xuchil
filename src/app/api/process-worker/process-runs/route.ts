import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ProcessStatus, StepStatus } from "@prisma/client";
import { processRunSchema } from "@/lib/schemas";
import { z } from "zod";

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
export async function POST(request: Request) {
  try {
    let body: unknown;
      try {
        body = await request.json();
      }
      catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
      }
    
      const result = processRunSchema.safeParse(body);
    
      if(!result.success){
        const formattedErr = z.flattenError(result.error);
        return NextResponse.json({ error: "Invalid request body", details: formattedErr }, { status: 400 });
      }
    
      const validBody = result.data;

    const template = await prisma.processTemplate.findFirst({
      where: { productVariantId: validBody.productVariantId, isActive: true },
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
        productVariantId: validBody.productVariantId,
        processTemplateId: validBody.processTemplateId,
        batchCode: `BATCH-${Date.now()}`,
        createdByWorkerId: validBody.createdByWorkerId,
        plannedQty: validBody.plannedQty,
        plannedUnitId: validBody.plannedUnitId,
        status: validBody.status,
        startedAt: validBody.startedAt,
        finishedAt: validBody.finishedAt,
        goodOutputQty: validBody.goodOutputQty,
        scrapQty: validBody.scrapQty,
        outputUnitId: validBody.outputUnitId,
        notes: validBody.notes,
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