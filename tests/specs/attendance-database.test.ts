import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

describe('attendance database constraints', () => {
  const directory = mkdtempSync(join(tmpdir(), 'xuchil-attendance-'));
  const databasePath = join(directory, 'attendance.sqlite');
  const databaseUrl = `file:${databasePath}`;
  let prisma: import('@prisma/client').PrismaClient;

  before(async () => {
    const environment = {...process.env, DATABASE_URL: databaseUrl};
    execFileSync('node_modules/.bin/prisma', ['db', 'push', '--skip-generate'], {
      env: environment,
      stdio: 'inherit',
    });
    execFileSync('node', ['scripts/ensure-attendance-index.mjs'], {
      env: environment,
      stdio: 'inherit',
    });
    execFileSync('node', ['scripts/ensure-attendance-index.mjs'], {
      env: environment,
      stdio: 'inherit',
    });

    process.env.DATABASE_URL = databaseUrl;
    const {PrismaClient} = await import('@prisma/client');
    prisma = new PrismaClient();
  });

  after(async () => {
    await prisma.$disconnect();
    rmSync(directory, {recursive: true, force: true});
  });

  it('creates the partial unique index and rejects concurrent open shifts', async () => {
    const indexes = await prisma.$queryRaw<Array<{name: string; sql: string}>>`
      SELECT name, sql FROM sqlite_master
      WHERE type = 'index' AND name = 'WorkerShift_one_open_per_worker'
    `;
    assert.equal(indexes.length, 1);
    assert.match(indexes[0].sql, /WHERE "endedAt" IS NULL/);

    const worker = await prisma.worker.create({data: {fullName: 'Attendance Test Worker'}});
    const attempts = await Promise.allSettled([
      prisma.workerShift.create({data: {workerId: worker.id, startedAt: new Date()}}),
      prisma.workerShift.create({data: {workerId: worker.id, startedAt: new Date()}}),
    ]);
    assert.equal(attempts.filter((attempt) => attempt.status === 'fulfilled').length, 1);
    assert.equal(attempts.filter((attempt) => attempt.status === 'rejected').length, 1);

    const openShift = await prisma.workerShift.findFirstOrThrow({where: {workerId: worker.id, endedAt: null}});
    await prisma.workerShift.update({where: {id: openShift.id}, data: {endedAt: new Date()}});
    await assert.doesNotReject(
      prisma.workerShift.create({data: {workerId: worker.id, startedAt: new Date()}}),
    );
  });
});