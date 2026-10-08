import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { serverError } from "@/utils/responses";
import { verifySession } from "@/lib/session";

// GET /api/step-executions/status-counts
// Live snapshot of how many tasks (StepExecution rows) each worker has in each state,
// plus the worker list for the analytics page's worker slicer. Admins only.
// The page adds the rows up itself, so switching workers needs no new request.
export async function GET() {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    // groupBy = SQL "GROUP BY workerId, status": the database counts, so only a few rows come back.
    // ponytail: counts StepExecution.workerId only, not StepParticipant helpers; add them if
    // shared steps start being recorded through participants.
    const [rows, workers] = await Promise.all([
      prisma.stepExecution.groupBy({ by: ["workerId", "status"], _count: { _all: true } }),
      prisma.worker.findMany({ select: { id: true, fullName: true }, orderBy: { fullName: "asc" } }),
    ]);

    return NextResponse.json({
      counts: rows.map((r) => ({ workerId: r.workerId, status: r.status, count: r._count._all })),
      workers,
    });
  } catch (e) {
    return serverError("step execution status counts", "fetch", e);
  }
}
