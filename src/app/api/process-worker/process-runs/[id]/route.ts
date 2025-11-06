import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/process-worker/process-runs/:id
export async function GET(
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
      include: {
        productVariant: true,
        stepExecutions: {
          include: { templateStep: true, worker: true },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    return NextResponse.json(run);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to retrieve process run", detail: error.message },
      { status: 500 }
    );
  }
}