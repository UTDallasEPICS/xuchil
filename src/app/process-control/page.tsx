"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Factory, ClipboardList, FileText, ChevronRight, Plus } from "lucide-react";
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

interface PendingStep {
  id: number;
  status: string;
  startedAt?: string | null;
  templateStep?: { name?: string | null } | null;
}

interface PendingProcessRun {
  id: number;
  status: string;
  productVariantId: number | string;
  processTemplateId: number;
  productVariant?: { productId?: number | string; name?: string | null } | null;
  stepExecutions?: PendingStep[];
}

const ProcessControl = () => {
  const router = useRouter();
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);

  const loadActiveTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/process-runs/pending", { credentials: "include" });
      if (!res.ok) return;
      const runs: PendingProcessRun[] = await res.json();

      const mapped: ActiveTask[] = runs.map((run) => {
        const orderedSteps = [...(run.stepExecutions || [])];
        const allStepsDone =
          orderedSteps.length > 0 &&
          orderedSteps.every((step) => step.status === "DONE");
        const currentStepIndex = orderedSteps.findIndex(
          (step) =>
            step.status === "IN_PROGRESS" ||
            step.status === "PENDING" ||
            step.status === "BLOCKED"
        );
        const safeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
        const currentStep = orderedSteps[safeIndex];
        const openRoute = allStepsDone
          ? `/process-control/new-production/${run.productVariant?.productId}/${run.productVariantId}/results?runId=${run.id}`
          : `/process-control/new-production/${run.productVariant?.productId}/${run.productVariantId}/${safeIndex + 1}?templateId=${run.processTemplateId}`;

        return {
          processRunId: run.id,
          productName: run.productVariant?.name || "Producto",
          currentStepName: allStepsDone
            ? "Captura de resultados"
            : currentStep?.templateStep?.name || "Sin paso",
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadActiveTasks();
  }, [loadActiveTasks]);

  const secciones = [
    {
      id: "nueva-produccion",
      titulo: "Nueva producción",
      texto: "Inicia el proceso de un producto",
      icono: <Factory size={26} />,
      ruta: "/process-control/new-production",
    },
    {
      id: "tareas-pendientes",
      titulo: "Tareas pendientes",
      texto: "Retoma un proceso en curso",
      icono: <ClipboardList size={26} />,
      ruta: "/process-control/pending-tasks",
    },
    {
      id: "plantillas-proceso",
      titulo: "Plantillas de proceso",
      texto: "Consulta y edita los procesos configurados",
      icono: <FileText size={26} />,
      ruta: "/process-control/templates",
    },
  ];

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Control de procesos</h1>

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

      <div className={styles.list}>
        {secciones.map((seccion) => (
          <button
            type="button"
            key={seccion.id}
            className={styles.card}
            onClick={() => router.push(seccion.ruta)}
          >
            <span className={styles.cardIcon}>{seccion.icono}</span>

            <span className={styles.cardBody}>
              <span className={styles.cardTitle}>{seccion.titulo}</span>
              <span className={styles.cardText}>{seccion.texto}</span>
            </span>

            <ChevronRight size={18} className={styles.cardChevron} />
          </button>
        ))}

        <button
          type="button"
          className={styles.addBtn}
          onClick={() => router.push("/process-control/new-process")}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Nuevo proceso</span>
        </button>
      </div>
    </div>
  );
};

export default ProcessControl;
