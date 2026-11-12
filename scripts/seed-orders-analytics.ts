#!/usr/bin/env tsx
/**
 * Test data for the order sections of /analytics ("Pedidos por hora/día" and "Productos más vendidos").
 * Creates DELIVERED orders dated relative to now, all with clientName "TEST-PEDIDO-...".
 *
 * Uso:
 *   pnpm tsx scripts/seed-orders-analytics.ts           # borra los de prueba anteriores y los vuelve a crear
 *   pnpm tsx scripts/seed-orders-analytics.ts --remove  # solo los borra
 *
 * Expected on /analytics (test orders only; existing real orders may add to these):
 *   hoy    -> 8 orders spread over the last ~7 hours (fewer if run just after midnight)
 *   semana -> 8 + 10 = 18 orders
 *   mes    -> 18 + 12 = 30 orders
 *   Top products (mes): Harina de Maíz > Galletas de Chocolate > Frijol Negro > Sustituto de Café;
 *   Harina de Amaranto is 5th, so it must NOT show in the top 4.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PREFIX = "TEST-PEDIDO-";
const MIN_MS = 1000 * 60;
const DAY_MS = MIN_MS * 60 * 24;

// productVariantId -> quantity per order. Cycled through the orders below.
const BASKETS = [
  [{ variant: 3, qty: 5 }, { variant: 7, qty: 3 }], // Harina de Maíz + Galletas de Chocolate
  [{ variant: 3, qty: 4 }, { variant: 9, qty: 2 }], // Harina de Maíz + Frijol Negro
  [{ variant: 7, qty: 4 }, { variant: 11, qty: 2 }], // Galletas de Chocolate + Sustituto de Café
  [{ variant: 9, qty: 3 }, { variant: 2, qty: 1 }], // Frijol Negro + Harina de Amaranto
];

// How long ago each order was delivered.
function deliveryTimes(now: Date): Date[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  // Today: one order every ~50 minutes, never before midnight, so "hoy" stays on today's date.
  const today = Array.from({ length: 8 }, (_, i) => new Date(Math.max(now.getTime() - (5 + i * 50) * MIN_MS, startOfToday)));
  // This week: days 1–6, a few hours apart.
  const week = Array.from({ length: 10 }, (_, i) => new Date(now.getTime() - (1 + (i % 6)) * DAY_MS - i * 60 * MIN_MS));
  // This month: days 8–29.
  const month = Array.from({ length: 12 }, (_, i) => new Date(now.getTime() - (8 + i * 2) * DAY_MS));
  return [...today, ...week, ...month];
}

async function removeTestData() {
  const testOrders = { order: { clientName: { startsWith: PREFIX } } };
  // Items point at their order, so they must go first (foreign key).
  await prisma.orderItem.deleteMany({ where: testOrders });
  const removed = await prisma.order.deleteMany({ where: { clientName: { startsWith: PREFIX } } });
  console.log(`Borrados ${removed.count} pedidos de prueba`);
}

async function main() {
  await removeTestData();
  if (process.argv.includes("--remove")) return;

  const times = deliveryTimes(new Date());
  for (const [i, deliveredAt] of times.entries()) {
    await prisma.order.create({
      data: {
        clientName: `${PREFIX}${i + 1}`,
        deliveryDate: deliveredAt,
        status: "DELIVERED",
        deliveredAt,
        orderItems: { create: BASKETS[i % BASKETS.length].map((b) => ({ productVariantId: b.variant, quantity: b.qty })) },
      },
    });
  }
  console.log(`Creados ${times.length} pedidos de prueba`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
