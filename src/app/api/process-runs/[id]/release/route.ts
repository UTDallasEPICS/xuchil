import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ReservationStatus } from "@prisma/client";
import { idError, notFoundError, serverError } from "@/utils/responses";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const runId = parseInt((await context.params).id);
  if (isNaN(runId)) {
    return idError("process run");
  }

  try {
    const run = await prisma.processRun.findUnique({
      where: { id: runId },
      select: { id: true },
    });
    if (!run) {
      return notFoundError("process run");
    }

    const released = await prisma.materialReservation.updateMany({
      where: { processRunId: runId, status: ReservationStatus.RESERVED },
      data: { status: ReservationStatus.RELEASED, releasedAt: new Date() },
    });

    return NextResponse.json({ released: released.count });
  } catch (error) {
    return serverError("material reservation", "release", error);
  }
}
