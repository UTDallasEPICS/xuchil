"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import PendingTaskCard from "@/components/PendingTaskCard";
import styles from "./PendingTasks.module.css";
import { PendingTask } from "@/types/PendingTask";
const BoxWhiskerChart = dynamic(() => import("@/components/BoxWhiskerChart"), {
  ssr: false,
  loading: () => (
    <div className={styles.chartLoadingPlaceholder}>
      <p>Cargando gráficos...</p>
    </div>
  ),
});

// Self-contained type so no import from BoxWhiskerChart is needed
export interface ProductCycleData {
  taskName: string;
  min: number;
  median: number;
  average: number;
  max: number;
  count: number;
  hasSufficientData: boolean;
  statusMessage?: string;
}

interface GroupedCategory {
  category: string;
  productId: number;
  tasks: ProductCycleData[];
}

const PendingTasksPage = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const router = useRouter();

  // Chart states for completed cycle durations
  const [taskCategories, setTaskCategories] = useState<GroupedCategory[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState<boolean>(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [mode, setMode] = useState<"net" | "gross">("net");
  const [metricsSummary, setMetricsSummary] = useState<{ totalQualifying: number; totalExcluded: number } | null>(null);

  // Fetch completed production cycle metrics grouped by product
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

  useEffect(() => {
    let mounted = true;

    async function load() {
      const response = await fetch("/api/process-runs/pending", { credentials: "include" });
      if (!response.ok) return;
      const data = await response.json();
      if (!mounted) return;

      const mapped: PendingTask[] = data.map((run: any) => {
        const orderedSteps = [...(run.stepExecutions || [])];
        const allStepsDone =
          orderedSteps.length > 0 &&
          orderedSteps.every((step: any) => step.status === "DONE");
        const currentStepIndex = orderedSteps.findIndex(
          (step: any) => step.status === "IN_PROGRESS" || step.status === "PENDING" || step.status === "BLOCKED"
        );
        const safeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
        const currentStep = orderedSteps[safeIndex];
        const openRoute = allStepsDone
          ? `/process-control/new-production/${run.productVariant?.productId}/${run.productVariantId}/results?runId=${run.id}`
          : `/process-control/new-production/${run.productVariant?.productId}/${run.productVariantId}/${safeIndex + 1}`;
        const currentStepWorker = currentStep?.worker?.fullName
          ?? currentStep?.stepParticipants?.find((participant: any) => participant.worker?.fullName)?.worker?.fullName;

        return {
          id: run.id,
          productId: String(run.productVariant?.productId ?? ""),
          productName: run.productVariant?.name || "Producto",
          variantId: String(run.productVariantId),
          startDate: run.startedAt
            ? new Date(run.startedAt).toLocaleDateString("es-MX")
            : "",
          startedBy: run.creator?.fullName || currentStepWorker || "No asignado",
          currentStep: allStepsDone ? "Captura de resultados" : currentStep?.templateStep?.name || "Sin paso",
          currentStepNumber: allStepsDone ? orderedSteps.length : safeIndex + 1,
          totalSteps: orderedSteps.length || 0,
          openRoute,
        };
      });

      setTasks(mapped);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page">
      <HeaderXuchil />

      {/* Header bar with Back button and Toggle Chart button */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 1.5rem",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <Button size="small" action="secondary" onClick={() => router.push("/process-control")}>
          ← Back
        </Button>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Tareas Pendientes</h1>
        <Button size="small" action="primary" onClick={() => setShowCharts(!showCharts)}>
          {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
        </Button>
      </div>

      {/* Production Cycle Duration Visualization Section */}
      {showCharts && (
        <div className={styles.chartsSection}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1rem",
            borderBottom: "2px solid #ff7300",
            paddingBottom: "10px"
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.3rem", color: "#333" }}>
                Duración de Ciclos de Producción
              </h2>
              <span style={{ fontSize: "12px", color: "#666" }}>
                Corridas completadas agrupadas por producto
              </span>
            </div>

            {/* Mode (Net/Gross) & Reporting Period Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setMode((m) => (m === "net" ? "gross" : "net"))}
                style={{
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                {mode === "net" ? "Sin Pausas" : "Con Pausas"}
              </button>

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
                    onClick={() => setPeriod(p)}
                    style={{
                      fontSize: "11px",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: "none",
                      background: period === p ? "#214e34" : "#e5e7eb",
                      color: period === p ? "#fff" : "#374151",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {labels[p]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Metadata bar */}
          {metricsSummary && (
            <div style={{
              display: "flex",
              gap: "16px",
              fontSize: "11px",
              color: "#555",
              marginBottom: "12px",
              padding: "6px 12px",
              background: "#f3f4f6",
              borderRadius: "6px"
            }}>
              <span>Período: <strong>{period === "all" ? "Histórico Completo" : `Últimos ${period}`}</strong></span>
              <span>Unidad: <strong>minutos</strong></span>
              <span>Total corridas analizadas: <strong>{metricsSummary.totalQualifying}</strong></span>
              {metricsSummary.totalExcluded > 0 && (
                <span style={{ color: "#9ca3af" }}>
                  (Excluidas por incompletas/inválidas: {metricsSummary.totalExcluded})
                </span>
              )}
            </div>
          )}

          {chartLoading && (
            <div className={styles.loadingState}>
              <p>Cargando métricas de producción...</p>
            </div>
          )}

          {chartError && (
            <div className={styles.errorState}>
              <p>Error: {chartError}</p>
              <Button size="small" action="primary" onClick={loadChartMetrics}>
                Reintentar
              </Button>
            </div>
          )}

          {!chartLoading && !chartError && taskCategories.length === 0 && (
            <div className={styles.emptyState}>
              <p>No hay productos disponibles.</p>
            </div>
          )}

          {!chartLoading && !chartError && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {taskCategories.map((category) => (
                <div key={category.productId} style={{ width: "100%" }}>
                  <BoxWhiskerChart
                    data={category.tasks}
                    title={category.category}
                    height={42}
                    unit="minutos"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontSize: "11px",
            color: "#6b7280",
            marginTop: "12px",
            paddingTop: "8px",
            borderTop: "1px solid #e5e7eb"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", background: "#214e34" }} />
              <span>Mediana (típico)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#d97706" }} />
              <span>Promedio</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ display: "inline-block", width: "14px", height: "2px", background: "#6b7280" }} />
              <span>Rango (Mín - Máx)</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() =>
              router.push(task.openRoute)
            }
            style={{ cursor: "pointer" }}
            className={styles.cardContainer}
          >
            <PendingTaskCard
              productName={task.productName}
              startDate={task.startDate}
              startedBy={task.startedBy}
              currentStep={task.currentStep}
              currentStepNumber={task.currentStepNumber}
              totalSteps={task.totalSteps}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingTasksPage;



/*"use client";

import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import styles from "./PendingTasks.module.css";
import {PendingTask} from "@/types/PendingTask";
import {RawTaskData, GroupedTaskCategory} from "@/types/TaskTime";
import {groupTasksByCategory} from "@/utils/dataUtils";
import {ProcessExecutionRead} from "@/lib/schemas";
import templateClient from "@/lib/services/templateClient";
import productClient from "@/lib/services/productClient";
import executionClient from "@/lib/services/executionClient";

const BoxWhiskerChart = dynamic(() => import("@/components/BoxWhiskerChart"), {
  ssr: false,
  loading: () => (
      <div className={styles.chartLoadingPlaceholder}>
        <p>Cargando gráficos...</p>
      </div>
  ),
});

async function toPendingTask(execution: ProcessExecutionRead): Promise<PendingTask> {
  const processTemplate = await templateClient.getProcessTemplateById(execution.processId);
  const product = await productClient.getProductById(processTemplate.productId);
  const totalSteps = execution.processStepExecutions.length || 1;
  const allStepsDone = execution.processStepExecutions.every((step) => {
    return step.status === "DONE" || step.status === "SKIPPED";
  });
  const currentStepIndex = execution.processStepExecutions.findIndex((step) => {
    const status = step.status;
    return (status === "IN_PROGRESS" || status === "PENDING");
  });
  const stepExecution =
    currentStepIndex >= 0 ? execution.processStepExecutions[currentStepIndex] : null;
  const templateStep = stepExecution
    ? await templateClient.getProcessTemplateStepById(stepExecution.stepId)
    : null;
  const currentStepName = allStepsDone
    ? "Captura de resultados"
    : templateStep?.name ?? "Paso pendiente";
  const openRoute = allStepsDone
    ? `/process-control/${execution.id}/results`
    : stepExecution
      ? `/process-control/${execution.id}/${stepExecution.stepId}`
      : `/process-control/${execution.id}/results`;

  return {
    id: execution.id,
    productId: String(product.id),
    productName: product.name,
    startDate: execution.startedAt ? new Date(execution.startedAt).toLocaleDateString("es-MX") : "",
    currentStep: currentStepName,
    currentStepNumber: allStepsDone ? totalSteps : Math.max(currentStepIndex + 1, 1),
    totalSteps,
    openRoute,
  };
}

async function executionToTaskTime(execution: ProcessExecutionRead): Promise<RawTaskData | null> {
  const processTemplate = await templateClient.getProcessTemplateById(execution.processId);
  const times = execution.processStepExecutions
      .map((step) => step.actualDurationMin)
      .filter((value) => typeof value === "number");
  if (times.length === 0) return null;
  return {
    taskName: processTemplate.name,
    category: processTemplate.name,
    times,
    id: execution.id,
  };
}

const PendingTasksPage = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [taskCategories, setTaskCategories] = useState<GroupedTaskCategory[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [chartError, setChartError] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setChartLoading(true);
        const executions = await executionClient.getAllProcessExecutions({pending: true})
        const mappedTasks = await Promise.all(executions.map(toPendingTask));
        setTasks(mappedTasks);

        const chartRows = (await Promise.all(executions.map(executionToTaskTime)))
            .filter((item) => item != null);
        setTaskCategories(groupTasksByCategory(chartRows));
        setChartError(null);
      } catch (err) {
        setChartError(err instanceof Error ? err.message : "Failed to load pending tasks");
      } finally {
        setChartLoading(false);
      }
    };

    void loadData();
  }, []);

  return (
      <div className="page">
        <HeaderXuchil/>

        <div className={styles.headerSection}>
          <div className={styles.headerTop}>
            <Button size="small" action="secondary"onClick={() => router.push("/process-control")}>
              ← Back
            </Button>
            <h1>Tareas Pendientes</h1>
            <Button size="small" action="primary" onClick={() => setShowCharts(!showCharts)}>
              {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
            </Button>
          </div>
        </div>

        {showCharts && (
            <div className={styles.chartsSection}>
              <h2 className={styles.sectionTitle}>Análisis de Tareas</h2>

              {chartLoading && (
                  <div className={styles.loadingState}>
                    <p>Cargando datos...</p>
                  </div>
              )}

              {chartError && (
                  <div className={styles.errorState}>
                    <p>Error: {chartError}</p>
                    <Button size="small" action="primary" onClick={() => window.location.reload()}>
                      Reintentar
                    </Button>
                  </div>
              )}

              {!chartLoading && !chartError && taskCategories.length === 0 && (
                  <div className={styles.emptyState}>
                    <p>No hay datos disponibles</p>
                  </div>
              )}

              {!chartLoading &&
                  !chartError &&
                  taskCategories.map((category, index) => (
                      <div
                          key={`${category.category}-${index}`}
                          style={{
                            marginBottom: "10px",
                            width: "100%",
                            minHeight: "40px",
                            background: "#fafafa",
                            padding: "0px",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "center",
                          }}
                      >
                        <div
                            style={{
                              width: "100%",
                              maxWidth: "1000px",
                              minWidth: "275px",
                            }}
                        >
                          <BoxWhiskerChart data={category.tasks} title={category.category} height={39} unit="minutos"/>
                        </div>
                      </div>
                  ))}
            </div>
        )}
      </div>
  );
};

export default PendingTasksPage;*/