import prisma from "@/lib/db";
import {ProcessStatus} from "@prisma/client";
import {NextResponse} from "next/server";
import {serverError} from "@/utils/responses";

export async function GET() {
  try {
    const activeRuns = await prisma.processRun.findMany({
      where: {
        status: {in: [ProcessStatus.IN_PROGRESS, ProcessStatus.PAUSED]},
      },
      include: {productVariant: true},
      orderBy: {startedAt: "desc"},
    });

    return NextResponse.json(activeRuns);
  } catch (error) {
    return serverError('process run', 'fetch pending', error)
  }
}
