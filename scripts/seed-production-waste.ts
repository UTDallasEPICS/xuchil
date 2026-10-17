#!/usr/bin/env tsx
/**
 * Test data for the "Producción y merma" and task sections of /analytics.
 * Creates ProcessRuns (with their steps) dated relative to today, all with batchCode "TEST-MERMA-...".
 * Batches are split between WORKER (sees only theirs) and ADMIN_WORKER.
 *
 * Uso:
 *   pnpm tsx scripts/seed-production-waste.ts           # borra los de prueba anteriores y los vuelve a crear
 *   pnpm tsx scripts/seed-production-waste.ts --remove  # solo los borra
 *
 * Expected on /analytics (as admin):
 *   hoy    -> Harina de Maíz 20/2 kg, Frijol Negro 9/1 kg; cards 29 kg, 3 kg, 9.4%
 *   semana -> Harina de Maíz 50/5 kg, Frijol Negro 9/1 kg; cards 59 kg, 6 kg, 9.2%
 *   mes    -> adds Sustituto de Café 50/5 kg and Galletas de Mezquite 100/4 unidad;
 *             mixed units, so the 3 cards are hidden and only the table shows (4 rows)
 *   The 60-day-old batch must not show in any filter.
 *   Every filter also shows "1 lote terminado no tiene peso o merma registrados; no se cuentan."
 *   (TEST-MERMA-SIN-DATOS: finished, no weights entered, left out of the totals above).
 *
 * Expected for the worker login (WORKER, ken@gmail.com in the current dev.db):
 *   only "Mis tareas", with the counts this script prints when it runs; no merma section.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PREFIX = "TEST-MERMA-";
const HOUR_MS = 1000 * 60 * 60;
const DAY_MS = HOUR_MS * 24;
// Worker ids from the current dev.db: 6 = "testing who knows" (ken@gmail.com, not admin),
// 1 = the admin's worker. Change these if your database has different ids.
const WORKER = 6;
const ADMIN_WORKER = 1;

// productVariantId, unitId, good output, scrap, how long ago it finished, who started it
const RUNS = [
  { variant: 3, unit: 1, good: 20, scrap: 2, agoMs: HOUR_MS, by: WORKER }, // Harina de Maíz, today
  { variant: 9, unit: 1, good: 9, scrap: 1, agoMs: HOUR_MS, by: ADMIN_WORKER }, // Frijol Negro, today
  { variant: 3, unit: 1, good: 30, scrap: 3, agoMs: 3 * DAY_MS, by: WORKER }, // Harina de Maíz, this week
  { variant: 6, unit: 5, good: 100, scrap: 4, agoMs: 10 * DAY_MS, by: ADMIN_WORKER }, // Galletas de Mezquite (unidad), this month
  { variant: 11, unit: 1, good: 50, scrap: 5, agoMs: 20 * DAY_MS, by: ADMIN_WORKER }, // Sustituto de Café, this month
  { variant: 3, unit: 1, good: 999, scrap: 999, agoMs: 60 * DAY_MS, by: WORKER }, // too old: must never show
];

async function removeTestData() {
  const testRuns = { processRun: { batchCode: { startsWith: PREFIX } } };
  // Steps point at their run, so they must go first (foreign key).
  await prisma.stepExecution.deleteMany({ where: testRuns });
  const removed = await prisma.processRun.deleteMany({ where: { batchCode: { startsWith: PREFIX } } });
  console.log(`Borrados ${removed.count} lotes de prueba`);
}

// One StepExecution per template step. stepStatus picks each step's status by its position.
async function createRun(
  batchCode: string,
  variant: number,
  by: number,
  stepStatus: (index: number) => "PENDING" | "IN_PROGRESS" | "BLOCKED" | "DONE",
  data: object,
) {
  const template = await prisma.processTemplate.findFirstOrThrow({
    where: { productVariantId: variant },
    include: { templateSteps: { orderBy: { position: "asc" } } },
  });
  await prisma.processRun.create({
    data: {
      ...data,
      batchCode,
      productVariantId: variant,
      processTemplateId: template.id,
      createdByWorkerId: by,
      stepExecutions: {
        create: template.templateSteps.map((step, i) => ({
          templateStepId: step.id,
          workerId: by,
          status: stepStatus(i),
        })),
      },
    },
  });
}

async function main() {
  await removeTestData();
  if (process.argv.includes("--remove")) return;

  const now = Date.now();
  for (const [i, r] of RUNS.entries()) {
    const finishedAt = new Date(now - r.agoMs);
    await createRun(`${PREFIX}${i + 1}`, r.variant, r.by, () => "DONE", {
      status: "COMPLETED",
      startedAt: new Date(finishedAt.getTime() - 2 * HOUR_MS),
      finishedAt,
      plannedQty: r.good + r.scrap,
      plannedUnitId: r.unit,
      goodOutputQty: r.good,
      scrapQty: r.scrap,
      outputUnitId: r.unit,
    });
  }
  // Finished today but nobody entered the weights: must be left out of the totals, not counted as 0.
  await createRun(`${PREFIX}SIN-DATOS`, 9, ADMIN_WORKER, () => "DONE", {
    status: "COMPLETED",
    startedAt: new Date(now - 3 * HOUR_MS),
    finishedAt: new Date(now - HOUR_MS),
    plannedQty: 10,
    plannedUnitId: 1,
  });
  // A batch the worker is still on: step 1 in progress, the rest not started.
  await createRun(`${PREFIX}EN-CURSO`, 3, WORKER, (i) => (i === 0 ? "IN_PROGRESS" : "PENDING"), {
    status: "IN_PROGRESS",
    startedAt: new Date(now - HOUR_MS),
    plannedQty: 10,
    plannedUnitId: 1,
  });
  // A batch the worker paused on step 1 (pause sets the step to BLOCKED and the run to PAUSED).
  await createRun(`${PREFIX}EN-PAUSA`, 3, WORKER, (i) => (i === 0 ? "BLOCKED" : "PENDING"), {
    status: "PAUSED",
    startedAt: new Date(now - HOUR_MS),
    plannedQty: 10,
    plannedUnitId: 1,
  });
  console.log(`Creados ${RUNS.length + 3} lotes de prueba`);

  const mine = await prisma.stepExecution.groupBy({
    by: ["status"],
    where: { workerId: WORKER },
    _count: { _all: true },
  });
  console.log(`Tareas del trabajador ${WORKER} (todas, no solo las de prueba):`, mine.map((m) => `${m.status}=${m._count._all}`).join(", "));
}

main().finally(() => prisma.$disconnect());
