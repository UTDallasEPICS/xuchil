"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import PendingTaskCard from "@/components/PendingTaskCard";
import styles from "./PendingTasks.module.css";
import { PendingTask } from "@/types/PendingTask";

const PendingTasksPage = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function load() {
      const response = await fetch("/api/process-runs/pending", { credentials: "include" });
      if (!response.ok) return;
      const data = await response.json();
      if (!mounted) return;

      const mapped: PendingTask[] = data.map((run: any) => {
        const orderedSteps = [...(run.stepExecutions || [])];
        const currentStepIndex = orderedSteps.findIndex(
          (step: any) => step.status === "IN_PROGRESS" || step.status === "PENDING"
        );
        const safeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
        const currentStep = orderedSteps[safeIndex];

        return {
          id: run.id,
          productId: String(run.productVariant?.productId ?? ""),
          productName: run.productVariant?.name || "Producto",
          variantId: String(run.productVariantId),
          startDate: run.startedAt
            ? new Date(run.startedAt).toLocaleDateString("es-MX")
            : "",
          startedBy: run.creator?.fullName || "No asignado",
          currentStep: currentStep?.templateStep?.name || "Sin paso",
          currentStepNumber: safeIndex + 1,
          totalSteps: orderedSteps.length || 0,
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
      <h1>Tareas Pendientes</h1>
      <div className={styles.container}>
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() =>
              router.push(
                `/process-control/new-production/${task.productId}/${task.variantId}/${task.currentStepNumber}`
              )
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
