"use client";

import React, {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import dynamic from "next/dynamic";
import HeaderXuchil from "@/components/HeaderXuchil";
import PendingTaskCard from "@/components/PendingTaskCard";
import Button from "@/components/Button";
import styles from "./PendingTasks.module.css";
import {PendingTask} from "@/types/PendingTask";
import {RawTaskData, GroupedTaskCategory} from "@/types/TaskTime";
import {groupTasksByCategory} from "@/utils/dataUtils";
import {ProcessExecutionRead} from "@/lib/schemas";
import templateClient from "@/lib/services/templateClient";
import productClient from "@/lib/services/productClient";

const BoxWhiskerChart = dynamic(() => import("@/components/BoxWhiskerChart"), {
  ssr: false,
  loading: () => (
      <div className={styles.chartLoadingPlaceholder}>
        <p>Cargando gráficos...</p>
      </div>
  ),
});

async function loadPendingExecutions(): Promise<ProcessExecutionRead[]> { //this is an api call to get the tasks themsevles
  const res = await fetch("/api/process-step-executions", {credentials: "include"});
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const data = await res.json()
  console.log("data",data)
  return data;


}

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
    openRoute: `/process-control/new-production/${execution.processId}/${stepExecution.stepId}`,
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
        const executions = await loadPendingExecutions();
        console.log("executions",executions)
       
        setTasks(executions);

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

  const emptyTasksMessage = useMemo(() => (tasks.length === 0 ? "No pending tasks" : null), [tasks.length]);

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

        <div className={styles.tasksSection}>
          <h2 className={styles.sectionTitle}>Pending Tasks List</h2>
          <div className={styles.container}>
            {emptyTasksMessage ? (
                <div className={styles.emptyState}>
                  <p>{emptyTasksMessage}</p>
                </div>
            ) : (
                tasks.map((task) => (
                    <div
                        key={task.id}
                        onClick={() => router.push(task.openRoute)}
                        style={{cursor: "pointer"}}
                        className={styles.cardContainer}
                    >
                      <PendingTaskCard
                          productName={task.productName}
                          startDate={task.startDate}
                          currentStep={task.currentStep}
                          currentStepNumber={task.currentStepNumber}
                          totalSteps={task.totalSteps}
                      />
                    </div>
                ))
            )}
          </div>
        </div>
      </div>
  );
};

export default PendingTasksPage;
