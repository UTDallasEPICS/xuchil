"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import HeaderXuchil from "@/components/HeaderXuchil";
import Chronometer from "@/components/Chronometer";
import BottomButton from "@/components/BottomButton";
import UnitField from "@/components/UnitField";
import styles from "./ProcessStep.module.css";
import { ProcessStep } from "@/types/ProcessStep";
import { ProductVariant } from "@/types/ProductVariant";

const dummyVariant: ProductVariant = {
  id: "1",
  name: "Producto de prueba",
  imageSrc: "/globe.svg",
};

const dummySteps: ProcessStep[] = [
  {
    id: 1,
    title: "Preparar ingredientes",
    estimatedTime: 5,
    hasInput: true,
    unit: "Kg",
    description: "Pesa y prepara los ingredientes necesarios.",
  },
  {
    id: 2,
    title: "Mezclar producto",
    estimatedTime: 10,
    hasInput: false,
    unit: "",
    description: "Mezcla los ingredientes hasta obtener la consistencia correcta.",
  },
  {
    id: 3,
    title: "Empacar producto",
    estimatedTime: 7,
    hasInput: false,
    unit: "",
    description: "Empaca el producto terminado.",
  },
];

const ProcessStepPage = () => {
  const { executionId, variantId, stepId } = useParams();
  const router = useRouter();

  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>(null);
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [currentStep, setCurrentStep] = useState<ProcessStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [stepStatus, setStepStatus] = useState("PENDING");
  const [initialTime] = useState(0);

  useEffect(() => {
    const stepPosition = parseInt((stepId as string) || "1", 10);
    const positionIndex = stepPosition - 1;
    const safeIndex = Math.max(0, Math.min(positionIndex, dummySteps.length - 1));

    setCurrentVariant(dummyVariant);
    setSteps(dummySteps);
    setStepIndex(safeIndex);
    setCurrentStep(dummySteps[safeIndex]);
    setHasStarted(false);
    setStepStatus("PENDING");
  }, [stepId]);

  if (!currentStep) {
    return (
      <div className="page">
        <HeaderXuchil />
        <p>Cargando información del proceso...</p>
      </div>
    );
  }

  const handleChronometerStart = () => {
    setHasStarted(true);
    setStepStatus("IN_PROGRESS");
  };

  const handlePause = () => {
    setStepStatus("BLOCKED");
  };

  const handleResume = () => {
    setStepStatus("IN_PROGRESS");
  };

  const handleNextStep = () => {
    setStepStatus("DONE");

    const nextPosition = stepIndex + 2;

    if (stepIndex < steps.length - 1) {
      router.push(`/process-control/new-production/${executionId}/${variantId}/${nextPosition}`);
    } else {
      router.push(`/process-control/new-production/${executionId}/${variantId}/results`);
    }
  };

  return (
    <div className="page">
      <HeaderXuchil />

      <div className={styles.container}>
        <h1>{`Elaboración de ${currentVariant?.name}`}</h1>
        <h2>{`Paso ${stepIndex + 1} de ${steps.length}: ${currentStep.title}`}</h2>
        <p>{currentStep.description}</p>

        {!hasStarted && currentStep.hasInput && (
          <UnitField value={quantity} onChange={setQuantity} unit="Kg" />
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