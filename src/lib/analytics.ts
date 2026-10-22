// Pure analytics math for src/app/analytics/page.tsx: raw API data in, what the UI shows out.
// No React and no fetching here, so tests/specs/analytics.test.ts can check it directly.
// Functions that depend on today's date take an optional `now` so tests can pin the clock.

export type FilterType = "today" | "weekly" | "monthly";

// Shape of GET /api/orders. Prisma `Decimal` columns arrive as strings in JSON.
export interface RawOrder {
  id: number;
  status: "SCHEDULED" | "DELIVERED" | "CANCELLED";
  deliveredAt: string | null;
  orderItems: {
    quantity: string;
    productVariant: { id: number; name: string; imageUrl: string | null };
  }[];
}

// Shape of GET /api/inventory/summary (only the fields used here).
// New schema: stock lives on InventoryLot rows, not on InventoryItem.
export interface RawInventoryItem {
  id: number;
  itemType: "RAW" | "PRODUCT";
  rawMaterial: { name: string; defaultUnit: { name: string } | null } | null;
  productVariant: { name: string; defaultUnit: { name: string } | null } | null;
  inventoryLots: { id: number; qtyOnHand: string | null; expiryAt: string | null }[];
}

// Shape of GET /api/step-executions/status-counts.
export interface RawTaskData {
  counts: { workerId: number | null; status: string; count: number }[];
  workers: { id: number; fullName: string }[];
}
export interface TaskCounts { notStarted: number; inProgress: number; done: number }

// Shape of GET /api/process-runs/production-waste.
export interface RawRun {
  id: number;
  finishedAt: string | null;
  goodOutputQty: string | null;
  scrapQty: string | null;
  productVariant: { id: number; name: string };
  outputUnit: { name: string } | null;
}
export interface WasteRow { key: string; name: string; unit: string; produced: number; waste: number }

export interface OrderPoint { date: string; orderCount: number }
export interface TrendingItem { id: number; name: string; image: string; units: number }
export interface StockRow { key: string; name: string; daysLeft: number | null; quantity: number; unit: string }

const DAY_MS = 1000 * 60 * 60 * 24;
export const LOW_STOCK_LIMIT = 50; // same threshold as the old page
export const EXPIRY_WINDOW_DAYS = 5; // same threshold as the old page

export const FILTER_LABELS: Record<FilterType, string> = { today: "hoy", weekly: "semana", monthly: "mes" };

// --- pure helpers: raw API data -> what the UI shows ---

// Add up task counts for one worker ("all" = everyone, including unassigned tasks).
// Not started = PENDING + BLOCKED; SKIPPED is left out.
export function toTaskCounts(data: RawTaskData | null, workerId: number | "all"): TaskCounts | null {
  if (!data) return null;
  const totals: TaskCounts = { notStarted: 0, inProgress: 0, done: 0 };
  for (const row of data.counts) {
    if (workerId !== "all" && row.workerId !== workerId) continue;
    if (row.status === "PENDING" || row.status === "BLOCKED") totals.notStarted += row.count;
    else if (row.status === "IN_PROGRESS") totals.inProgress += row.count;
    else if (row.status === "DONE") totals.done += row.count;
  }
  return totals;
}

// Is this delivered order inside the selected time window?
export function inRange(deliveredAt: Date, filter: FilterType, now: Date): boolean {
  if (filter === "today") return deliveredAt.toDateString() === now.toDateString();
  const diffDays = (now.getTime() - deliveredAt.getTime()) / DAY_MS;
  return diffDays >= 0 && diffDays <= (filter === "weekly" ? 7 : 30);
}

function deliveredInRange(orders: RawOrder[], filter: FilterType, now: Date): (RawOrder & { deliveredAt: string })[] {
  return orders.filter(
    (o): o is RawOrder & { deliveredAt: string } =>
      o.status === "DELIVERED" && !!o.deliveredAt && inRange(new Date(o.deliveredAt), filter, now)
  );
}

// Count orders per hour (today) or per day (week/month).
export function toOrderPoints(orders: RawOrder[], filter: FilterType, now = new Date()): OrderPoint[] {
  const grouped: Record<string, number> = {};
  // Sort oldest-first so the object's keys (bars) come out in time order;
  // JS objects keep string keys in the order they were first added.
  const sorted = deliveredInRange(orders, filter, now).sort(
    (a, b) => new Date(a.deliveredAt).getTime() - new Date(b.deliveredAt).getTime()
  );
  for (const o of sorted) {
    const d = new Date(o.deliveredAt);
    const label =
      filter === "today"
        ? `${d.getHours().toString().padStart(2, "0")}:00`
        : d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" });
    grouped[label] = (grouped[label] || 0) + 1;
  }
  return Object.entries(grouped).map(([date, orderCount]) => ({ date, orderCount }));
}

// Top 4 product variants by units delivered.
export function toTrending(orders: RawOrder[], filter: FilterType, now = new Date()): TrendingItem[] {
  const grouped: Record<number, TrendingItem> = {};
  for (const o of deliveredInRange(orders, filter, now)) {
    for (const item of o.orderItems) {
      const v = item.productVariant;
      grouped[v.id] ??= { id: v.id, name: v.name, image: v.imageUrl || "/Xuchil.svg", units: 0 };
      grouped[v.id].units += Number(item.quantity);
    }
  }
  return Object.values(grouped).sort((a, b) => b.units - a.units).slice(0, 4);
}

// Merma as a share of everything that came out of the batch: waste / (good + waste).
export function wastePct(produced: number, waste: number): string {
  const total = produced + waste;
  return total === 0 ? "—" : `${((waste / total) * 100).toLocaleString("es-MX", { maximumFractionDigits: 1 })}%`;
}

// One row per product (and output unit) for batches finished in the selected window.
// Grouped by unit too, so kg and "unidad" are never added together.
export function toWaste(runs: RawRun[], filter: FilterType, now = new Date()): WasteRow[] {
  const grouped: Record<string, WasteRow> = {};
  for (const r of runs) {
    if (!r.finishedAt || !inRange(new Date(r.finishedAt), filter, now)) continue;
    const unit = r.outputUnit?.name ?? "";
    const key = `${r.productVariant.id}-${unit}`;
    grouped[key] ??= { key, name: r.productVariant.name, unit, produced: 0, waste: 0 };
    grouped[key].produced += Number(r.goodOutputQty ?? 0);
    grouped[key].waste += Number(r.scrapQty ?? 0);
  }
  return Object.values(grouped).sort((a, b) => b.waste - a.waste);
}

function itemName(item: RawInventoryItem): string {
  return item.rawMaterial?.name ?? item.productVariant?.name ?? `Artículo ${item.id}`;
}
function itemUnit(item: RawInventoryItem): string {
  return item.rawMaterial?.defaultUnit?.name ?? item.productVariant?.defaultUnit?.name ?? "";
}

// One row per LOT that still has stock and expires within 5 days (or already expired).
export function toExpiring(items: RawInventoryItem[], nowMs = Date.now()): StockRow[] {
  const rows: StockRow[] = [];
  for (const item of items) {
    for (const lot of item.inventoryLots) {
      const qty = Number(lot.qtyOnHand ?? 0);
      if (!lot.expiryAt || qty <= 0) continue;
      const daysLeft = Math.ceil((new Date(lot.expiryAt).getTime() - nowMs) / DAY_MS);
      if (daysLeft > EXPIRY_WINDOW_DAYS) continue;
      rows.push({ key: `lot-${lot.id}`, name: itemName(item), daysLeft, quantity: qty, unit: itemUnit(item) });
    }
  }
  return rows.sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));
}

// One row per ITEM whose lots add up to 50 or less.
export function toLowStock(items: RawInventoryItem[]): StockRow[] {
  return items
    .map((item) => ({
      key: `item-${item.id}`,
      name: itemName(item),
      daysLeft: null,
      quantity: item.inventoryLots.reduce((sum, lot) => sum + Number(lot.qtyOnHand ?? 0), 0),
      unit: itemUnit(item),
    }))
    .filter((row) => row.quantity <= LOW_STOCK_LIMIT)
    .sort((a, b) => a.quantity - b.quantity);
}
