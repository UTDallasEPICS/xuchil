"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import StepRow from "@/components/StepRow";
import BottomButton from "@/components/BottomButton";
import runStyles from "../ProcessRun.module.css";
import styles from "./ProcessStep.module.css";
import { ProcessStep } from "@/types/ProcessStep";
import { ProductVariant } from "@/types/ProductVariant";

interface ApiVariant {
  id: number | string;
  name: string;
  imageUrl?: string | null;
}

interface ApiStepExecution {
  id: number;
  status: string;
  startedAt?: string | null;
}

interface ApiProcessPause {
  startedAt: string;
  endedAt?: string | null;
}

interface ApiReservation {
  templateStepId: number;
  rawMaterialId: number;
  status: string;
  qty: number | string;
}

interface ApiPendingRun {
  id: number;
  productVariantId: number | string;
  processTemplateId: number;
  stepExecutions?: ApiStepExecution[];
  processPauses?: ApiProcessPause[];
  materialReservations?: ApiReservation[];
}

interface ApiTemplate {
  id: number;
  isActive: boolean;
}

interface ApiTemplateStep {
  id: number;
  name: string;
  idealDurationMin?: number | null;
  requiresInput: boolean;
  instructions?: string | null;
  stepRequiredMaterials?: Array<{
    rawMaterialId: number;
    qtyPerUnitOutput: number | string;
    unitId: number;
    rawMaterial?: { name?: string | null } | null;
    unit?: { name?: string | null } | null;
  }>;
}

interface ApiTemplateDetail {
  templateSteps?: ApiTemplateStep[];
}

const ProcessStepPage = () => {
  const { productId, variantId, stepId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Template chosen on the selector screen (carried through every step).
  const templateIdParam = searchParams.get("templateId");

  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [currentStep, setCurrentStep] = useState<ProcessStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // API-linked state
  // Value tracked only via stepExecIdRef; the setter is kept to trigger re-renders.
  const [, setStepExecutionId] = useState<number | null>(null);
  const [processRunId, setProcessRunId] = useState<number | null>(null);
  const [stepStatus, setStepStatus] = useState<string>("PENDING");
  const [elapsed, setElapsed] = useState(0);
  const [templateId, setTemplateId] = useState<number | null>(null);

  // Reservation / consumption state
  const [runHasReservations, setRunHasReservations] = useState(false);
  const [reserveQty, setReserveQty] = useState<Record<string, number>>({});
  const [consumeQty, setConsumeQty] = useState<Record<number, number>>({});
  const [reserving, setReserving] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);

  // Use a ref to avoid stale closure issues with stepExecutionId
  const stepExecIdRef = React.useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      // stepId from URL is a 1-based position number (1, 2, 3...)
      const stepPosition = parseInt((stepId as string) || "1", 10);
      const positionIndex = stepPosition - 1; // convert to 0-based

      // Look the variant up by its own id, regardless of what the productId
      // route segment means (category id from new-production, product id from
      // the dashboard resume links).
      const variantRes = await fetch(`/api/product-variants`, { credentials: "include" });
      if (!variantRes.ok) {
        if (mounted) setLoadError("No se pudieron cargar las variantes del producto.");
        return;
      }
      const variants: ApiVariant[] = await variantRes.json();
      const stringVariantId = variantId as string;
      const variant = variants.find((item) => String(item.id) === stringVariantId);
      if (!variant) {
        if (mounted) setLoadError("No se encontró la variante seleccionada.");
        return;
      }

      const mappedVariant: ProductVariant = {
        id: String(variant.id),
        name: variant.name,
        imageSrc: variant.imageUrl || "/globe.svg",
      };

      // Load active runs first: a resume link may not carry templateId, in which
      // case the template is derived from the run already in progress.
      const pendingRes = await fetch("/api/process-runs/pending", { credentials: "include" });
      const pendingRuns: ApiPendingRun[] = pendingRes.ok ? await pendingRes.json() : [];

      // Resolve which process template to execute, in priority order:
      // 1) explicit selection from the selector screen (templateId query param),
      // 2) the template of an active run for this variant (resume),
      // 3) the active template configured for the variant (legacy fallback).
      let chosenTemplateId: number | null = templateIdParam ? parseInt(templateIdParam, 10) : null;

      const activeRun =
        pendingRuns.find(
          (run) =>
            String(run.productVariantId) === stringVariantId &&
            (chosenTemplateId == null || run.processTemplateId === chosenTemplateId)
        ) || null;

      if (chosenTemplateId == null && activeRun) {
        chosenTemplateId = activeRun.processTemplateId;
      }

      if (chosenTemplateId == null) {
        const templatesRes = await fetch(`/api/process-templates?product_variant_id=${variant.id}`, { credentials: "include" });
        if (!templatesRes.ok) {
          if (mounted) setLoadError("No se pudieron cargar las plantillas de proceso.");
          return;
        }
        const templates: ApiTemplate[] = await templatesRes.json();
        const activeTemplate = templates.find((template) => template.isActive) || templates[0];
        if (!activeTemplate) {
          if (mounted) {
            setCurrentVariant(mappedVariant);
            setLoadError("Este producto no tiene un proceso de producción configurado. Ve a configuración para crear una plantilla.");
          }
          return;
        }
        chosenTemplateId = activeTemplate.id;
      }

      const templateDetailRes = await fetch(`/api/process-templates/${chosenTemplateId}`, { credentials: "include" });
      if (!templateDetailRes.ok) {
        if (mounted) setLoadError("No se pudo cargar el detalle de la plantilla.");
        return;
      }
      const templateDetail: ApiTemplateDetail = await templateDetailRes.json();

      const allSteps: ProcessStep[] = (templateDetail.templateSteps || []).map((step) => ({
        id: step.id,
        title: step.name,
        estimatedTime: step.idealDurationMin ?? 0,
        hasInput: step.requiresInput,
        unit: "",
        description: step.instructions ?? "",
        materials: (step.stepRequiredMaterials || []).map((srm) => ({
          rawMaterialId: srm.rawMaterialId,
          name: srm.rawMaterial?.name ?? `Materia prima ${srm.rawMaterialId}`,
          qtyPerUnitOutput: Number(srm.qtyPerUnitOutput),
          unitId: srm.unitId,
          unitName: srm.unit?.name ?? "",
        })),
      }));

      if (allSteps.length === 0) {
        if (mounted) {
          setCurrentVariant(mappedVariant);
          setLoadError("La plantilla de proceso no tiene pasos definidos.");
        }
        return;
      }

      if (mounted) {
        setTemplateId(chosenTemplateId);
      }

      // Active process run for this variant+template (resolved above).
      const foundRun = activeRun;
      if (foundRun) {
        if (mounted) {
          setProcessRunId(activeRun.id);
        }
        {
          // Step executions are ordered by id (same order as template steps)
          const orderedExecs = [...(activeRun.stepExecutions || [])];
          const stepExec = orderedExecs[positionIndex];

          if (stepExec && mounted) {
            stepExecIdRef.current = stepExec.id;
            setStepExecutionId(stepExec.id);
            setStepStatus(stepExec.status);

            // If step was already started, calculate elapsed working time
            // (wall clock minus any paused intervals overlapping the step).
            if (stepExec.startedAt && (stepExec.status === "IN_PROGRESS" || stepExec.status === "BLOCKED")) {
              const startedMs = new Date(stepExec.startedAt).getTime();
              const nowMs = Date.now();
              let pausedMs = 0;
              for (const pause of activeRun.processPauses || []) {
                const ps = new Date(pause.startedAt).getTime();
                const pe = pause.endedAt ? new Date(pause.endedAt).getTime() : nowMs;
                const overlapStart = Math.max(startedMs, ps);
                const overlapEnd = Math.min(nowMs, pe);
                if (overlapEnd > overlapStart) pausedMs += overlapEnd - overlapStart;
              }
              const computedElapsed = Math.max(0, Math.floor((nowMs - startedMs - pausedMs) / 1000));
              setElapsed(computedElapsed);
              setHasStarted(true);
            } else {
              setElapsed(0);
              setHasStarted(false);
            }
          }
        }
      } else {
        setElapsed(0);
        setHasStarted(false);
      }

      if (!mounted) return;

      const safeIndex = Math.max(0, Math.min(positionIndex, allSteps.length - 1));
      const activeStep = allSteps[safeIndex] || null;

      // Default quantities for the reservation panel (suggested per template).
      const rq: Record<string, number> = {};
      for (const s of allSteps) {
        for (const m of s.materials ?? []) {
          rq[`${s.id}:${m.rawMaterialId}`] = m.qtyPerUnitOutput;
        }
      }
      setReserveQty(rq);

      // Default consume quantities for the current step (from reservations if any).
      const reservations: ApiReservation[] = foundRun?.materialReservations ?? [];
      setRunHasReservations(reservations.length > 0);
      const cq: Record<number, number> = {};
      for (const m of activeStep?.materials ?? []) {
        const reserved = reservations.find(
          (r) => r.templateStepId === activeStep!.id && r.rawMaterialId === m.rawMaterialId && r.status === "RESERVED"
        );
        cq[m.rawMaterialId] = reserved ? Number(reserved.qty) : m.qtyPerUnitOutput;
      }
      setConsumeQty(cq);

      setCurrentVariant(mappedVariant);
      setSteps(allSteps);
      setStepIndex(safeIndex);
      setCurrentStep(activeStep);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [productId, variantId, stepId, templateIdParam]);

  useEffect(() => {
    if (!hasStarted || stepStatus !== "IN_PROGRESS") return;
    const timer = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [hasStarted, stepStatus]);

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
        const err = await res.json().catch(() => ({}));
        return { ok: false, error: err.error || `No se pudo ${action} el paso.` };
      }
      return { ok: true };
    } catch (e) {
      console.error(`Step action ${action} error:`, e);
      return { ok: false, error: "Error de red al ejecutar el paso." };
    }
  };

  const callStepAction = useCallback(async (action: string, body?: object) => {
    const id = stepExecIdRef.current;
    if (!id) {
      console.warn(`No stepExecutionId available for action: ${action}`);
      return { ok: false, error: "Paso no inicializado." };
    }
    return callStepActionDirect(id, action, body);
  }, []);

  const templateNeedsMaterials = steps.some((s) => (s.materials?.length ?? 0) > 0);
  const runStarted =
    stepStatus === "IN_PROGRESS" || stepStatus === "BLOCKED" || stepStatus === "DONE" || hasStarted;
  const needsReservation =
    !runHasReservations && !runStarted && templateNeedsMaterials && stepIndex === 0;
  const currentStepHasMaterials = (currentStep?.materials?.length ?? 0) > 0;

  const consumeBody = (step: ProcessStep, qtyByMaterial: Record<number, number>) => {
    const materials = (step.materials ?? [])
      .map((m) => ({
        rawMaterialId: m.rawMaterialId,
        qty: qtyByMaterial[m.rawMaterialId] ?? m.qtyPerUnitOutput,
        unitId: m.unitId,
      }))
      .filter((m) => m.qty > 0);
    return materials.length ? { materials } : undefined;
  };

  const reserveStepQty = (step: ProcessStep): Record<number, number> => {
    const map: Record<number, number> = {};
    for (const m of step.materials ?? []) {
      map[m.rawMaterialId] = reserveQty[`${step.id}:${m.rawMaterialId}`] ?? m.qtyPerUnitOutput;
    }
    return map;
  };

  const handleReserve = async () => {
    if (!templateId) return;
    setPanelError(null);
    setReserving(true);
    try {
      let runId = processRunId;
      let createdStepExecs: ApiStepExecution[] | null = null;
      if (!runId) {
        const numericVariantId = parseInt(variantId as string, 10);
        const runRes = await fetch("/api/process-runs", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productVariantId: numericVariantId, processTemplateId: templateId }),
        });
        if (!runRes.ok) {
          const err = await runRes.json().catch(() => ({}));
          throw new Error(err.error || err.details?.message || "No se pudo crear el proceso.");
        }
        const newRun = await runRes.json();
        runId = newRun.id;
        createdStepExecs = newRun.stepExecutions || [];
        setProcessRunId(newRun.id);
      }

      const items: Array<{ templateStepId: number; rawMaterialId: number; qty: number; unitId: number }> = [];
      for (const s of steps) {
        for (const m of s.materials ?? []) {
          const qty = reserveQty[`${s.id}:${m.rawMaterialId}`] ?? m.qtyPerUnitOutput;
          if (qty > 0) items.push({ templateStepId: s.id, rawMaterialId: m.rawMaterialId, qty, unitId: m.unitId });
        }
      }

      if (items.length > 0) {
        const reserveRes = await fetch(`/api/process-runs/${runId}/reserve`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
        if (!reserveRes.ok) {
          const err = await reserveRes.json().catch(() => ({}));
          if (reserveRes.status === 409 && Array.isArray(err.insufficient)) {
            const names = (err.insufficient as Array<{ name: string }>)
              .map((item) => item.name)
              .join(", ");
            throw new Error(`Materia prima insuficiente: ${names}.`);
          }
          throw new Error(err.error || "No se pudo apartar la materia prima.");
        }
      }

      if (createdStepExecs) {
        const stepExec = createdStepExecs[stepIndex];
        if (stepExec) {
          stepExecIdRef.current = stepExec.id;
          setStepExecutionId(stepExec.id);
        }
      }
      setRunHasReservations(true);
      setStepStatus("PENDING");
      if (currentStep) setConsumeQty(reserveStepQty(currentStep));
    } catch (e) {
      setPanelError(e instanceof Error ? e.message : "Error al apartar la materia prima.");
    } finally {
      setReserving(false);
    }
  };

  if (loadError) {
    return (
      <div className="page">
        <div className={styles.container}>
          <h2>{loadError}</h2>
          <BottomButton onClick={() => router.back()}>Volver</BottomButton>
        </div>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div className="page">
        <p>Cargando información del proceso...</p>
      </div>
    );
  }

  const handleChronometerStart = async () => {
    setHasStarted(true);

    if (!stepExecIdRef.current && templateId) {
      try {
        const numericVariantId = parseInt(variantId as string, 10);
        const res = await fetch("/api/process-runs", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productVariantId: numericVariantId, processTemplateId: templateId }),
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
            const result = await callStepActionDirect(stepExec.id, "start");
            if (result.ok) setStepStatus("IN_PROGRESS");
            else setPanelError(result.error);
          }
        } else {
          setPanelError("No se pudo crear el proceso.");
        }
      } catch (e) {
        console.error("Error creating ProcessRun:", e);
        setPanelError("Error al crear el proceso.");
      }
    } else if (stepStatus === "PENDING") {
      const body = consumeBody(currentStep, consumeQty);
      const result = await callStepAction("start", body);
      if (result.ok) setStepStatus("IN_PROGRESS");
      else setPanelError(result.error);
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

  const handleToggleRunning = () => {
    if (!hasStarted || stepStatus === "PENDING") {
      void handleChronometerStart();
    } else if (stepStatus === "IN_PROGRESS") {
      handlePause();
    } else {
      handleResume();
    }
  };

  const handleNextStep = async () => {
    setStepStatus("DONE");
    await callStepAction("finish");
    const templateQuery = templateId ? `?templateId=${templateId}` : "";
    const nextPosition = stepIndex + 2;
    if (stepIndex < steps.length - 1) {
      router.push(
        `/process-control/new-production/${productId}/${variantId}/${nextPosition}${templateQuery}`
      );
    } else {
      const route = processRunId
        ? `/process-control/new-production/${productId}/${variantId}/results?runId=${processRunId}`
        : `/process-control/new-production/${productId}/${variantId}/results`;
      router.push(route);
    }
  };

  const upcoming = steps.slice(stepIndex + 1);
  const done = steps.slice(0, stepIndex);
  const overallPct = (stepIndex / steps.length) * 100;

  return (
    <div className="page">
      <div className={runStyles.container}>
        <header className={runStyles.head}>
          <h1 className={runStyles.processTitle}>
            {currentVariant?.name ? `Elaboración de ${currentVariant.name}` : "Proceso"}
          </h1>
          <div className={runStyles.overall}>
            <div
              className={runStyles.overallFill}
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className={runStyles.overallLabel}>
            {stepIndex} de {steps.length} pasos terminados
          </p>
        </header>

        {needsReservation ? (
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Apartar materia prima del proceso</h3>
            {steps.map((s) =>
              (s.materials ?? []).map((m) => (
                <div key={`${s.id}:${m.rawMaterialId}`} className={styles.panelRow}>
                  <span className={styles.panelLabel}>{`${s.title}: ${m.name}`}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    className={styles.qtyInput}
                    value={reserveQty[`${s.id}:${m.rawMaterialId}`] ?? m.qtyPerUnitOutput}
                    onChange={(e) =>
                      setReserveQty((prev) => ({
                        ...prev,
                        [`${s.id}:${m.rawMaterialId}`]: Math.max(0, parseFloat(e.target.value) || 0),
                      }))
                    }
                  />
                  <span className={styles.unitTag}>{m.unitName}</span>
                </div>
              ))
            )}
            {panelError ? <p className={styles.panelError}>{panelError}</p> : null}
            <button
              type="button"
              className={styles.reserveButton}
              onClick={handleReserve}
              disabled={reserving}
            >
              {reserving ? "Apartando..." : "Apartar materia prima"}
            </button>
          </div>
        ) : (
          <>
            {!hasStarted && stepStatus === "PENDING" && currentStepHasMaterials && (
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Materia prima a usar en este paso</h3>
                {(currentStep.materials ?? []).map((m) => (
                  <div key={m.rawMaterialId} className={styles.panelRow}>
                    <span className={styles.panelLabel}>{m.name}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      className={styles.qtyInput}
                      value={consumeQty[m.rawMaterialId] ?? m.qtyPerUnitOutput}
                      onChange={(e) =>
                        setConsumeQty((prev) => ({
                          ...prev,
                          [m.rawMaterialId]: Math.max(0, parseFloat(e.target.value) || 0),
                        }))
                      }
                    />
                    <span className={styles.unitTag}>{m.unitName}</span>
                  </div>
                ))}
              </div>
            )}

            {panelError ? <p className={styles.panelError}>{panelError}</p> : null}

            <ul className={runStyles.list}>
              <StepRow
                key={currentStep.id}
                step={currentStep}
                position={stepIndex + 1}
                total={steps.length}
                state="active"
                elapsed={elapsed}
                started={hasStarted}
                running={stepStatus === "IN_PROGRESS"}
                onToggleRunning={handleToggleRunning}
                onSkip={handleNextStep}
              />

              {upcoming.map((step, idx) => (
                <StepRow
                  key={step.id}
                  step={step}
                  position={stepIndex + 2 + idx}
                  total={steps.length}
                  state="upcoming"
                />
              ))}

              {done.map((step, idx) => (
                <StepRow
                  key={step.id}
                  step={step}
                  position={idx + 1}
                  total={steps.length}
                  state="done"
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

const ProcessStepPageWithSuspense = () => (
  <Suspense
    fallback={
      <div className="page">
        <p>Cargando información del proceso...</p>
      </div>
    }
  >
    <ProcessStepPage />
  </Suspense>
);

export default ProcessStepPageWithSuspense;
