"use client";
// Analytics page, ported from the old `dev` schema to the uao schema.
// Admins see everything. Workers see only their own task counts; the status-counts
// endpoint already filters to the worker's own rows on the server.
// Reads these endpoints (all but users/me and status-counts: admins only):
//   GET /api/users/me                        -> isAdmin
//   GET /api/orders                          -> orders + orderItems + productVariant
//   GET /api/inventory/summary               -> inventoryItems + inventoryLots
//   GET /api/step-executions/status-counts   -> task counts per worker and status + worker list
//   GET /api/process-runs/production-waste   -> finished batches: good output + scrap (merma)
// All math happens in the browser, in src/lib/analytics.ts.
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Circle, CirclePause, Factory, Loader, Package, Percent, SkipForward, Trash2, TrendingUp, X } from "lucide-react";
import HeaderXuchil from "@/components/HeaderXuchil";
import styles from "./Analytics.module.css";

import {
  FilterType,
  RawOrder,
  RawInventoryItem,
  RawTaskData,
  RawRun,
  TaskStatus,
  LOW_STOCK_LIMIT,
  EXPIRY_WINDOW_DAYS,
  FILTER_LABELS,
  toTaskCounts,
  toOrderPoints,
  toTrending,
  wastePct,
  toWaste,
  countMissingWaste,
  toExpiring,
  toLowStock,
} from "@/lib/analytics";

type Section = "tasks" | "orders" | "inventory" | "runs";

// One card per step status, in the order a task moves through them.
const TASK_CARDS: { status: TaskStatus; label: string; Icon: typeof Circle }[] = [
  { status: "PENDING", label: "sin iniciar", Icon: Circle },
  { status: "IN_PROGRESS", label: "en progreso", Icon: Loader },
  { status: "BLOCKED", label: "en pausa", Icon: CirclePause },
  { status: "DONE", label: "completadas", Icon: CheckCircle2 },
  { status: "SKIPPED", label: "omitidas", Icon: SkipForward },
];

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

export default function Analytics() {
  const [filter, setFilter] = useState<FilterType>("today");
  const [orders, setOrders] = useState<RawOrder[]>([]);
  const [inventory, setInventory] = useState<RawInventoryItem[]>([]);
  const [openModal, setOpenModal] = useState<"expiry" | "stock" | null>(null);
  const [taskData, setTaskData] = useState<RawTaskData | null>(null);
  const [workerFilter, setWorkerFilter] = useState<number | "all">("all");
  const [runs, setRuns] = useState<RawRun[]>([]);
  // null until /api/users/me answers, so admin-only sections don't flash for workers.
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Which sections failed to load. Each section shows its own message, so a failed
  // request is never mistaken for "nothing in this period".
  const [failed, setFailed] = useState<Section[]>([]);

  // Fetch once on page load. The old page re-fetched /api/orders on every
  // filter click; filtering is done in memory now, so one fetch is enough.
  // Each request is separate: one failing doesn't blank the other sections.
  useEffect(() => {
    const fail = (section: Section) => (err: unknown) => {
      console.error(`analytics: ${section} failed to load`, err);
      setFailed((f) => [...f, section]);
    };
    async function load() {
      getJson("/api/step-executions/status-counts").then(setTaskData, fail("tasks"));
      let admin: boolean;
      try {
        admin = Boolean((await getJson("/api/users/me")).isAdmin);
      } catch (err) {
        // Without knowing the role we can't pick which sections to show.
        console.error("analytics: users/me failed to load", err);
        setError("No se pudieron cargar los datos.");
        return;
      }
      setIsAdmin(admin);
      if (!admin) return;
      getJson("/api/orders").then(setOrders, fail("orders"));
      getJson("/api/inventory/summary").then(setInventory, fail("inventory"));
      getJson("/api/process-runs/production-waste").then(setRuns, fail("runs"));
    }
    load();
  }, []);
  const didFail = (section: Section) => failed.includes(section);

  // useMemo: recompute only when orders or filter change, not on every render.
  const chartPoints = useMemo(() => toOrderPoints(orders, filter), [orders, filter]);
  const trending = useMemo(() => toTrending(orders, filter), [orders, filter]);
  const expiring = useMemo(() => toExpiring(inventory), [inventory]);
  const lowStock = useMemo(() => toLowStock(inventory), [inventory]);
  const tasks = useMemo(() => toTaskCounts(taskData, workerFilter), [taskData, workerFilter]);
  const wasteRows = useMemo(() => toWaste(runs, filter), [runs, filter]);
  const missingWaste = useMemo(() => countMissingWaste(runs, filter), [runs, filter]);
  // Summary cards only make sense when every batch used the same unit; otherwise read the table.
  const wasteUnits = new Set(wasteRows.map((r) => r.unit));
  const wasteUnit = wasteUnits.size === 1 ? [...wasteUnits][0] : null;
  const totalProduced = wasteRows.reduce((sum, r) => sum + r.produced, 0);
  const totalWaste = wasteRows.reduce((sum, r) => sum + r.waste, 0);

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
      <h1 className={styles.title}>{isAdmin === false ? "Mis estadísticas" : "Analíticas"}</h1>
      {error && <p className={styles.error}>{error}</p>}

      {isAdmin && (
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
      )}

      {isAdmin && (
      <>
      <div className={styles.cardRow}>
        <div className={styles.card}>
          <BarChart3 size={28} />
          <div className={styles.cardValue}>{didFail("orders") ? "—" : totalOrders}</div>
          <div className={styles.cardLabel}>pedidos entregados</div>
        </div>
        <div className={styles.card}>
          <TrendingUp size={28} />
          <div className={styles.cardValue}>{didFail("orders") ? "—" : averageOrders}</div>
          <div className={styles.cardLabel}>
            {filter === "today"
              ? "promedio por día: elige semana o mes"
              : `pedidos por día en promedio (últimos ${days} días)`}
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Pedidos por {filter === "today" ? "hora" : "día"}</h2>
      {didFail("orders") ? (
        <p className={styles.error}>No se pudieron cargar los pedidos</p>
      ) : chartPoints.length === 0 ? (
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
      {didFail("orders") ? (
        <p className={styles.error}>No se pudieron cargar los pedidos</p>
      ) : trending.length === 0 ? (
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

      </>
      )}

      {/* Current state of all tasks; not affected by the hoy/semana/mes filter. */}
      <h2 className={styles.sectionTitle}>{isAdmin === false ? "Mis tareas" : "Tareas"} (estado actual)</h2>
      {/* Worker slicer: native <select>, works on mobile without a library. Admins only;
          a worker's data is already just their own. */}
      {isAdmin && (
      <label className={styles.slicer}>
        Trabajador:
        <select
          value={workerFilter}
          onChange={(e) => setWorkerFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
        >
          <option value="all">Todos</option>
          {taskData?.workers.map((w) => (
            <option key={w.id} value={w.id}>{w.fullName}</option>
          ))}
        </select>
      </label>
      )}
      {didFail("tasks") && <p className={styles.error}>No se pudieron cargar las tareas</p>}
      <div className={`${styles.cardRow} ${styles.cardRowFive}`}>
        {TASK_CARDS.map(({ status, label, Icon }) => (
          <div key={status} className={styles.card}>
            <Icon size={28} />
            <div className={styles.cardValue}>{tasks?.[status] ?? "—"}</div>
            <div className={styles.cardLabel}>{label}</div>
          </div>
        ))}
      </div>

      {isAdmin && (
      <>
      <h2 className={styles.sectionTitle}>Producción y merma</h2>
      {didFail("runs") ? (
        <p className={styles.error}>No se pudieron cargar los lotes de producción</p>
      ) : wasteRows.length === 0 ? (
        <p className={styles.empty}>Sin lotes terminados en este periodo</p>
      ) : (
        <>
          {wasteUnit !== null && (
            <div className={`${styles.cardRow} ${styles.cardRowThree}`}>
              <div className={styles.card}>
                <Factory size={28} />
                <div className={styles.cardValue}>{totalProduced.toLocaleString("es-MX")} {wasteUnit}</div>
                <div className={styles.cardLabel}>producido</div>
              </div>
              <div className={styles.card}>
                <Trash2 size={28} />
                <div className={styles.cardValue}>{totalWaste.toLocaleString("es-MX")} {wasteUnit}</div>
                <div className={styles.cardLabel}>merma</div>
              </div>
              <div className={styles.card}>
                <Percent size={28} />
                <div className={styles.cardValue}>{wastePct(totalProduced, totalWaste)}</div>
                <div className={styles.cardLabel}>de merma</div>
              </div>
            </div>
          )}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Producido</th>
                <th>Merma</th>
                <th>% merma</th>
              </tr>
            </thead>
            <tbody>
              {wasteRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.name}</td>
                  <td>{row.produced.toLocaleString("es-MX")} {row.unit}</td>
                  <td>{row.waste.toLocaleString("es-MX")} {row.unit}</td>
                  <td>{wastePct(row.produced, row.waste)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {missingWaste > 0 && (
        <p className={styles.empty}>
          {missingWaste} {missingWaste === 1 ? "lote terminado no tiene" : "lotes terminados no tienen"} peso o merma registrados; no se cuentan.
        </p>
      )}

      <h2 className={styles.sectionTitle}>Inventario</h2>
      {didFail("inventory") && <p className={styles.error}>No se pudo cargar el inventario</p>}
      <div className={styles.cardRow}>
        <button className={styles.card} onClick={() => setOpenModal("expiry")}>
          <AlertTriangle size={28} />
          <div className={styles.cardValue}>{didFail("inventory") ? "—" : expiring.length}</div>
          <div className={styles.cardLabel}>por caducar ({EXPIRY_WINDOW_DAYS} días)</div>
        </button>
        <button className={styles.card} onClick={() => setOpenModal("stock")}>
          <Package size={28} />
          <div className={styles.cardValue}>{didFail("inventory") ? "—" : lowStock.length}</div>
          <div className={styles.cardLabel}>poco inventario (≤ {LOW_STOCK_LIMIT})</div>
        </button>
      </div>
      </>
      )}

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
