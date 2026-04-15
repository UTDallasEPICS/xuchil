"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import ActiveTaskItem from "@/components/ActiveTaskItem";
import styles from "./ProcessControl.module.css";
import * as processesService from "@/lib/services/processesService";

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
      const runsRaw = await processesService.fetchPendingRuns();
      const runs = Array.isArray(runsRaw) ? runsRaw as unknown[] : [];

      const mapped: ActiveTask[] = runs.map((run: unknown) => {
        const r = run as Record<string, unknown>;
        const orderedStepsRaw = r.stepExecutions;
        const orderedSteps = Array.isArray(orderedStepsRaw) ? [...orderedStepsRaw as unknown[]] : [];
        const allStepsDone =
          orderedSteps.length > 0 &&
          orderedSteps.every((step) => {
            const s = step as Record<string, unknown>;
            const status = s.status;
            return typeof status === "string" && status === "DONE";
          });
        const currentStepIndex = orderedSteps.findIndex((step) => {
          const s = step as Record<string, unknown>;
          const status = s.status;
          return typeof status === "string" && (status === "IN_PROGRESS" || status === "PENDING" || status === "BLOCKED");
        });
        const safeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
        const currentStep = orderedSteps[safeIndex] as Record<string, unknown> | undefined;
        const productVariant = r.productVariant as Record<string, unknown> | undefined;
        const productId = productVariant && typeof productVariant.productId === "number" ? productVariant.productId : r.productVariantId as number | undefined;
        const openRoute = allStepsDone
          ? `/process-control/new-production/${productId}/${r.productVariantId}/results?runId=${r.id}`
          : `/process-control/new-production/${productId}/${r.productVariantId}/${safeIndex + 1}`;

        const currentStepName = allStepsDone ? "Captura de resultados" : (currentStep && currentStep.templateStep && typeof (currentStep.templateStep as Record<string, unknown>).name === "string") ? (currentStep.templateStep as Record<string, unknown>).name as string : "Sin paso";
        const productName = productVariant && typeof productVariant.name === "string" ? productVariant.name as string : "Producto";

        return {
          processRunId: (r.id as number) ?? 0,
          productName,
          currentStepName,
          currentStepNumber: allStepsDone ? orderedSteps.length : safeIndex + 1,
          totalSteps: orderedSteps.length || 0,
          status: (r.status === "PAUSED") ? "PAUSED" : "IN_PROGRESS",
          stepExecutionId: currentStep && typeof currentStep.id === "number" ? currentStep.id as number : null,
          startedAt: currentStep && typeof currentStep.startedAt === "string" ? currentStep.startedAt as string : null,
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
