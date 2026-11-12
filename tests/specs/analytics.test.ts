import assert from 'node:assert/strict';
import {
  inRange,
  toExpiring,
  toLowStock,
  toOrderPoints,
  toTaskCounts,
  toTrending,
  toWaste,
  countMissingWaste,
  wastePct,
  type RawInventoryItem,
  type RawOrder,
  type RawRun,
  type RawTaskData,
} from '../../src/lib/analytics';

// Every date below is relative to this fixed "now" (local time), so results never depend on
// the day the tests run.
const NOW = new Date(2026, 9, 15, 15, 0);
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

function order(id: number, deliveredAt: string | null, items: [number, string, string][] = [], status: RawOrder['status'] = 'DELIVERED'): RawOrder {
  return {
    id,
    status,
    deliveredAt,
    orderItems: items.map(([variantId, name, quantity]) => ({
      quantity,
      productVariant: {id: variantId, name, imageUrl: null},
    })),
  };
}

function run(id: number, finishedAt: string | null, variantId: number, name: string, good: string | null, scrap: string | null, unit: string | null = 'kg'): RawRun {
  return {
    id,
    finishedAt,
    goodOutputQty: good,
    scrapQty: scrap,
    productVariant: {id: variantId, name},
    outputUnit: unit ? {name: unit} : null,
  };
}

function rawItem(id: number, name: string, lots: {id: number; qty: string | null; expiryAt?: string | null}[]): RawInventoryItem {
  return {
    id,
    itemType: 'RAW',
    rawMaterial: {name, defaultUnit: {name: 'kg'}},
    productVariant: null,
    inventoryLots: lots.map((l) => ({id: l.id, qtyOnHand: l.qty, expiryAt: l.expiryAt ?? null})),
  };
}

describe('analytics: task counts (worker slicer)', () => {
  const data: RawTaskData = {
    counts: [
      {workerId: 1, status: 'PENDING', count: 2},
      {workerId: 1, status: 'BLOCKED', count: 1},
      {workerId: 1, status: 'IN_PROGRESS', count: 3},
      {workerId: 1, status: 'DONE', count: 4},
      {workerId: 1, status: 'SKIPPED', count: 9},
      {workerId: 2, status: 'DONE', count: 5},
      {workerId: null, status: 'PENDING', count: 7},
    ],
    workers: [{id: 1, fullName: 'Ana'}, {id: 2, fullName: 'Luis'}],
  };

  const counts = (pending: number, inProgress: number, paused: number, done: number, skipped: number) =>
    ({PENDING: pending, IN_PROGRESS: inProgress, BLOCKED: paused, DONE: done, SKIPPED: skipped});

  it('adds up everyone, including unassigned tasks, for "all"', () => {
    assert.deepEqual(toTaskCounts(data, 'all'), counts(9, 3, 1, 9, 9));
  });

  it('counts only the chosen worker', () => {
    assert.deepEqual(toTaskCounts(data, 1), counts(2, 3, 1, 4, 9));
    assert.deepEqual(toTaskCounts(data, 2), counts(0, 0, 0, 5, 0));
  });

  it('keeps each status in its own count and ignores unknown ones', () => {
    const only = (status: string) => toTaskCounts({counts: [{workerId: 1, status, count: 1}], workers: []}, 'all');
    assert.deepEqual(only('BLOCKED'), counts(0, 0, 1, 0, 0));
    assert.deepEqual(only('SKIPPED'), counts(0, 0, 0, 0, 1));
    assert.deepEqual(only('SOMETHING_NEW'), counts(0, 0, 0, 0, 0));
  });

  it('returns zeros for a worker with no tasks, and null before data loads', () => {
    assert.deepEqual(toTaskCounts(data, 99), counts(0, 0, 0, 0, 0));
    assert.equal(toTaskCounts(null, 'all'), null);
  });
});

describe('analytics: time window (hoy / semana / mes)', () => {
  it('"today" means the same calendar day, not the last 24 hours', () => {
    assert.equal(inRange(new Date(2026, 9, 15, 0, 5), 'today', NOW), true);
    assert.equal(inRange(new Date(2026, 9, 14, 23, 55), 'today', NOW), false);
  });

  it('"weekly" is the last 7 days and "monthly" the last 30, inclusive', () => {
    assert.equal(inRange(new Date(daysAgo(7)), 'weekly', NOW), true);
    assert.equal(inRange(new Date(daysAgo(7.5)), 'weekly', NOW), false);
    assert.equal(inRange(new Date(daysAgo(30)), 'monthly', NOW), true);
    assert.equal(inRange(new Date(daysAgo(31)), 'monthly', NOW), false);
  });

  it('excludes dates in the future', () => {
    assert.equal(inRange(new Date(NOW.getTime() + 3600_000), 'weekly', NOW), false);
  });
});

describe('analytics: orders chart and top products', () => {
  const orders = [
    order(1, hoursAgo(1), [[10, 'Harina', '2.5'], [11, 'Galletas', '1']]),
    order(2, hoursAgo(2), [[10, 'Harina', '1.5']]),
    order(3, daysAgo(3), [[12, 'Frijol', '4']]),
    order(4, daysAgo(40), [[13, 'Viejo', '100']]),
    order(5, hoursAgo(1), [[14, 'Cancelado', '50']], 'CANCELLED'),
    order(6, null, [[15, 'Programado', '50']], 'SCHEDULED'),
  ];

  it('counts only delivered orders, per hour for "today"', () => {
    const points = toOrderPoints(orders, 'today', NOW);
    // One bar per hour from 00:00 to the current hour (15:00), empty hours included.
    assert.equal(points.length, 16);
    assert.deepEqual(points[0], {date: '00:00', orderCount: 0});
    assert.deepEqual(points.slice(13), [
      {date: '13:00', orderCount: 1},
      {date: '14:00', orderCount: 1},
      {date: '15:00', orderCount: 0},
    ]);
  });

  it('counts per day, oldest first, with a bar for every day of the window', () => {
    const weekly = toOrderPoints(orders, 'weekly', NOW);
    assert.equal(weekly.length, 8); // today + the 7 days before, matching inRange
    assert.equal(weekly[4].orderCount, 1); // 3 days ago
    assert.equal(weekly[7].orderCount, 2); // today
    assert.equal(weekly.reduce((sum, p) => sum + p.orderCount, 0), 3);

    // Switching filter changes the x-axis, not just the counts.
    assert.equal(toOrderPoints(orders, 'monthly', NOW).length, 31);
  });

  it('adds up Decimal quantities (sent as strings) per product, biggest first', () => {
    assert.deepEqual(
      toTrending(orders, 'weekly', NOW).map((t) => [t.name, t.units]),
      [['Harina', 4], ['Frijol', 4], ['Galletas', 1]],
    );
  });

  it('keeps only the top 4 products and falls back to the logo image', () => {
    const many = [order(1, hoursAgo(1), [1, 2, 3, 4, 5].map((id) => [id, `P${id}`, String(id)] as [number, string, string]))];
    const top = toTrending(many, 'today', NOW);
    assert.deepEqual(top.map((t) => t.name), ['P5', 'P4', 'P3', 'P2']);
    assert.equal(top[0].image, '/Xuchil.svg');
  });
});

describe('analytics: production and waste (merma)', () => {
  it('computes merma as waste / (good + waste), and a dash when nothing came out', () => {
    assert.equal(wastePct(20, 2), '9.1%');
    assert.equal(wastePct(9, 1), '10%');
    assert.equal(wastePct(10, 0), '0%');
    assert.equal(wastePct(0, 0), '—');
  });

  const runs = [
    run(1, hoursAgo(1), 3, 'Harina de Maíz', '20', '2'),
    run(2, daysAgo(3), 3, 'Harina de Maíz', '30', '3'),
    run(3, hoursAgo(2), 9, 'Frijol Negro', '9', '1'),
    run(4, daysAgo(10), 6, 'Galletas', '100', '4', 'unidad'),
    run(5, daysAgo(60), 3, 'Harina de Maíz', '999', '999'),
    run(6, null, 3, 'Harina de Maíz', '500', '500'),
  ];

  it('groups batches by product inside the window, most waste first', () => {
    assert.deepEqual(
      toWaste(runs, 'weekly', NOW).map((r) => [r.name, r.produced, r.waste, r.unit]),
      [['Harina de Maíz', 50, 5, 'kg'], ['Frijol Negro', 9, 1, 'kg']],
    );
    assert.deepEqual(toWaste(runs, 'today', NOW).map((r) => r.produced), [20, 9]);
  });

  it('ignores batches that are too old or have no finish date', () => {
    const produced = toWaste(runs, 'monthly', NOW).reduce((sum, r) => sum + r.produced, 0);
    assert.equal(produced, 159);
  });

  it('never adds different units together', () => {
    const mixed = toWaste(
      [run(1, hoursAgo(1), 6, 'Galletas', '10', '1', 'kg'), run(2, hoursAgo(1), 6, 'Galletas', '100', '4', 'unidad')],
      'today',
      NOW,
    );
    assert.deepEqual(mixed.map((r) => [r.unit, r.produced]).sort(), [['kg', 10], ['unidad', 100]]);
  });

  it('leaves out batches missing a quantity instead of counting 0, and counts them', () => {
    const runs = [
      run(1, hoursAgo(1), 3, 'Harina', '20', null),
      run(2, hoursAgo(1), 3, 'Harina', null, '2'),
      run(3, hoursAgo(1), 3, 'Harina', '9', '1', null),
      run(4, daysAgo(60), 3, 'Harina', null, null),
    ];
    assert.deepEqual(toWaste(runs, 'today', NOW).map((r) => [r.produced, r.waste, r.unit]), [[9, 1, '']]);
    assert.equal(countMissingWaste(runs, 'today', NOW), 2);
  });
});

describe('analytics: inventory (expiring lots and low stock)', () => {
  const items = [
    rawItem(1, 'Maíz', [
      {id: 11, qty: '10', expiryAt: daysAgo(-2)},
      {id: 12, qty: '5', expiryAt: daysAgo(3)},
      {id: 13, qty: '7', expiryAt: daysAgo(-20)},
      {id: 14, qty: '0', expiryAt: daysAgo(-1)},
    ]),
    rawItem(2, 'Frijol', [{id: 21, qty: '30'}, {id: 22, qty: '20'}]),
    rawItem(3, 'Mezquite', [{id: 31, qty: '51'}]),
    rawItem(4, 'Vacío', []),
  ];

  it('lists lots that expire within 5 days or already expired, soonest first', () => {
    assert.deepEqual(
      toExpiring(items, NOW.getTime()).map((r) => [r.key, r.daysLeft]),
      [['lot-12', -3], ['lot-11', 2]],
    );
  });

  it('skips empty lots and lots without an expiry date', () => {
    const keys = toExpiring(items, NOW.getTime()).map((r) => r.key);
    assert.ok(!keys.includes('lot-14'));
    assert.ok(!keys.some((k) => k.startsWith('lot-2')));
  });

  it('flags items whose lots add up to 50 or less, including empty ones', () => {
    assert.deepEqual(
      toLowStock(items).map((r) => [r.name, r.quantity]),
      [['Vacío', 0], ['Maíz', 22], ['Frijol', 50]],
    );
  });
});
