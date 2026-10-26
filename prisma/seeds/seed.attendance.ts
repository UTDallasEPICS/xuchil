import { PrismaClient } from '@prisma/client';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const prisma = new PrismaClient();

const SAMPLE_SHIFTS = [
  { startedAt: '2025-11-17T08:00:00.000Z', endedAt: '2025-11-17T16:00:00.000Z' },
  { startedAt: '2025-11-18T08:15:00.000Z', endedAt: '2025-11-18T16:30:00.000Z' },
  { startedAt: '2025-11-19T07:45:00.000Z', endedAt: '2025-11-19T15:45:00.000Z' },
] as const;

export async function seedAttendance(client: PrismaClient): Promise<number> {
  const workers = await client.worker.findMany({
    select: { id: true },
    orderBy: { id: 'asc' },
  });

  if (workers.length === 0) {
    console.log('No workers found; attendance seed skipped.');
    return 0;
  }

  const workerIds = workers.map(({ id }) => id);
  const existingShifts = await client.workerShift.findMany({
    where: {
      workerId: { in: workerIds },
      startedAt: {
        gte: new Date(SAMPLE_SHIFTS[0].startedAt),
        lt: new Date('2025-11-20T00:00:00.000Z'),
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
    SAMPLE_SHIFTS.filter(({ startedAt }) =>
      !existingKeys.has(`${workerId}:${startedAt}`),
    ).map(({ startedAt, endedAt }) => ({
      workerId,
      startedAt: new Date(startedAt),
      endedAt: new Date(endedAt),
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
