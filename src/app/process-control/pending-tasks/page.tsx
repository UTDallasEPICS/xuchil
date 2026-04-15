"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import PendingTaskCard from "@/components/PendingTaskCard";
import styles from "./PendingTasks.module.css";
import { PendingTask } from "@/types/PendingTask";
import * as processesService from "@/lib/services/processesService";

const PendingTasksPage = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function load() {
      const dataRaw = await processesService.fetchPendingRuns();
      const data = Array.isArray(dataRaw) ? dataRaw as unknown[] : [];
      if (!mounted) return;

      const mapped: PendingTask[] = data.map((run: unknown) => {
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

        const startDate = typeof r.startedAt === "string" ? new Date(r.startedAt).toLocaleDateString("es-MX") : "";
        const startedBy = (r.creator && typeof (r.creator as Record<string, unknown>).fullName === "string") ? (r.creator as Record<string, unknown>).fullName as string : "No asignado";

        return {
          id: r.id as number,
          productId: String(productVariant?.productId ?? ""),
          productName: productVariant && typeof productVariant.name === "string" ? productVariant.name as string : "Producto",
          variantId: String(r.productVariantId as number | undefined ?? ""),
          startDate,
          startedBy,
          currentStep: allStepsDone ? "Captura de resultados" : (currentStep && currentStep.templateStep && typeof (currentStep.templateStep as Record<string, unknown>).name === "string") ? (currentStep.templateStep as Record<string, unknown>).name as string : "Sin paso",
          currentStepNumber: allStepsDone ? orderedSteps.length : safeIndex + 1,
          totalSteps: orderedSteps.length || 0,
          openRoute: allStepsDone
            ? `/process-control/new-production/${productVariant?.productId}/${r.productVariantId}/results?runId=${r.id}`
            : `/process-control/new-production/${productVariant?.productId}/${r.productVariantId}/${safeIndex + 1}`,
        } as PendingTask;
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
      <h1>Tareas Pendientes</h1>
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
