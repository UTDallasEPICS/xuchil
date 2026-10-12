"use client";
// Analytics page, ported from the old `dev` schema to the uao schema.
// Reads three endpoints:
//   GET /api/orders                          -> orders + orderItems + productVariant
//   GET /api/inventory/summary               -> inventoryItems + inventoryLots
//   GET /api/step-executions/status-counts   -> task counts by status
// All math happens here in the browser.
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Circle, Loader, Package, TrendingUp, X } from "lucide-react";
import HeaderXuchil from "@/components/HeaderXuchil";
import styles from "./Analytics.module.css";

type FilterType = "today" | "weekly" | "monthly";

// Shape of GET /api/orders. Prisma `Decimal` columns arrive as strings in JSON.
interface RawOrder {
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
interface RawInventoryItem {
  id: number;
  itemType: "RAW" | "PRODUCT";
  rawMaterial: { name: string; defaultUnit: { name: string } | null } | null;
  productVariant: { name: string; defaultUnit: { name: string } | null } | null;
  inventoryLots: { id: number; qtyOnHand: string | null; expiryAt: string | null }[];
}

// Shape of GET /api/step-executions/status-counts.
interface TaskCounts { notStarted: number; inProgress: number; done: number }

interface OrderPoint { date: string; orderCount: number }
interface TrendingItem { id: number; name: string; image: string; units: number }
interface StockRow { key: string; name: string; daysLeft: number | null; quantity: number; unit: string }

const DAY_MS = 1000 * 60 * 60 * 24;
const LOW_STOCK_LIMIT = 50; // same threshold as the old page
const EXPIRY_WINDOW_DAYS = 5; // same threshold as the old page

const FILTER_LABELS: Record<FilterType, string> = { today: "hoy", weekly: "semana", monthly: "mes" };

// --- pure helpers: raw API data -> what the UI shows ---

// Is this delivered order inside the selected time window?
function inRange(deliveredAt: Date, filter: FilterType, now: Date): boolean {
  if (filter === "today") return deliveredAt.toDateString() === now.toDateString();
  const diffDays = (now.getTime() - deliveredAt.getTime()) / DAY_MS;
  return diffDays >= 0 && diffDays <= (filter === "weekly" ? 7 : 30);
}

function deliveredInRange(orders: RawOrder[], filter: FilterType): (RawOrder & { deliveredAt: string })[] {
  const now = new Date();
  return orders.filter(
    (o): o is RawOrder & { deliveredAt: string } =>
      o.status === "DELIVERED" && !!o.deliveredAt && inRange(new Date(o.deliveredAt), filter, now)
  );
}

// Count orders per hour (today) or per day (week/month).
function toOrderPoints(orders: RawOrder[], filter: FilterType): OrderPoint[] {
  const grouped: Record<string, number> = {};
  // Sort oldest-first so the object's keys (bars) come out in time order;
  // JS objects keep string keys in the order they were first added.
  const sorted = deliveredInRange(orders, filter).sort(
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
function toTrending(orders: RawOrder[], filter: FilterType): TrendingItem[] {
  const grouped: Record<number, TrendingItem> = {};
  for (const o of deliveredInRange(orders, filter)) {
    for (const item of o.orderItems) {
      const v = item.productVariant;
      grouped[v.id] ??= { id: v.id, name: v.name, image: v.imageUrl || "/Xuchil.svg", units: 0 };
      grouped[v.id].units += Number(item.quantity);
    }
  }
  return Object.values(grouped).sort((a, b) => b.units - a.units).slice(0, 4);
}

function itemName(item: RawInventoryItem): string {
  return item.rawMaterial?.name ?? item.productVariant?.name ?? `Artículo ${item.id}`;
}
function itemUnit(item: RawInventoryItem): string {
  return item.rawMaterial?.defaultUnit?.name ?? item.productVariant?.defaultUnit?.name ?? "";
}

// One row per LOT that still has stock and expires within 5 days (or already expired).
function toExpiring(items: RawInventoryItem[]): StockRow[] {
  const now = Date.now();
  const rows: StockRow[] = [];
  for (const item of items) {
    for (const lot of item.inventoryLots) {
      const qty = Number(lot.qtyOnHand ?? 0);
      if (!lot.expiryAt || qty <= 0) continue;
      const daysLeft = Math.ceil((new Date(lot.expiryAt).getTime() - now) / DAY_MS);
      if (daysLeft > EXPIRY_WINDOW_DAYS) continue;
      rows.push({ key: `lot-${lot.id}`, name: itemName(item), daysLeft, quantity: qty, unit: itemUnit(item) });
    }
  }
  return rows.sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));
}

// One row per ITEM whose lots add up to 50 or less.
function toLowStock(items: RawInventoryItem[]): StockRow[] {
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

export default function Analytics() {
  const [filter, setFilter] = useState<FilterType>("today");
  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [inventory, setInventory] = useState<RawInventoryItem[]>([]);
  const [openModal, setOpenModal] = useState<"expiry" | "stock" | null>(null);
  const [tasks, setTasks] = useState<TaskCounts | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch once on page load. The old page re-fetched /api/orders on every
  // filter click; filtering is done in memory now, so one fetch is enough.
  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, inventoryRes, tasksRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/inventory/summary"),
          fetch("/api/step-executions/status-counts"),
        ]);
        if (!ordersRes.ok || !inventoryRes.ok || !tasksRes.ok) throw new Error("respuesta no OK");
        setOrders(await ordersRes.json());
        setInventory(await inventoryRes.json());
        setTasks(await tasksRes.json());
      } catch (err) {
        console.error("analytics load error", err);
        setError("No se pudieron cargar los datos.");
      }
    }
    load();
  }, []);

  // useMemo: recompute only when orders or filter change, not on every render.
  const chartPoints = useMemo(() => toOrderPoints(orders, filter), [orders, filter]);
  const trending = useMemo(() => toTrending(orders, filter), [orders, filter]);
  const expiring = useMemo(() => toExpiring(inventory), [inventory]);
  const lowStock = useMemo(() => toLowStock(inventory), [inventory]);

  const totalOrders = chartPoints.reduce((sum, p) => sum + p.orderCount, 0);
  // Average delivered orders per day over the selected window, up to 2 decimals
  // (the old Math.ceil turned 1 order in 30 days into "1 per day").
  // Meaningless for "hoy" (it would just equal the total), so show a dash there.
  const days = filter === "weekly" ? 7 : 30;
  const averageOrders =
    filter === "today"
      ? "—"
      : (totalOrders / days).toLocaleString("es-MX", { maximumFractionDigits: 2 });
  const maxCount = Math.max(1, ...chartPoints.map((p) => p.orderCount));

  const modalRows = openModal === "expiry" ? expiring : lowStock;

  return (
    <div className={`page ${styles.pageWrapper}`}>
      <HeaderXuchil />
      <h1 className={styles.title}>Analíticas</h1>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.filterRow}>
        {(Object.keys(FILTER_LABELS) as FilterType[]).map((f) => (
          <button
            key={f}
            className={`${styles.pill} ${filter === f ? styles.pillActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      <div className={styles.cardRow}>
        <div className={styles.card}>
          <BarChart3 size={28} />
          <div className={styles.cardValue}>{totalOrders}</div>
          <div className={styles.cardLabel}>pedidos entregados</div>
        </div>
        <div className={styles.card}>
          <TrendingUp size={28} />
          <div className={styles.cardValue}>{averageOrders}</div>
          <div className={styles.cardLabel}>
            {filter === "today"
              ? "promedio por día: elige semana o mes"
              : `pedidos por día en promedio (últimos ${days} días)`}
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Pedidos por {filter === "today" ? "hora" : "día"}</h2>
      {chartPoints.length === 0 ? (
        <p className={styles.empty}>Sin pedidos entregados en este periodo</p>
      ) : (
        // ponytail: plain CSS bar chart; recharts is not installed on this branch.
        <div className={styles.chart}>
          {chartPoints.map((p) => (
            <div key={p.date} className={styles.barColumn}>
              <span className={styles.barValue}>{p.orderCount}</span>
              <div className={styles.bar} style={{ height: `${(p.orderCount / maxCount) * 100}%` }} />
              <span className={styles.barLabel}>{p.date}</span>
            </div>
          ))}
        </div>
      )}

      <h2 className={styles.sectionTitle}>Productos más vendidos</h2>
      {trending.length === 0 ? (
        <p className={styles.empty}>Sin productos en este periodo</p>
      ) : (
        <ul className={styles.trendingList}>
          {trending.map((item) => (
            <li key={item.id} className={styles.trendingItem}>
              <img src={item.image} alt={item.name} className={styles.trendingImage} />
              <span className={styles.trendingName}>{item.name}</span>
              <span>{item.units} u.</span>
            </li>
          ))}
        </ul>
      )}

      {/* Current state of all tasks; not affected by the hoy/semana/mes filter. */}
      <h2 className={styles.sectionTitle}>Tareas (estado actual)</h2>
      <div className={`${styles.cardRow} ${styles.cardRowThree}`}>
        <div className={styles.card}>
          <Circle size={28} />
          <div className={styles.cardValue}>{tasks?.notStarted ?? "—"}</div>
          <div className={styles.cardLabel}>sin iniciar</div>
        </div>
        <div className={styles.card}>
          <Loader size={28} />
          <div className={styles.cardValue}>{tasks?.inProgress ?? "—"}</div>
          <div className={styles.cardLabel}>en progreso</div>
        </div>
        <div className={styles.card}>
          <CheckCircle2 size={28} />
          <div className={styles.cardValue}>{tasks?.done ?? "—"}</div>
          <div className={styles.cardLabel}>completadas</div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Inventario</h2>
      <div className={styles.cardRow}>
        <button className={styles.card} onClick={() => setOpenModal("expiry")}>
          <AlertTriangle size={28} />
          <div className={styles.cardValue}>{expiring.length}</div>
          <div className={styles.cardLabel}>por caducar ({EXPIRY_WINDOW_DAYS} días)</div>
        </button>
        <button className={styles.card} onClick={() => setOpenModal("stock")}>
          <Package size={28} />
          <div className={styles.cardValue}>{lowStock.length}</div>
          <div className={styles.cardLabel}>poco inventario (≤ {LOW_STOCK_LIMIT})</div>
        </button>
      </div>

      {openModal && (
        <div className={styles.overlay} onClick={() => setOpenModal(null)}>
          {/* stopPropagation: clicks inside the modal must not close it */}
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{openModal === "expiry" ? "Lotes por caducar" : "Artículos con poco inventario"}</h3>
              <button className={styles.closeBtn} onClick={() => setOpenModal(null)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            {modalRows.length === 0 ? (
              <p className={styles.empty}>Nada que mostrar</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Artículo</th>
                    {openModal === "expiry" && <th>Días restantes</th>}
                    <th>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {modalRows.map((row) => (
                    <tr key={row.key}>
                      <td>{row.name}</td>
                      {openModal === "expiry" && (
                        <td>{row.daysLeft! < 0 ? `caducó hace ${-row.daysLeft!}` : row.daysLeft}</td>
                      )}
                      <td>{row.quantity} {row.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
