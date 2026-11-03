import { PrismaClient } from '@prisma/client';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { currentAttendanceDate, dateOnlyToUtc } from '../../src/lib/attendance';

const prisma = new PrismaClient();

const SHIFT_TIMES = [
  { start: [8, 0], end: [16, 0] },
  { start: [8, 15], end: [16, 30] },
  { start: [7, 45], end: [15, 45] },
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function buildSampleShifts(now = new Date()) {
  const today = currentAttendanceDate(now);
  const shifts: { startedAt: Date; endedAt: Date }[] = [];
  for (let offset = 1; shifts.length < SHIFT_TIMES.length; offset++) {
    const day = new Date(today.getTime() - offset * DAY_MS);
    const weekday = day.getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    const midnight = dateOnlyToUtc(day).getTime();
    const { start, end } = SHIFT_TIMES[shifts.length];
    shifts.push({
      startedAt: new Date(midnight + (start[0] * 60 + start[1]) * 60000),
      endedAt: new Date(midnight + (end[0] * 60 + end[1]) * 60000),
    });
  }
  return shifts;
}

export async function seedAttendance(client: PrismaClient): Promise<number> {
  const workers = await client.worker.findMany({
    select: { id: true },
    orderBy: { id: 'asc' },
  });

  if (workers.length === 0) {
    console.log('No workers found; attendance seed skipped.');
    return 0;
  }

  const sampleShifts = buildSampleShifts();
  const workerIds = workers.map(({ id }) => id);
  const existingShifts = await client.workerShift.findMany({
    where: {
      workerId: { in: workerIds },
      startedAt: {
        gte: new Date(Math.min(...sampleShifts.map(({ startedAt }) => startedAt.getTime()))),
        lte: new Date(Math.max(...sampleShifts.map(({ startedAt }) => startedAt.getTime()))),
      },
    },
    select: { workerId: true, startedAt: true },
  });
  const existingKeys = new Set(
    existingShifts.map(
      ({ workerId, startedAt }) => `${workerId}:${startedAt.toISOString()}`,
    ),
  );

  const shiftsToCreate = workers.flatMap(({ id: workerId }) =>
    sampleShifts.filter(({ startedAt }) =>
      !existingKeys.has(`${workerId}:${startedAt.toISOString()}`),
    ).map(({ startedAt, endedAt }) => ({
      workerId,
      startedAt,
      endedAt,
    })),
  );

  if (shiftsToCreate.length > 0) {
    await client.workerShift.createMany({ data: shiftsToCreate });
  }

  console.log(
    `Attendance seed complete: ${shiftsToCreate.length} shift(s) created for ${workers.length} worker(s).`,
  );
  return shiftsToCreate.length;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  seedAttendance(prisma)
    .catch((error) => {
      console.error('Attendance seed failed:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
