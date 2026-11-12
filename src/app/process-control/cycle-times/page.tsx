"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import { TaskTimeData } from "@/components/BoxWhiskerChart";
import styles from "./CycleTimes.module.css";

const BoxWhiskerChart = dynamic(() => import("@/components/BoxWhiskerChart"), {
  ssr: false,
  loading: () => <p style={{ textAlign: "center", color: "#666" }}>Cargando gráficos...</p>,
});

interface GroupedCategory {
  category: string;
  productId: number;
  tasks: TaskTimeData[];
}

export default function CycleTimesPage() {
  const router = useRouter();

  // Acceptance Criteria controls & state
  const [taskCategories, setTaskCategories] = useState<GroupedCategory[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [mode, setMode] = useState<"net" | "gross">("net");
  const [metricsSummary, setMetricsSummary] = useState<{ totalQualifying: number; totalExcluded: number } | null>(null);

  // Fetch metrics from backend endpoint
  const loadChartMetrics = useCallback(async () => {
    try {
      setChartLoading(true);
      setChartError(null);
      const res = await fetch(`/api/process-runs/cycle-metrics?period=${period}&mode=${mode}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("No se pudieron cargar las métricas de ciclo");
      const json = await res.json();
      setTaskCategories(json.categories);
      setMetricsSummary({
        totalQualifying: json.totalQualifyingRuns,
        totalExcluded: json.totalExcludedRuns,
      });
    } catch (err: any) {
      setChartError(err?.message || "Error al cargar gráficos");
    } finally {
      setChartLoading(false);
    }
  }, [period, mode]);

  useEffect(() => {
    loadChartMetrics();
  }, [loadChartMetrics]);

  return (
    <div className={`page ${styles.pageWrapper}`}>
      <HeaderXuchil />

      {/* Back button */}
      <div className={styles.backButtonWrapper}>
        <Button size="small" action="secondary" onClick={() => router.push("/process-control")}>
          ← Volver
        </Button>
      </div>

      <div className={styles.headerContainer}>
        <h1>Tiempos de Ciclo</h1>
        <p>Duración de producción completada agrupada por producto</p>
      </div>
      {/* Legend */}
        <div className={styles.legendBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: "14px", height: "10px", background: "#dcfce7", border: "1.5px solid #214e34", borderRadius: "2px" }} />
            <span>Rango típico (50% central)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: "10px", height: "10px", background: "var(--color-green-dark)" }} />
            <span>Mediana (típico)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#d97706" }} />
            <span>Promedio</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ display: "inline-block", width: "16px", height: "2px", background: "#6b7280" }} />
            <span>Rango (Mín - Máx)</span>
          </div>
        </div>
      {/* Main visualization section */}
      <div className={styles.section}>
        {/* Controls: Mode toggle & Period buttons */}
        <div className={styles.controlsBar}>
          <button
            type="button"
            className={styles.modeBtn}
            onClick={() => setMode((m) => (m === "net" ? "gross" : "net"))}
          >
            {mode === "net" ? "Neto (sin pausas)" : "Bruto (con pausas)"}
          </button>

          <div className={styles.periodGroup}>
            {(["7d", "30d", "90d", "all"] as const).map((p) => {
              const labels = {
                "7d": "7 Días",
                "30d": "30 Días",
                "90d": "90 Días",
                all: "Todo",
              };
              return (
                <button
                  key={p}
                  type="button"
                  className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ""}`}
                  onClick={() => setPeriod(p)}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Metadata subheader bar */}
        {metricsSummary && (
          <div className={styles.metadataBar}>
            <span>Período: <strong>{period === "7d" && "Últimos 7 días"}
                {period === "30d" && "Últimos 30 días"}
                {period === "90d" && "Últimos 90 días"}
                {period === "all" && "Histórico completo"}</strong></span>
            <span>Unidad: <strong>minutos</strong></span>
            <span>Total corridas analizadas: <strong>{metricsSummary.totalQualifying}</strong></span>
            {metricsSummary.totalExcluded > 0 && (
              <span style={{ color: "#9ca3af" }}>
                (Corridas omitidas por datos incompletos o fuera de rango: {metricsSummary.totalExcluded})
              </span>
            )}
          </div>
        )}

        {chartLoading && !metricsSummary && (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
            Cargando métricas de producción...
          </p>
        )}

        {chartError && (
          <div style={{ textAlign: "center", color: "#dc2626", padding: "16px" }}>
            <p>Error: {chartError}</p>
            <Button size="small" action="primary" onClick={loadChartMetrics}>
              Reintentar
            </Button>
          </div>
        )}

        {metricsSummary && !chartError && !taskCategories.some((cat) => cat.tasks.some((t) => (t.count ?? 0) > 0)) && (
          <p style={{ textAlign: "center", color: "#6b7280", padding: "10px", background: "#f9fafb", borderRadius: "8px" }}>
            No hay productos con corridas completas en este período.
          </p>
        )}

        {/* Products list with charts */}
        {metricsSummary && !chartError && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              opacity: chartLoading ? 0.5 : 1,
              transition: "opacity 0.15s",
              pointerEvents: chartLoading ? "none" : "auto",
            }}
          >
            {taskCategories.map((category) => {
              const activeTasks = category.tasks.filter((t) => (t.count ?? 0) > 0);
              if (activeTasks.length === 0) return null;

              return (
                <div key={category.category} style={{ marginBottom: "1rem" }}>
                  <h2 style={{
                    fontSize: "0.85rem",
                    color: "var(--color-green-dark)",
                    margin: "0 0 0.5rem 0",
                    borderBottom: "1px solid #e5e7eb",
                    paddingBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: "700",
                  }}>
                    Categoría: {category.category}
                  </h2>

                  {category.tasks.map((task) => (
                    <BoxWhiskerChart
                      key={task.taskName}
                      data={[task]}
                      title={task.taskName}
                      unit="minutos"
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        
      </div>
    </div>
  );
}