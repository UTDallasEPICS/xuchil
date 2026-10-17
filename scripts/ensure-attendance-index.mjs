import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe(
    'CREATE UNIQUE INDEX IF NOT EXISTS "WorkerShift_one_open_per_worker" ON "WorkerShift" ("workerId") WHERE "endedAt" IS NULL;',
  );
} catch (error) {
  console.error('Failed to create the WorkerShift open-shift uniqueness index.');
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}