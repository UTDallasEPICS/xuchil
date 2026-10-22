import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { serverError } from "@/utils/responses";
import { verifySession } from "@/lib/session";

// Widest filter on the page is "mes" (30 days); one extra day covers time zone differences.
const WINDOW_MS = 31 * 24 * 60 * 60 * 1000;

// GET /api/process-runs/production-waste
// Batches finished in the last 31 days, with how much good product came out and how much was lost (merma).
// The analytics page groups them by product and time window itself. Admins only:
// a batch only records who started it, not who finished it, so it can't be fairly
// credited to one worker. Store a finishedByWorkerId on finish to offer a per-worker view.
export async function GET() {
  const payload = await verifySession();
  if (!payload?.isAdmin) {
    return new NextResponse(null, { status: 403 });
  }

  try {
    const runs = await prisma.processRun.findMany({
      where: { status: "COMPLETED", finishedAt: { gte: new Date(Date.now() - WINDOW_MS) } },
      select: {
        id: true,
        finishedAt: true,
        goodOutputQty: true,
        scrapQty: true,
        productVariant: { select: { id: true, name: true } },
        outputUnit: { select: { name: true } },
      },
    });
    return NextResponse.json(runs);
  } catch (e) {
    return serverError("production waste", "fetch", e);
  }
}
