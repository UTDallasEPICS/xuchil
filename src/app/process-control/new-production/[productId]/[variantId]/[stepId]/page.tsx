"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import HeaderXuchil from "@/components/HeaderXuchil";
import Chronometer from "@/components/Chronometer";
import BottomButton from "@/components/BottomButton";
import styles from "./ProcessStep.module.css";
import { fetchProcessSteps } from "@/constants/api"; 
import { ProcessStep } from "@/types/types";

const ProcessStepPage = () => {
  const { productId, variantId, stepId } = useParams();
  const router = useRouter();

  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [currentStep, setCurrentStep] = useState<ProcessStep | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    console.log("ProductId",productId as string);
    console.log("VariantId",variantId as string);
    const allSteps = fetchProcessSteps(productId as string, variantId as string);
    setSteps(allSteps);
    console.log("Steps:",steps);
    const numericStepId = parseInt(stepId, 10);
    console.log("NumericStepId:",numericStepId);
    const step = allSteps.find(s => s.id === numericStepId) || allSteps[0];
    console.log("Step:",step);
    setCurrentStep(step);
    console.log("Current step:",currentStep);
  }, [productId, variantId, stepId]);

  if (!currentStep) {
    return (
      <div className="page">
        <HeaderXuchil />
        <p>Cargando información del proceso...</p>
      </div>
    );
  }

  const stepIndex = steps.findIndex(s => s.id === currentStep.id);

  const handleChronometerStart = () => {
    setHasStarted(true);
  };

  const handleNextStep = () => {
    if (stepIndex < steps.length - 1) {
      const nextStep = steps[stepIndex + 1];
      router.push(`/process-control/new-production/${productId}/${variantId}/${nextStep.id}`);
    } else {
      router.push(`/process-control/new-production/${productId}/${variantId}/results`);
    }
  };

  return (
    <div className="page">
      <HeaderXuchil />
      <div className={styles.container}>
        <h1>{`Paso ${stepIndex + 1} de ${steps.length}: ${currentStep.title}`}</h1>

        {!hasStarted && currentStep.hasInput && (
          <input
            type="number"
            placeholder="Cantidad de materia prima"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={styles.input}
          />
        )}

        <Chronometer estimatedTime={currentStep.estimatedTime} onStart={handleChronometerStart} />

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
