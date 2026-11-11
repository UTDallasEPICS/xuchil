"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import styles from "./NewProcess.module.css";

interface StepMaterial {
  rawMaterialId: string;
  quantity: number;
  unitId: number;
}

interface ProcessStep {
  id: number;
  title: string;
  estimatedTime: number;
  hasInput: boolean;
  unit?: string;
  description?: string;
  materials: StepMaterial[];
}

interface ProductVariantOption {
  id: number;
  name: string;
  product?: {
    name: string;
  };
}

interface RawMaterialOption {
  id: number;
  name: string;
  code: string;
  defaultUnitId: number | null;
}

interface UnitOption {
  id: number;
  name: string;
}

interface CategoryOption {
  id: number;
  name: string;
}

const NewProcessPage = () => {
  const router = useRouter();
  const [variants, setVariants] = useState<ProductVariantOption[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterialOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [productVariantId, setProductVariantId] = useState("");

  // Inline product + variant creation
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductSku, setNewProductSku] = useState("");
  const [newVariantName, setNewVariantName] = useState("");
  const [skuHint, setSkuHint] = useState<string | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [createProductError, setCreateProductError] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const handleCreateCategory = async () => {
    setCreateProductError(null);
    if (!newCategoryName.trim()) {
      setCreateProductError("El nombre de la categoría es obligatorio.");
      return;
    }
    try {
      setCreatingCategory(true);
      const res = await fetch("/api/product-categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim(), isActive: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo crear la categoría.");
      }
      const category = await res.json();
      setCategories((prev) => [...prev, category]);
      setNewCategoryId(String(category.id));
      setShowCreateCategory(false);
      setNewCategoryName("");
    } catch (err) {
      setCreateProductError(err instanceof Error ? err.message : "No se pudo crear la categoría.");
    } finally {
      setCreatingCategory(false);
    }
  };
  const [processName, setProcessName] = useState("");
  const [processDescription, setProcessDescription] = useState("");
  const [steps, setSteps] = useState<ProcessStep[]>([
    { id: 1, title: "", estimatedTime: 0, hasInput: false, unit: "", description: "", materials: [] }
  ]);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    error: false,
  });

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [variantsRes, materialsRes, unitsRes, categoriesRes] = await Promise.all([
          fetch("/api/product-variants", { credentials: "include" }),
          fetch("/api/raw-materials", { credentials: "include" }),
          fetch("/api/units", { credentials: "include" }),
          fetch("/api/product-categories", { credentials: "include" }),
        ]);

        if (mounted && variantsRes.ok) {
          setVariants(await variantsRes.json());
        }
        if (mounted && materialsRes.ok) {
          setRawMaterials(await materialsRes.json());
        }
        if (mounted && unitsRes.ok) {
          setUnits(await unitsRes.json());
        }
        if (mounted && categoriesRes.ok) {
          setCategories(await categoriesRes.json());
        }
      } catch (error) {
        console.error("Failed to load process form data:", error);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const defaultUnitId = () => units[0]?.id ?? 1;

  const addStep = () => {
    const newStep: ProcessStep = {
      id: steps.length + 1,
      title: "",
      estimatedTime: 0,
      hasInput: false,
      unit: "",
      description: "",
      materials: []
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== stepId));
    }
  };

  const updateStep = (
    stepId: number,
    field: keyof ProcessStep,
    value: ProcessStep[keyof ProcessStep]
  ) => {
    setSteps(steps.map(step =>
      step.id === stepId ? ({ ...step, [field]: value } as ProcessStep) : step
    ));
  };

  const addMaterial = (stepId: number) => {
    setSteps(steps.map(step =>
      step.id === stepId
        ? { ...step, materials: [...step.materials, { rawMaterialId: "", quantity: 1, unitId: defaultUnitId() }] }
        : step
    ));
  };

  const removeMaterial = (stepId: number, index: number) => {
    setSteps(steps.map(step =>
      step.id === stepId
        ? { ...step, materials: step.materials.filter((_, i) => i !== index) }
        : step
    ));
  };

  const updateMaterial = (
    stepId: number,
    index: number,
    field: keyof StepMaterial,
    value: string | number
  ) => {
    setSteps(steps.map(step => {
      if (step.id !== stepId) return step;
      const materials = step.materials.map((material, i) => {
        if (i !== index) return material;
        const updated = { ...material, [field]: value } as StepMaterial;
        // When picking a raw material, default the unit to its own default unit.
        if (field === "rawMaterialId") {
          const selected = rawMaterials.find((rm) => String(rm.id) === String(value));
          if (selected?.defaultUnitId) {
            updated.unitId = selected.defaultUnitId;
          }
        }
        return updated;
      });
      return { ...step, materials };
    }));
  };

  const handleGenerateSku = async () => {
    setCreateProductError(null);
    if (!newCategoryId) {
      setCreateProductError("Selecciona primero una categoría para generar el SKU.");
      return;
    }
    try {
      const res = await fetch(`/api/products/next-sku?category_id=${newCategoryId}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("No se pudo generar el SKU.");
      const data = await res.json();
      setNewProductSku(data.sku);
      setSkuHint(data.convention);
    } catch (err) {
      setCreateProductError(err instanceof Error ? err.message : "No se pudo generar el SKU.");
    }
  };

  const handleCreateProductAndVariant = async () => {
    setCreateProductError(null);

    if (!newCategoryId) {
      setCreateProductError("La categoría es obligatoria.");
      return;
    }
    if (!newProductName.trim()) {
      setCreateProductError("El nombre del producto es obligatorio.");
      return;
    }
    if (!newProductSku.trim()) {
      setCreateProductError("El SKU es obligatorio.");
      return;
    }
    if (!newVariantName.trim()) {
      setCreateProductError("El nombre de la variante es obligatorio.");
      return;
    }

    try {
      setCreatingProduct(true);

      const productRes = await fetch("/api/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: parseInt(newCategoryId, 10),
          sku: newProductSku.trim(),
          name: newProductName.trim(),
          isActive: true,
        }),
      });
      if (!productRes.ok) {
        const err = await productRes.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo crear el producto.");
      }
      const product = await productRes.json();

      const variantRes = await fetch("/api/product-variants", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: newVariantName.trim(),
          isActive: true,
        }),
      });
      if (!variantRes.ok) {
        const err = await variantRes.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo crear la variante.");
      }
      const variant = await variantRes.json();

      // Add to the list and select it.
      const option: ProductVariantOption = {
        id: variant.id,
        name: variant.name,
        product: { name: product.name },
      };
      setVariants((prev) => [...prev, option]);
      setProductVariantId(String(variant.id));

      // Reset the inline form.
      setShowCreateProduct(false);
      setNewCategoryId("");
      setNewProductName("");
      setNewProductSku("");
      setNewVariantName("");
      setSkuHint(null);
    } catch (err) {
      setCreateProductError(err instanceof Error ? err.message : "No se pudo crear el producto.");
    } finally {
      setCreatingProduct(false);
    }
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

      for (const material of step.materials) {
        if (!material.rawMaterialId) {
          setModal({
            open: true,
            title: "Error",
            message: "Selecciona la materia prima en cada renglón o elimínalo.",
            error: true,
          });
          return;
        }
        if (material.quantity <= 0) {
          setModal({
            open: true,
            title: "Error",
            message: "La cantidad sugerida de cada materia prima debe ser mayor a 0.",
            error: true,
          });
          return;
        }
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
          materials: step.materials.map((material) => ({
            rawMaterialId: parseInt(material.rawMaterialId, 10),
            qtyPerUnitOutput: material.quantity,
            unitId: material.unitId,
          })),
        })),
      };

      const response = await fetch("/api/process-templates/create-with-steps", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo crear el proceso.");
      }

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
      <div className={styles.headerContainer}>
        <h1>Crear nuevo proceso</h1>
        <p>Define la información base y los pasos del flujo. Las materias primas se asignan al paso que las consume.</p>
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
              <Button
                type="button"
                action="secondary"
                onClick={() => setShowCreateProduct((prev) => !prev)}
              >
                {showCreateProduct ? "Cancelar producto nuevo" : "+ Crear producto nuevo"}
              </Button>
            </div>

            {showCreateProduct && (
              <div className={styles.materialRow}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Categoría</label>
                  <select
                    className={styles.input}
                    value={newCategoryId}
                    onChange={(e) => {
                      setNewCategoryId(e.target.value);
                      setNewProductSku("");
                      setSkuHint(null);
                    }}
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {showCreateCategory ? (
                    <div className={styles.quantityGroup}>
                      <input
                        type="text"
                        className={styles.input}
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nueva categoría"
                      />
                      <Button type="button" action="secondary" size="small" onClick={handleCreateCategory}>
                        {creatingCategory ? "Creando..." : "Crear"}
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" action="secondary" size="small" onClick={() => setShowCreateCategory(true)}>
                      + Crear categoría
                    </Button>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nombre del producto</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Ej: Galletas de avena"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>SKU</label>
                  <div className={styles.quantityGroup}>
                    <input
                      type="text"
                      className={styles.input}
                      value={newProductSku}
                      readOnly
                      aria-readonly="true"
                      placeholder="Ej: GAL001"
                    />
                    <Button type="button" action="secondary" onClick={handleGenerateSku} disabled={Boolean(newProductSku)}>
                      {newProductSku ? "SKU asignado" : "Generar"}
                    </Button>
                  </div>
                  {skuHint ? <p className={styles.label}>{skuHint}</p> : null}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Nombre de la variante</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    placeholder="Ej: Bolsa de 500 g"
                  />
                </div>
                {createProductError ? (
                  <p className={styles.label} style={{ color: "#b91c1c" }}>{createProductError}</p>
                ) : null}
                <Button
                  type="button"
                  action="primary"
                  onClick={handleCreateProductAndVariant}
                >
                  {creatingProduct ? "Creando..." : "Crear y seleccionar"}
                </Button>
              </div>
            )}
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

          {/* Pasos del proceso */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Pasos del Proceso</h2>
              <Button type="button" onClick={addStep} action="secondary" size="small">
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
                </div>

                {/* Materias primas del paso */}
                <div className={styles.sectionHeader}>
                  <label className={styles.label}>Materias primas de este paso</label>
                  <Button type="button" onClick={() => addMaterial(step.id)} action="secondary" size="small">
                    + Agregar Materia Prima
                  </Button>
                </div>
                {step.materials.map((material, index) => (
                  <div key={index} className={styles.materialRow}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Materia prima</label>
                      <select
                        className={styles.input}
                        value={material.rawMaterialId}
                        onChange={(e) => updateMaterial(step.id, index, "rawMaterialId", e.target.value)}
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {rawMaterials.map((rm) => (
                          <option key={rm.id} value={rm.id}>
                            {rm.code} — {rm.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.quantityGroup}>
                      <div className={styles.inputGroup}>
                        <label className={styles.label}>Cantidad sugerida</label>
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          className={styles.input}
                          value={material.quantity}
                          onChange={(e) =>
                            updateMaterial(
                              step.id,
                              index,
                              "quantity",
                              Math.max(0.001, parseFloat(e.target.value) || 0.001)
                            )
                          }
                          required
                        />
                      </div>
                      <select
                        value={material.unitId}
                        onChange={(e) => updateMaterial(step.id, index, "unitId", parseInt(e.target.value, 10))}
                        className={styles.unitSelect}
                      >
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removeMaterial(step.id, index)}
                      action="negative"
                      className={styles.removeButton}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
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
