import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { serverError } from "@/utils/responses";

// GET /api/step-executions/status-counts
// Live snapshot of how many tasks (StepExecution rows) are in each state.
// Not started = PENDING + BLOCKED. SKIPPED steps are left out.
export async function GET() {
  try {
    // groupBy = SQL "GROUP BY status": the database counts, so only a few rows come back.
    const rows = await prisma.stepExecution.groupBy({ by: ["status"], _count: { _all: true } });
    const count = (status: string) => rows.find((r) => r.status === status)?._count._all ?? 0;

    return NextResponse.json({
      notStarted: count("PENDING") + count("BLOCKED"),
      inProgress: count("IN_PROGRESS"),
      done: count("DONE"),
    });
  } catch (e) {
    return serverError("step execution status counts", "fetch", e);
  }
}
