import prisma from "@/lib/db";
import { ProcessStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { serverError } from "@/utils/responses";

export async function GET() {
  try {
    const activeRuns = await prisma.processRun.findMany({
      where: {
        status: { in: [ProcessStatus.PLANNED, ProcessStatus.IN_PROGRESS, ProcessStatus.PAUSED] },
      },
      include: {
        productVariant: {
          include: {
            product: true,
          },
        },
        creator: true,
        stepExecutions: {
          include: {
            templateStep: true,
            worker: true,
            stepParticipants: {
              include: {
                worker: true,
              },
            },
          },
          orderBy: { id: "asc" },
        },
        materialReservations: {
          include: { rawMaterial: true, unit: true },
        },
        processPauses: true,
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json(activeRuns);
  } catch (error) {
    return serverError('process run', 'fetch pending', error)
  }
}
