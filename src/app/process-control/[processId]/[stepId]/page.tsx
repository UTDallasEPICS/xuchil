"use client";

import {useParams, useRouter} from "next/navigation";
import React, {useState, useEffect} from "react";
import HeaderXuchil from "@/components/HeaderXuchil";
import Chronometer from "@/components/Chronometer";
import BottomButton from "@/components/BottomButton";
import UnitField from "@/components/UnitField";
import styles from "./ProcessStep.module.css";
import {StepStatus} from "@prisma/client";
import executionClient from "@/lib/services/executionClient";
import templateClient from "@/lib/services/templateClient";
import productClient from "@/lib/services/productClient";
import type {
  ProcessStepExecutionCreate,
  ProcessStepExecutionRead,
  ProcessTemplateRead,
  ProductRead, RawMaterialRead
} from "@/lib/schemas";

const ProcessStepPage = () => {
  const {processId, stepId} = useParams();
  const router = useRouter();

  const processExecutionId = Number(processId);
  const stepExecutionIdFromRoute = Number(stepId);

  const [rawMaterials, setRawMaterials] = useState<RawMaterialRead[] | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ProductRead | null>(null);
  const [template, setTemplate] = useState<ProcessTemplateRead | null>(null);
  const [stepExecutions, setStepExecutions] = useState<ProcessStepExecutionRead[]>([]);
  const [currentStepExecution, setCurrentStepExecution] = useState<ProcessStepExecutionRead | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [quantity, setQuantity] = useState<Record<number, number>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const [stepStatus, setStepStatus] = useState<StepStatus>("PENDING");
  const [initialTime, setInitialTime] = useState(0);

  const stepExecIdRef = React.useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoadError(null);

        if (!Number.isFinite(processExecutionId) || !Number.isFinite(stepExecutionIdFromRoute)) {
          if (mounted) setLoadError("No se pudo identificar el proceso.");
          return;
        }

        const rawMaterials = await productClient.getAllRawMaterials();
        const processExecution = await executionClient.getProcessExecutionById(processExecutionId);
        const template = await templateClient.getProcessTemplateById(processExecution.processId);
        const product = await productClient.getProductById(template.productId);

        const orderedTemplateSteps = [...template.processTemplateSteps].sort((a, b) => a.position - b.position);
        if (orderedTemplateSteps.length === 0) {
          if (mounted) setLoadError("La plantilla de proceso no tiene pasos definidos.");
          return;
        }

        const orderedExecutions = [...(processExecution.processStepExecutions || [])];
        const stepExecIndex = orderedExecutions.findIndex((exec) => exec.id === stepExecutionIdFromRoute);
        if (stepExecIndex === -1) {
          if (mounted) setLoadError("No se encontró el paso del proceso.");
          return;
        }

        const stepExec = orderedExecutions[stepExecIndex];
        stepExecIdRef.current = stepExec.id;

        const startedAtMs = stepExec.startedAt ? new Date(stepExec.startedAt).getTime() : null;
        const finishedAtMs = stepExec.finishedAt ? new Date(stepExec.finishedAt).getTime() : null;
        const endMs = finishedAtMs ?? Date.now();
        const elapsed = startedAtMs && !Number.isNaN(startedAtMs)
            ? Math.max(0, Math.floor((endMs - startedAtMs) / 1000))
            : 0;

        if (!mounted) return;
        setRawMaterials(rawMaterials);
        setTemplate(template);
        setCurrentProduct(product);
        setStepExecutions(orderedExecutions);
        setStepIndex(stepExecIndex);
        setCurrentStepExecution(stepExec);
        setStepStatus(stepExec.status);
        setInitialTime(elapsed);
        setHasStarted(Boolean(stepExec.startedAt));
      } catch (e) {
        console.error("Failed to load process step:", e);
        if (mounted) setLoadError("No se pudo cargar la información del proceso.");
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [processExecutionId, stepExecutionIdFromRoute]);

  if (loadError) {
    return (
        <div className="page">
          <HeaderXuchil/>
          <div className={styles.container}>
            <h2>{loadError}</h2>
            <BottomButton onClick={() => router.back()}>
              Volver
            </BottomButton>
          </div>
        </div>
    );
  }

  if (!template) return null;
  if (!rawMaterials) return null;

  if (!currentStepExecution) {
    return (
        <div className="page">
          <HeaderXuchil/>
          <p>Cargando información del proceso...</p>
        </div>
    );
  }

  const handleChronometerStart = async () => {
    setHasStarted(true);

    const execId = stepExecIdRef.current;
    if (!execId) return;

    const payload: Partial<ProcessStepExecutionCreate> = {
      status: "IN_PROGRESS",
    };

    if (!currentStepExecution?.startedAt) {
      payload.startedAt = new Date().toISOString();
    }

    try {
      await Promise.all(Object.entries(quantity).map(async ([mId, q]) => {
        const material = template.processTemplateSteps[stepIndex].processTemplateStepMaterials.find(m => m.rawMaterialId === Number(mId))!;
        await executionClient.createMaterialUsage({
          stepExecutionId: currentStepExecution.id,
          rawMaterialId: material.rawMaterialId,
          qtyUsed: q,
        })
      }))
      const updated = await executionClient.updateProcessStepExecution(execId, payload);
      setCurrentStepExecution(updated);
      setStepStatus(updated.status);
      if (updated.startedAt && !currentStepExecution?.startedAt) {
        const elapsed = Math.max(0, Math.floor((Date.now() - new Date(updated.startedAt).getTime()) / 1000));
        setInitialTime(elapsed);
      }
    } catch (e) {
      console.error("Failed to start step:", e);
    }
  };

  const handlePause = async () => {
    const execId = stepExecIdRef.current;
    if (!execId) return;
    try {
      const updated = await executionClient.updateProcessStepExecution(execId, {status: "PENDING"});
      await executionClient.createProcessPause({
        processStepExecutionId: execId,
        startedAt: (new Date()).toISOString(),
      });
      setCurrentStepExecution(updated);
      setStepStatus(updated.status);
    } catch (e) {
      console.error("Failed to pause step:", e);
    }
  };

  const handleResume = async () => {
    const execId = stepExecIdRef.current;
    if (!execId) return;

    const now = new Date().toISOString();
    const pauses = await executionClient.getAllProcessPauses({processStepExecutionId: execId});
    if (pauses.length > 0 && pauses[0].finishedAt == null) {
      try {
        await executionClient.updateProcessPause(pauses[0].id, {
          endedAt: now,
        });
      } catch (e) {
        console.error("Failed to record pause:", e);
      }
    }

    try {
      const updated = await executionClient.updateProcessStepExecution(execId, {status: "IN_PROGRESS"});
      setCurrentStepExecution(updated);
      setStepStatus(updated.status);
      setHasStarted(true);
    } catch (e) {
      console.error("Failed to resume step:", e);
    }
  };

  const handleNextStep = async () => {
    const execId = stepExecIdRef.current;
    if (!execId) return;

    const payload: Partial<ProcessStepExecutionCreate> = {
      status: "DONE",
      finishedAt: new Date().toISOString(),
    };

    try {
      const updated = await executionClient.updateProcessStepExecution(execId, payload);
      setCurrentStepExecution(updated);
      setStepStatus(updated.status);
    } catch (e) {
      console.error("Failed to finish step:", e);
    }

    const nextExecution = stepExecutions[stepIndex + 1];
    if (nextExecution) {
      router.push(`/process-control/${processExecutionId}/${nextExecution.id}`);
    } else {
      router.push(`/process-control/${processExecutionId}/results`);
    }
  };

  return (
      <div className="page">
        <HeaderXuchil/>
        <div className={styles.container}>
          <h1>{`Elaboración de ${currentProduct?.name ?? ""}`}</h1>
          <h2>{`Paso ${stepIndex + 1} de ${template.processTemplateSteps.length}: ${template.processTemplateSteps[stepIndex].name}`}</h2>
          <p>{`${template.processTemplateSteps[stepIndex].instructions}`}</p>

          {!hasStarted && (template.processTemplateSteps[stepIndex].processTemplateStepMaterials.map(m => {
            const unit = rawMaterials.find(rm => rm.id === m.rawMaterialId)!.unit;
            return <UnitField
                key={m.id}
                value={String(quantity[m.id])}
                onChange={(v) => setQuantity(q => ({...q, [m.id]: Number(v)}))}
                unit={unit.name}
            />;
          }))}

          <Chronometer
              estimatedTime={template.processTemplateSteps[stepIndex].idealDurationMin ?? 0}
              onStart={handleChronometerStart}
              onPause={handlePause}
              onResume={handleResume}
              initialTime={initialTime}
              initialRunning={stepStatus === "IN_PROGRESS"}
          />

          {hasStarted && (
              <BottomButton onClick={handleNextStep}>
                Siguiente
              </BottomButton>
          )}
        </div>
      </div>
  );
};

export default ProcessStepPage;
