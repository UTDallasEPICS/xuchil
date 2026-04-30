"use client";

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
  const currentStepIndex = execution.processStepExecutions.findIndex((step) => {
    const status = step.status;
    return (status === "IN_PROGRESS" || status === "PENDING");
  });
  const stepExecution = execution.processStepExecutions[currentStepIndex];
  const templateStep = await templateClient.getProcessTemplateStepById(stepExecution.stepId);
  const allStepsDone = execution.processStepExecutions.every((step) => {
    return step.status === "DONE" || step.status === "SKIPPED";
  });
  const currentStepName = allStepsDone ? "Captura de resultados" : templateStep.name;
  const totalSteps = execution.processStepExecutions.length || 1;

  return {
    id: execution.id,
    productId: String(product.id),
    productName: product.name,
    startDate: execution.startedAt ? new Date(execution.startedAt).toLocaleDateString("es-MX") : "",
    currentStep: currentStepName,
    currentStepNumber: currentStepIndex + 1,
    totalSteps,
    openRoute: `/process-control/${execution.id}/${stepExecution.stepId}`,
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
            <Button size="small" action="secondary" onClick={() => router.push("/process-control")}>
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

export default PendingTasksPage;
