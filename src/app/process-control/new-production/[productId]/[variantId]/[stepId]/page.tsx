"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import HeaderXuchil from "@/components/HeaderXuchil";
import Chronometer from "@/components/Chronometer";
import BottomButton from "@/components/BottomButton";
import UnitField from "@/components/UnitField"; 
import styles from "./ProcessStep.module.css";
import { fetchProcessSteps, fetchProductVariants } from "@/constants/api";
import { ProcessStep } from "@/types/ProcessStep";
import { ProductVariant } from "@/types/ProductVariant";

const ProcessStepPage = () => {
  const { productId, variantId, stepId } = useParams();
  const router = useRouter();

  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [currentStep, setCurrentStep] = useState<ProcessStep | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    const allProductVariants = fetchProductVariants(productId as string);
    const stringVariantId = (variantId as string);
    const variant = allProductVariants.find((s) => s.id == stringVariantId);
    setCurrentVariant(variant);
    const allSteps = fetchProcessSteps(productId as string, variantId as string);
    setSteps(allSteps);
    const numericStepId = parseInt(stepId || "0", 10);
    const step = allSteps.find((s) => s.id === numericStepId) || allSteps[0];
    setCurrentStep(step);
  }, [productId, variantId, stepId]);

  if (!currentStep) {
    return (
      <div className="page">
        <HeaderXuchil />
        <p>Cargando información del proceso...</p>
      </div>
    );
  }

  const stepIndex = steps.findIndex((s) => s.id === currentStep.id);

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
