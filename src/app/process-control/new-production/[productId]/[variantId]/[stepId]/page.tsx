"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import HeaderXuchil from "@/components/HeaderXuchil";
import Chronometer from "@/components/Chronometer";
import BottomButton from "@/components/BottomButton";
import UnitField from "@/components/UnitField";
import styles from "./ProcessStep.module.css";
import { ProcessStep } from "@/types/ProcessStep";
import { ProductVariant } from "@/types/ProductVariant";

const ProcessStepPage = () => {
  const { productId, variantId, stepId } = useParams();
  const router = useRouter();

  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [currentStep, setCurrentStep] = useState<ProcessStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  // API-linked state
  const [stepExecutionId, setStepExecutionId] = useState<number | null>(null);
  const [processRunId, setProcessRunId] = useState<number | null>(null);
  const [stepStatus, setStepStatus] = useState<string>("PENDING");
  const [initialTime, setInitialTime] = useState(0);
  const [templateId, setTemplateId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      // stepId from URL is a 1-based position number (1, 2, 3...)
      const stepPosition = parseInt((stepId as string) || "1", 10);
      const positionIndex = stepPosition - 1; // convert to 0-based

      const variantRes = await fetch(`/api/product-variants?product_id=${productId}`, { credentials: "include" });
      if (!variantRes.ok) {
        if (mounted) setLoadError("No se pudieron cargar las variantes del producto.");
        return;
      }
      const variants = await variantRes.json();
      const stringVariantId = variantId as string;
      const variant = variants.find((item: any) => String(item.id) === stringVariantId);
      if (!variant) {
        if (mounted) setLoadError("No se encontró la variante seleccionada.");
        return;
      }

      const mappedVariant: ProductVariant = {
        id: String(variant.id),
        name: variant.name,
        imageSrc: variant.imageUrl || "/globe.svg",
      };

      const templatesRes = await fetch(`/api/process-templates?product_variant_id=${variant.id}`, { credentials: "include" });
      if (!templatesRes.ok) {
        if (mounted) setLoadError("No se pudieron cargar las plantillas de proceso.");
        return;
      }
      const templates = await templatesRes.json();
      const activeTemplate = templates.find((template: any) => template.isActive) || templates[0];
      if (!activeTemplate) {
        if (mounted) {
          setCurrentVariant(mappedVariant);
          setLoadError("Este producto no tiene un proceso de producción configurado. Ve a configuración para crear una plantilla.");
        }
        return;
      }

      const templateDetailRes = await fetch(`/api/process-templates/${activeTemplate.id}`, { credentials: "include" });
      if (!templateDetailRes.ok) {
        if (mounted) setLoadError("No se pudo cargar el detalle de la plantilla.");
        return;
      }
      const templateDetail = await templateDetailRes.json();

      const allSteps: ProcessStep[] = (templateDetail.templateSteps || []).map((step: any) => ({
        id: step.id,
        title: step.name,
        estimatedTime: step.idealDurationMin ?? 0,
        hasInput: step.requiresInput,
        unit: "",
        description: step.instructions ?? "",
      }));

      if (allSteps.length === 0) {
        if (mounted) {
          setCurrentVariant(mappedVariant);
          setLoadError("La plantilla de proceso no tiene pasos definidos.");
        }
        return;
      }

      if (mounted) {
        setTemplateId(activeTemplate.id);
      }

      // Load active process run for this variant
      const pendingRes = await fetch("/api/process-runs/pending", { credentials: "include" });
      if (pendingRes.ok) {
        const pendingRuns = await pendingRes.json();
        const activeRun = pendingRuns.find((run: any) => String(run.productVariantId) === stringVariantId);
        if (activeRun) {
          if (mounted) {
            setProcessRunId(activeRun.id);
          }
          // Step executions are ordered by id (same order as template steps)
          const orderedExecs = [...(activeRun.stepExecutions || [])];
          const stepExec = orderedExecs[positionIndex];

          if (stepExec && mounted) {
            stepExecIdRef.current = stepExec.id;
            setStepExecutionId(stepExec.id);
            setStepStatus(stepExec.status);

            // If step was already started, calculate elapsed time
            if (stepExec.startedAt && (stepExec.status === "IN_PROGRESS" || stepExec.status === "BLOCKED")) {
              const elapsed = Math.floor((Date.now() - new Date(stepExec.startedAt).getTime()) / 1000);
              setInitialTime(Math.max(0, elapsed));
              setHasStarted(true);
            }
          }
        }
      }

      if (!mounted) return;
      setCurrentVariant(mappedVariant);
      setSteps(allSteps);

      // Use position index to find the current step
      const safeIndex = Math.max(0, Math.min(positionIndex, allSteps.length - 1));
      setStepIndex(safeIndex);
      setCurrentStep(allSteps[safeIndex] || null);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [productId, variantId, stepId]);

  // Use a ref to avoid stale closure issues with stepExecutionId
  const stepExecIdRef = React.useRef<number | null>(null);

  const callStepActionDirect = async (execId: number, action: string, body?: object) => {
    try {
      const opts: RequestInit = {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`/api/step-executions/${execId}/${action}`, opts);
      if (!res.ok) {
        const text = await res.text();
        console.error(`Step action ${action} failed (${res.status}):`, text);
        return false;
      }
      return true;
    } catch (e) {
      console.error(`Step action ${action} error:`, e);
      return false;
    }
  };

  const callStepAction = useCallback(async (action: string, body?: object) => {
    const id = stepExecIdRef.current;
    if (!id) {
      console.warn(`No stepExecutionId available for action: ${action}`);
      return false;
    }
    return callStepActionDirect(id, action, body);
  }, []);

  if (loadError) {
    return (
      <div className="page">
        <HeaderXuchil />
        <div className={styles.container}>
          <h2>{loadError}</h2>
          <BottomButton onClick={() => router.back()}>
            Volver
          </BottomButton>
        </div>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div className="page">
        <HeaderXuchil />
        <p>Cargando información del proceso...</p>
      </div>
    );
  }

  const handleChronometerStart = async () => {
    setHasStarted(true);

    // If no ProcessRun exists, create one first
    if (!stepExecIdRef.current && templateId) {
      try {
        const numericVariantId = parseInt(variantId as string, 10);
        const res = await fetch("/api/process-runs", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productVariantId: numericVariantId,
            processTemplateId: templateId,
          }),
        });

        if (res.ok) {
          const newRun = await res.json();
          setProcessRunId(newRun.id);
          const orderedExecs = newRun.stepExecutions || [];
          const stepExec = orderedExecs[stepIndex];
          if (stepExec) {
            stepExecIdRef.current = stepExec.id;
            setStepExecutionId(stepExec.id);
            setStepStatus("PENDING");
            // Now call start
            const ok = await callStepActionDirect(stepExec.id, "start");
            if (ok) {
              setStepStatus("IN_PROGRESS");
            } else {
              console.error("Failed to start step after creating run");
            }
          }
        } else {
          const err = await res.text();
          console.error("Failed to create ProcessRun:", err);
        }
      } catch (e) {
        console.error("Error creating ProcessRun:", e);
      }
    } else if (stepStatus === "PENDING") {
      const ok = await callStepAction("start");
      if (ok) {
        setStepStatus("IN_PROGRESS");
      }
    }
  };

  const handlePause = () => {
    callStepAction("pause", { reason: null });
    setStepStatus("BLOCKED");
  };

  const handleResume = () => {
    callStepAction("resume");
    setStepStatus("IN_PROGRESS");
  };

  const handleNextStep = async () => {
    // Stop the chronometer immediately
    setStepStatus("DONE");
    // Call finish - API handles both IN_PROGRESS and BLOCKED states
    await callStepAction("finish");
    // Navigate forward
    const nextPosition = stepIndex + 2;
    if (stepIndex < steps.length - 1) {
      router.push(`/process-control/new-production/${productId}/${variantId}/${nextPosition}`);
    } else {
      const route = processRunId
        ? `/process-control/new-production/${productId}/${variantId}/results?runId=${processRunId}`
        : `/process-control/new-production/${productId}/${variantId}/results`;
      router.push(route);
    }
  };

  return (
    <div className="page">
      <HeaderXuchil />
      <div className={styles.container}>
        <h1>{`Elaboración de ${currentVariant?.name}`}</h1>
        <h2>{`Paso ${stepIndex + 1} de ${steps.length}: ${currentStep.title}`}</h2>
        <p>{`${currentStep.description}`}</p>

        {!hasStarted && currentStep.hasInput && (
          <UnitField
            value={quantity}
            onChange={setQuantity}
            unit="Kg"
          />
        )}

        <Chronometer
          estimatedTime={currentStep.estimatedTime}
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
