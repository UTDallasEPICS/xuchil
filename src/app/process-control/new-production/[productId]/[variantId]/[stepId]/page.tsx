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

const ProcessStepPage = () => {
  const { productId, variantId, stepId } = useParams();
  const router = useRouter();

  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [currentStep, setCurrentStep] = useState<ProcessStep | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const variantRes = await fetch(`/api/product-variants?product_id=${productId}`, { credentials: "include" });
      if (!variantRes.ok) return;
      const variants = await variantRes.json();
      const stringVariantId = variantId as string;
      const variant = variants.find((item: any) => String(item.id) === stringVariantId);
      if (!variant) return;

      const mappedVariant: ProductVariant = {
        id: String(variant.id),
        name: variant.name,
        imageSrc: variant.imageUrl || "/globe.svg",
      };

      const templatesRes = await fetch(`/api/process-templates?product_variant_id=${variant.id}`, { credentials: "include" });
      if (!templatesRes.ok) return;
      const templates = await templatesRes.json();
      const activeTemplate = templates.find((template: any) => template.isActive) || templates[0];
      if (!activeTemplate) return;

      const templateDetailRes = await fetch(`/api/process-templates/${activeTemplate.id}`, { credentials: "include" });
      if (!templateDetailRes.ok) return;
      const templateDetail = await templateDetailRes.json();

      const allSteps: ProcessStep[] = (templateDetail.templateSteps || []).map((step: any) => ({
        id: step.id,
        title: step.name,
        estimatedTime: step.idealDurationMin ?? 0,
        hasInput: step.requiresInput,
        unit: "",
        description: step.instructions ?? "",
      }));

      if (!mounted) return;
      setCurrentVariant(mappedVariant);
      setSteps(allSteps);
      const numericStepId = parseInt((stepId as string) || "0", 10);
      const step = allSteps.find((item) => item.id === numericStepId) || allSteps[0] || null;
      setCurrentStep(step);
    }

    load();

    return () => {
      mounted = false;
    };
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
