import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {idError, notFoundError, serverError} from "@/utils/responses";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const runId = parseInt((await context.params).id);
  if (isNaN(runId)) {
    return idError('process run')
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
      return notFoundError('process run')
    }

    return NextResponse.json(run);
  } catch (error) {
    return serverError('process run', 'fetch', error)
  }
}