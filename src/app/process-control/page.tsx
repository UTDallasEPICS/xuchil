"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import ActiveTaskItem from "@/components/ActiveTaskItem";
import styles from "./ProcessControl.module.css";
import executionClient from "@/lib/services/executionClient";
import templateClient from "@/lib/services/templateClient";
import productClient from "@/lib/services/productClient";

interface ActiveTask {
  processRunId: number;
  productName: string;
  currentStepName: string;
  currentStepNumber: number;
  totalSteps: number;
  status: "IN_PROGRESS" | "PAUSED" | "PLANNED";
  stepExecutionId: number | null;
  startedAt: string | null;
  openRoute: string;
  isResultsStage: boolean;
}

const ProcessControl = () => {
  const router = useRouter();
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);

  const loadActiveTasks = useCallback(async () => {
    try {
      const runs = await executionClient.getAllProcessExecutions({pending:true})

      const mapped: ActiveTask[] = await Promise.all(runs.map(async (r) => {
        const processTemplate = await templateClient.getProcessTemplateById(r.processId);
        const product = await productClient.getProductById(processTemplate.productId);

        const allStepsDone =
          r.processStepExecutions.length > 0 &&
          r.processStepExecutions.every((step) => {
            return step.status === "DONE" || step.status === "SKIPPED";
          });
        const currentStepIndex = r.processStepExecutions.findIndex((step) => {
          const status = step.status;
          return (status === "IN_PROGRESS" || status === "PENDING");
        });
        const stepExecution = r.processStepExecutions[currentStepIndex];
        const openRoute = allStepsDone
          ? `/process-control/new-production/${product.id}/results?runId=${r.id}`
          : `/process-control/new-production/${product.id}/${currentStepIndex + 1}`;

        const templateStep = await templateClient.getProcessTemplateStepById(stepExecution.stepId);
        const currentStepName = allStepsDone ? "Captura de resultados" : templateStep.name;

        return {
          processRunId: r.id,
          productName: product.name,
          currentStepName,
          currentStepNumber: allStepsDone ? r.processStepExecutions.length : currentStepIndex + 1,
          totalSteps: r.processStepExecutions.length || 0,
          status: r.status as "IN_PROGRESS" | "PAUSED" | "PLANNED",
          stepExecutionId: stepExecution.id,
          startedAt: stepExecution.startedAt ?? null,
          openRoute,
          isResultsStage: allStepsDone,
        };
      }));

      setActiveTasks(mapped);
    } catch (e) {
      console.error("Failed to load active tasks:", e);
    }
  }, []);

  useEffect(() => {
    loadActiveTasks();
  }, [loadActiveTasks]);

  return (
    <div className={`page ${styles.pageWrapper}`}>
      <div className={styles.newProcessButtonWrapper}>
        <Button
          size="small"
          action="secondary"
          onClick={() => router.push("/process-control/new-process")}
        >
          + Nuevo Proceso
        </Button>
      </div>

      <HeaderXuchil />

      <div className={styles.headerContainer}>
        <h1>Control de procesos</h1>
      </div>

      {/* Active Tasks Panel */}
      {activeTasks.length > 0 && (
        <div className={styles.activeTasksSection}>
          <h2 className={styles.sectionTitle}>Tareas en proceso</h2>
          <div className={styles.activeTasksList}>
            {activeTasks.map((task) => (
              <ActiveTaskItem
                key={task.processRunId}
                {...task}
                onActionComplete={loadActiveTasks}
              />
            ))}
          </div>
        </div>
      )}

      <div className={styles.container}>
        <ImageCard imageSrc="/new-process.svg" text="Nueva producción" type="large" route="/process-control/new-production" />
        <ImageCard imageSrc="/pending-task.svg" text="Tareas pendientes" type="large" route="/process-control/pending-tasks" />
        <ImageCard imageSrc="/file.svg" text="Plantillas de proceso" type="large" route="/process-control/templates" />
      </div>
    </div>
  );
};

export default ProcessControl;
