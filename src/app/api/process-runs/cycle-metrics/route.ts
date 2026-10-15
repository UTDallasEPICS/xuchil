import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { ProcessStatus } from "@prisma/client";
import { serverError } from "@/utils/responses";

function calculateMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10;
  }
  return Math.round(sorted[mid] * 10) / 10;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // '7d' | '30d' | '90d' | 'all'
    const mode = searchParams.get("mode") || "net";      // 'net' (deducts pauses) | 'gross' (includes pauses)

    // 1. Reporting period cutoff date
    let cutoffDate: Date | null = null;
    const now = new Date();
    if (period === "7d") cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (period === "30d") cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (period === "90d") cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // 2. Query active products with completed process runs
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        variants: {
          select: {
            processRuns: {
              where: {
                status: ProcessStatus.COMPLETED,
                ...(cutoffDate ? { finishedAt: { gte: cutoffDate } } : {}),
              },
              select: {
                id: true,
                batchCode: true,
                startedAt: true,
                finishedAt: true,
                processPauses: {
                  select: { startedAt: true, endedAt: true },
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    let totalQualifyingRuns = 0;
    let totalExcludedRuns = 0;

    // 3. Calculate results grouped by parent product
    const categories = products.map((prod) => {
      const allRuns = prod.variants.flatMap((v) => v.processRuns);
      const validDurations: number[] = [];

      for (const run of allRuns) {
        // Exclusion rule 1: Must have both start and finish timestamps
        if (!run.startedAt || !run.finishedAt) {
          totalExcludedRuns++;
          continue;
        }

        const start = new Date(run.startedAt).getTime();
        const end = new Date(run.finishedAt).getTime();

        // Exclusion rule 2: finishedAt must be strictly greater than startedAt
        if (isNaN(start) || isNaN(end) || end <= start) {
          totalExcludedRuns++;
          continue;
        }

        const grossMs = end - start;
        const grossMin = Math.round((grossMs / (1000 * 60)) * 10) / 10;

        // Exclusion rule 3: Gross duration must be at least 1 minute (excludes immediate/accidental clicks)
        if (grossMin < 1) {
          totalExcludedRuns++;
          continue;
        }

        // Calculate valid closed pauses
        let pauseMs = 0;
        for (const pause of run.processPauses) {
          if (pause.startedAt && pause.endedAt) {
            const pStart = new Date(pause.startedAt).getTime();
            const pEnd = new Date(pause.endedAt).getTime();
            if (!isNaN(pStart) && !isNaN(pEnd) && pEnd > pStart) {
              pauseMs += Math.min(pEnd - pStart, grossMs);
            }
          }
        }

        const pauseMin = Math.round((pauseMs / (1000 * 60)) * 10) / 10;

        // Exclusion rule 4: If pauses >= gross time, timing record is corrupted
        if (pauseMin >= grossMin) {
          totalExcludedRuns++;
          continue;
        }

        const netMin = Math.round((grossMin - pauseMin) * 10) / 10;
        const duration = mode === "gross" ? grossMin : netMin;

        if (duration > 0) {
          validDurations.push(duration);
        } else {
          totalExcludedRuns++;
        }
      }

      const count = validDurations.length;
      totalQualifyingRuns += count;

      // Handle products with 0 completed runs in this period
      if (count === 0) {
        return {
          category: prod.name,
          productId: prod.id,
          tasks: [
            {
              taskName: prod.name,
              min: 0,
              median: 0,
              average: 0,
              max: 0,
              count: 0,
              hasSufficientData: false,
              statusMessage: "Sin corridas completadas en este período",
            },
          ],
        };
      }

      validDurations.sort((a, b) => a - b);
      const min = validDurations[0];
      const max = validDurations[count - 1];
      const median = calculateMedian(validDurations);
      const sum = validDurations.reduce((acc, curr) => acc + curr, 0);
      const average = Math.round((sum / count) * 10) / 10;
      const hasSufficientData = count >= 3;

      return {
        category: prod.name,
        productId: prod.id,
        tasks: [
          {
            taskName: prod.name,
            min,
            median,
            average,
            max,
            count,
            hasSufficientData,
            statusMessage: hasSufficientData
              ? undefined
              : `Muestra limitada (N = ${count}, mínimo recomendado: 3)`,
          },
        ],
      };
    });

    return NextResponse.json({
      period,
      mode,
      unit: "minutos",
      totalQualifyingRuns,
      totalExcludedRuns,
      categories,
    });
  } catch (error) {
    return serverError("production cycle metrics", "fetch", error);
  }
}