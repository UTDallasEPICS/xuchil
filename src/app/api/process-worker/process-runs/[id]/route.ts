import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {checkId} from "@/utils/responses";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const [runId, runIdError] = checkId('run', (await context.params).id)
  if (runIdError !== null) {
    return runIdError;
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