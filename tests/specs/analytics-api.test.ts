import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {SignJWT} from 'jose';
import {PrismaClient} from '@prisma/client';

// Access rules for the analytics endpoints, checked against a RUNNING dev server and dev.db.
// Skipped (not failed) when no server answers at BASE_URL.
// Sessions are signed here with SESSION_SECRET from .env, the same way /api/auth/login does,
// so no passwords are needed. Needs at least one active admin and one active worker login.
if (existsSync('.env')) process.loadEnvFile('.env');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const COOKIE = process.env.SESSION_COOKIE_NAME || 'session';

type Login = {id: number; workerId: number | null};

async function cookieFor(user: Login): Promise<string> {
  const key = new TextEncoder().encode(process.env.SESSION_SECRET);
  // isAdmin in the cookie is deliberately false: the server must read the real value from the DB.
  const token = await new SignJWT({authUserId: user.id, workerId: user.workerId, isAdmin: false})
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(key);
  return `${COOKIE}=${token}`;
}

async function get(path: string, cookie?: string) {
  return fetch(BASE_URL + path, {headers: cookie ? {cookie} : {}, redirect: 'manual'});
}

describe('analytics API access', function () {
  const prisma = new PrismaClient();
  let admin: string;
  let worker: string;
  let workerLogin: Login;

  before(async function () {
    try {
      await fetch(BASE_URL + '/api/health');
    } catch {
      this.skip();
    }
    const adminLogin = await prisma.authUser.findFirstOrThrow({where: {isAdmin: true, isActive: true}});
    workerLogin = await prisma.authUser.findFirstOrThrow({where: {isAdmin: false, isActive: true, workerId: {not: null}}});
    admin = await cookieFor(adminLogin);
    worker = await cookieFor(workerLogin);
  });

  after(() => prisma.$disconnect());

  it('rejects requests without a login', async () => {
    for (const path of ['/api/step-executions/status-counts', '/api/process-runs/production-waste']) {
      assert.equal((await get(path)).status, 401, path);
    }
  });

  it('lets both admins and workers open the /analytics page', async () => {
    assert.equal((await get('/analytics', admin)).status, 200);
    assert.equal((await get('/analytics', worker)).status, 200);
  });

  it('gives a worker only their own task counts', async () => {
    const res = await get('/api/step-executions/status-counts', worker);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body.workers.map((w: {id: number}) => w.id), [workerLogin.workerId]);
    for (const row of body.counts) assert.equal(row.workerId, workerLogin.workerId);

    const expected = await prisma.stepExecution.count({where: {workerId: workerLogin.workerId}});
    const total = body.counts.reduce((sum: number, row: {count: number}) => sum + row.count, 0);
    assert.equal(total, expected);
  });

  it('gives an admin every worker and every task', async () => {
    const res = await get('/api/step-executions/status-counts', admin);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.workers.length, await prisma.worker.count());
    const total = body.counts.reduce((sum: number, row: {count: number}) => sum + row.count, 0);
    assert.equal(total, await prisma.stepExecution.count());
  });

  it('blocks workers from production/merma data', async () => {
    assert.equal((await get('/api/process-runs/production-waste', worker)).status, 403);
  });

  it('gives an admin every batch finished in the last 31 days, and only finished ones', async () => {
    const res = await get('/api/process-runs/production-waste', admin);
    assert.equal(res.status, 200);
    const runs = await res.json();
    // Same 31-day window as the route (widest filter is 30 days, plus one for time zones).
    const since = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    assert.equal(runs.length, await prisma.processRun.count({where: {status: 'COMPLETED', finishedAt: {gte: since}}}));
    for (const run of runs) {
      assert.ok('goodOutputQty' in run && 'scrapQty' in run && 'finishedAt' in run);
      assert.ok(run.productVariant?.name, 'each batch names its product');
    }
  });
});
