import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {By, until} from 'selenium-webdriver';
import {SignJWT} from 'jose';
import {PrismaClient} from '@prisma/client';
import {getDriver, initDriver, navigateTo, quitDriver} from '../config';

// What each kind of user SEES on /analytics, in a real browser (Edge, via Selenium).
// Needs a running dev server; skipped when none answers at BASE_URL.
// Logs in by planting a signed session cookie (see analytics-api.test.ts), so no passwords.
if (existsSync('.env')) process.loadEnvFile('.env');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const COOKIE = process.env.SESSION_COOKIE_NAME || 'session';

const ADMIN_ONLY = ['pedidos entregados', 'Productos más vendidos', 'Producción y merma', 'Inventario'];

async function openAnalyticsAs(user: {id: number; workerId: number | null}): Promise<string> {
  const key = new TextEncoder().encode(process.env.SESSION_SECRET);
  const token = await new SignJWT({authUserId: user.id, workerId: user.workerId, isAdmin: false})
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(key);
  const driver = getDriver();
  await navigateTo('/login'); // a cookie can only be set for the site the browser is on
  await driver.manage().deleteAllCookies();
  await driver.manage().addCookie({name: COOKIE, value: token, path: '/'});
  await navigateTo('/analytics');
  // Wait on the whole page text: React splits "{title} (estado actual)" into separate text
  // nodes, so an XPath text() match misses it. The task cards show "—" until data loads.
  const bodyText = () => driver.findElement(By.css('body')).getText();
  await driver.wait(until.elementLocated(By.css('h1')), 20000);
  await driver.wait(async () => {
    const text = await bodyText();
    return text.includes('(estado actual)') && !text.includes('—\nsin iniciar');
  }, 20000);
  return bodyText();
}

describe('analytics page in the browser', function () {
  this.timeout(90000);
  const prisma = new PrismaClient();

  before(async function () {
    try {
      await fetch(BASE_URL + '/api/health');
    } catch {
      this.skip();
    }
    await initDriver();
  });

  after(async () => {
    await quitDriver();
    await prisma.$disconnect();
  });

  it('shows an admin every section, the worker slicer and the time filter', async () => {
    const login = await prisma.authUser.findFirstOrThrow({where: {isAdmin: true, isActive: true}});
    const text = await openAnalyticsAs(login);
    assert.ok(text.includes('Analíticas'));
    for (const section of ADMIN_ONLY) assert.ok(text.includes(section), `missing "${section}"`);
    assert.ok(text.includes('Trabajador:'), 'worker slicer');
    assert.ok(text.includes('semana'), 'time filter');
    assert.ok(!text.includes('No se pudieron cargar los datos'), 'load error shown');
  });

  it('shows a worker only their own tasks, with the right numbers', async () => {
    const login = await prisma.authUser.findFirstOrThrow({where: {isAdmin: false, isActive: true, workerId: {not: null}}});
    const text = await openAnalyticsAs(login);
    assert.ok(text.includes('Mis estadísticas'));
    assert.ok(text.includes('Mis tareas'));
    // Section headings only: the bottom nav bar also says "Inventario" and "Pedidos" for everyone.
    const headings = (await Promise.all((await getDriver().findElements(By.css('h2'))).map((h) => h.getText()))).join('\n');
    for (const section of ADMIN_ONLY) {
      assert.ok(!headings.includes(section), `worker should not see the "${section}" section`);
    }
    for (const control of ['Trabajador:', 'semana']) {
      assert.ok(!text.includes(control), `worker should not see "${control}"`);
    }
    assert.ok(!text.includes('No se pudieron cargar los datos'), 'load error shown');

    // Each of the five task cards must match the database for this worker.
    const cards = {PENDING: 'sin iniciar', IN_PROGRESS: 'en progreso', BLOCKED: 'en pausa', DONE: 'completadas', SKIPPED: 'omitidas'};
    for (const [status, label] of Object.entries(cards)) {
      const n = await prisma.stepExecution.count({where: {workerId: login.workerId, status: status as never}});
      assert.ok(text.includes(`${n}\n${label}`), `${label} = ${n}`);
    }
  });
});
