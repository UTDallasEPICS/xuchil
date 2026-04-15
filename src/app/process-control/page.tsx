"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import ActiveTaskItem from "@/components/ActiveTaskItem";
import styles from "./ProcessControl.module.css";

interface ActiveTask {
  processRunId: number;
  productName: string;
  currentStepName: string;
  currentStepNumber: number;
  totalSteps: number;
  status: "IN_PROGRESS" | "PAUSED";
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
      const res = await fetch("/api/process-runs/pending", { credentials: "include" });
      if (!res.ok) return;
      const runs = await res.json();

      const mapped: ActiveTask[] = runs.map((run: any) => {
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

        return {
          processRunId: run.id,
          productName: run.productVariant?.name || "Producto",
          currentStepName: allStepsDone ? "Captura de resultados" : currentStep?.templateStep?.name || "Sin paso",
          currentStepNumber: allStepsDone ? orderedSteps.length : safeIndex + 1,
          totalSteps: orderedSteps.length || 0,
          status: run.status === "PAUSED" ? "PAUSED" : "IN_PROGRESS",
          stepExecutionId: currentStep?.id ?? null,
          startedAt: currentStep?.startedAt ?? null,
          openRoute,
          isResultsStage: allStepsDone,
        };
      });

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
