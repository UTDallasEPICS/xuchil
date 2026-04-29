"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import styles from "./NewProcess.module.css";
import * as productsService from "@/lib/services/productClient";
import * as processesService from "@/lib/services/templateClient";

interface ProcessStep {
  id: number;
  title: string;
  estimatedTime: number;
  hasInput: boolean;
  unit?: string;
  description?: string;
}

interface RawMaterial {
  name: string;
  quantity: number;
  unit: string;
}

interface ProductVariantOption {
  id: number;
  name: string;
  product?: {
    name: string;
  };
}

const NewProcessPage = () => {
  const router = useRouter();
  const [variants, setVariants] = useState<ProductVariantOption[]>([]);
  const [productVariantId, setProductVariantId] = useState("");
  const [processName, setProcessName] = useState("");
  const [processDescription, setProcessDescription] = useState("");
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: 1, title: "", estimatedTime: 0, hasInput: false, unit: "", description: "" }
  ]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([
    { name: "", quantity: 0, unit: "kg" }
  ]);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    error: false,
  });

  useEffect(() => {
    let mounted = true;

    async function loadVariants() {
      try {
        const data = await productsService.fetchProductVariants();
        if (!mounted) return;
        setVariants(Array.isArray(data) ? data as ProductVariantOption[] : []);
      } catch (error) {
        console.error("Failed to load product variants:", error);
      }
    }

    loadVariants();

    return () => {
      mounted = false;
    };
  }, []);

  const addStep = () => {
    const newStep: ProcessStep = {
      id: steps.length + 1,
      title: "",
      estimatedTime: 0,
      hasInput: false,
      unit: "",
      description: ""
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== stepId));
    }
  };

  const updateStep = (stepId: number, field: keyof ProcessStep, value: unknown) => {
    setSteps(steps.map(step =>
      step.id === stepId ? { ...step, [field]: value } : step
    ));
  };

  const addRawMaterial = () => {
    setRawMaterials([...rawMaterials, { name: "", quantity: 0, unit: "kg" }]);
  };

  const removeRawMaterial = (index: number) => {
    if (rawMaterials.length > 1) {
      setRawMaterials(rawMaterials.filter((_, i) => i !== index));
    }
  };

  const updateRawMaterial = (index: number, field: keyof RawMaterial, value: unknown) => {
    const updated = [...rawMaterials];
    updated[index] = { ...updated[index], [field]: value } as RawMaterial;
    setRawMaterials(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productVariantId) {
      setModal({
        open: true,
        title: "Falta información",
        message: "Selecciona una variante de producto.",
        error: true,
      });
      return;
    }

    if (!processName.trim()) {
      setModal({
        open: true,
        title: "Error",
        message: "El nombre del proceso es obligatorio.",
        error: true,
      });
      return;
    }

    for (const material of rawMaterials) {
      if (!material.name.trim()) {
        setModal({
          open: true,
          title: "Error",
          message: "Todas las materias primas deben tener nombre.",
          error: true,
        });
        return;
      }

      if (material.quantity <= 0) {
        setModal({
          open: true,
          title: "Error",
          message: "Las cantidades de materia prima deben ser mayores a 0.",
          error: true,
        });
        return;
      }
    }

    for (const step of steps) {
      if (!step.title.trim()) {
        setModal({
          open: true,
          title: "Error",
          message: "Todos los pasos deben tener título.",
          error: true,
        });
        return;
      }

      if (step.estimatedTime <= 0) {
        setModal({
          open: true,
          title: "Error",
          message: "El tiempo estimado debe ser mayor a 0 minutos.",
          error: true,
        });
        return;
      }
    }

    try {
      const payload = {
        productVariantId: parseInt(productVariantId, 10),
        name: processName.trim(),
        notes: processDescription.trim() || null,
        steps: steps.map((step) => ({
          name: step.title.trim(),
          idealDurationMin: step.estimatedTime > 0 ? step.estimatedTime : null,
          requiresInput: step.hasInput,
          instructions: step.description?.trim() || null,
        })),
      };

      await processesService.createTemplateWithSteps(payload);

      setModal({
        open: true,
        title: "Proceso creado exitosamente",
        message: "El nuevo proceso ha sido registrado correctamente.",
        error: false,
      });
    } catch (error) {
      setModal({
        open: true,
        title: "Error al crear proceso",
        message: error instanceof Error ? error.message : "Ocurrió un error inesperado.",
        error: true,
      });
    }
  };

  const handleModalClose = () => {
    setModal({ ...modal, open: false });
    if (!modal.error) {
      router.push("/process-control");
    }
  };

  return (
    <div className={`page ${styles.pageWrapper}`}>
      <HeaderXuchil />
      
      <div className={styles.headerContainer}>
        <h1>Crear nuevo proceso</h1>
        <p>Define la información base, materias primas y pasos para el nuevo flujo de producción.</p>
      </div>

      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Información básica del proceso */}
          <div className={styles.section}>
            <h2>Información del Proceso</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Variante de producto</label>
              <select
                className={styles.input}
                value={productVariantId}
                onChange={(e) => setProductVariantId(e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.product?.name ? `${variant.product.name} — ${variant.name}` : variant.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nombre del proceso</label>
              <input
                type="text"
                className={styles.input}
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="Ej: Galletas de Zanahoria"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Descripción</label>
              <textarea
                className={styles.textarea}
                value={processDescription}
                onChange={(e) => setProcessDescription(e.target.value)}
                placeholder="Descripción del proceso..."
                rows={3}
              />
            </div>
          </div>

          {/* Materias primas */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Materias Primas</h2>
              <Button type="button" onClick={addRawMaterial} action="secondary">
                + Agregar Materia Prima
              </Button>
            </div>
            {rawMaterials.map((material, index) => (
              <div key={index} className={styles.materialRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nombre</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={material.name}
                    onChange={(e) => updateRawMaterial(index, "name", e.target.value)}
                    placeholder="Ej: Zanahoria"
                    required
                  />
                </div>
                <div className={styles.quantityGroup}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Cantidad</label>
                   <input
                    type="number"
                    min="0.001"
                    step="0.001"
                    className={styles.input}
                    value={material.quantity}
                    onChange={(e) =>
                    updateRawMaterial(
                    index,
                    "quantity",
                   Math.max(0.001, parseFloat(e.target.value) || 0.001)
                    )
                    }
                     required
                  />
                  </div>
                  <select
                    value={material.unit}
                    onChange={(e) => updateRawMaterial(index, "unit", e.target.value)}
                    className={styles.unitSelect}
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="ml">ml</option>
                    <option value="unidades">unidades</option>
                  </select>
                </div>
                {rawMaterials.length > 1 && (
                  <Button 
                    type="button" 
                    onClick={() => removeRawMaterial(index)}
                    action="negative"
                    className={styles.removeButton}
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Pasos del proceso */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Pasos del Proceso</h2>
              <Button type="button" onClick={addStep} action="secondary">
                + Agregar Paso
              </Button>
            </div>
            {steps.map((step) => (
              <div key={step.id} className={styles.stepCard}>
                <div className={styles.stepHeader}>
                  <h3>Paso {step.id}</h3>
                  {steps.length > 1 && (
                    <Button 
                      type="button" 
                      onClick={() => removeStep(step.id)}
                      action="negative"
                      className={styles.removeButton}
                    >
                      ✕
                    </Button>
                  )}
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Título del paso</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={step.title}
                    onChange={(e) => updateStep(step.id, "title", e.target.value)}
                    placeholder="Ej: Preparación de ingredientes"
                    required
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Descripción</label>
                  <textarea
                    className={styles.textarea}
                    value={step.description || ""}
                    onChange={(e) => updateStep(step.id, "description", e.target.value)}
                    placeholder="Descripción detallada del paso..."
                    rows={2}
                  />
                </div>
                
                <div className={styles.stepDetails}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Tiempo estimado (minutos)</label>
                    <input
                      type="number"
                     min="1"
                      step="1"
                      className={styles.input}
                      value={step.estimatedTime}
                      onChange={(e) =>
                      updateStep(
                      step.id,
                     "estimatedTime",
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                   }
                   required
                    />
                  </div>
                  
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={step.hasInput}
                        onChange={(e) => updateStep(step.id, "hasInput", e.target.checked)}
                      />
                      Requiere entrada de datos
                    </label>
                  </div>
                  
                  {step.hasInput && (
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Unidad de medida</label>
                      <input
                        type="text"
                        className={styles.input}
                        value={step.unit || ""}
                        onChange={(e) => updateStep(step.id, "unit", e.target.value)}
                        placeholder="Ej: kg, L, unidades"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.submitSection}>
            <Button type="submit" action="primary">
              Crear Proceso
            </Button>
          </div>
        </form>
      </div>

      <Modal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        confirmText="Aceptar"
        onlyConfirm
        onConfirm={handleModalClose}
        danger={modal.error}
      />
    </div>
  );
};

export default NewProcessPage;