"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
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
    <div className="page">
      <form onSubmit={handleSubmit} className={styles.wrapper}>
        <button
          type="button"
          className={styles.back}
          onClick={() => router.push("/process-control")}
        >
          <ChevronLeft size={18} />
          Control de procesos
        </button>

        <h1 className={styles.title}>Nuevo proceso</h1>
        <p className={styles.intro}>
          Define la información base y los pasos del flujo. Las materias primas
          se asignan al paso que las consume.
        </p>

        <p className={styles.sectionLabel}>Información del proceso</p>

        <section className={styles.card}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="variante">
              Variante de producto
            </label>
            <select
              id="variante"
              className={styles.select}
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
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setShowCreateProduct((prev) => !prev)}
            >
              {showCreateProduct ? "Cancelar producto nuevo" : "+ Crear producto nuevo"}
            </button>

            {showCreateProduct && (
              <div className={styles.subPanel}>
                <p className={styles.subTitle}>Producto nuevo</p>

                <div className={styles.subField}>
                  <label className={styles.label} htmlFor="nueva-categoria">
                    Categoría
                  </label>
                  <select
                    id="nueva-categoria"
                    className={styles.select}
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
                    <div className={styles.codeRow}>
                      <input
                        type="text"
                        className={styles.input}
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Nueva categoría"
                        aria-label="Nombre de la nueva categoría"
                      />
                      <button
                        type="button"
                        className={styles.inlineButton}
                        onClick={handleCreateCategory}
                      >
                        {creatingCategory ? "Creando..." : "Crear"}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => setShowCreateCategory(true)}
                    >
                      + Crear categoría
                    </button>
                  )}
                </div>

                <div className={styles.subField}>
                  <label className={styles.label} htmlFor="nuevo-producto">
                    Nombre del producto
                  </label>
                  <input
                    id="nuevo-producto"
                    type="text"
                    className={styles.input}
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Ej: Galletas de avena"
                  />
                </div>

                <div className={styles.subField}>
                  <label className={styles.label} htmlFor="nuevo-sku">
                    SKU
                  </label>
                  <div className={styles.codeRow}>
                    <input
                      id="nuevo-sku"
                      type="text"
                      className={styles.input}
                      value={newProductSku}
                      readOnly
                      aria-readonly="true"
                      placeholder="Ej: GAL001"
                    />
                    <button
                      type="button"
                      className={styles.inlineButton}
                      onClick={handleGenerateSku}
                      disabled={Boolean(newProductSku)}
                    >
                      {newProductSku ? "SKU asignado" : "Generar"}
                    </button>
                  </div>
                  {skuHint ? <p className={styles.hint}>{skuHint}</p> : null}
                </div>

                <div className={styles.subField}>
                  <label className={styles.label} htmlFor="nueva-variante">
                    Nombre de la variante
                  </label>
                  <input
                    id="nueva-variante"
                    type="text"
                    className={styles.input}
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    placeholder="Ej: Bolsa de 500 g"
                  />
                </div>

                {createProductError ? (
                  <p className={styles.error}>{createProductError}</p>
                ) : null}

                <button
                  type="button"
                  className={styles.subSubmit}
                  onClick={handleCreateProductAndVariant}
                >
                  {creatingProduct ? "Creando..." : "Crear y seleccionar"}
                </button>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="nombre-proceso">
              Nombre del proceso
            </label>
            <input
              id="nombre-proceso"
              type="text"
              className={styles.input}
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="Ej: Galletas de Zanahoria"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="descripcion-proceso">
              Descripción
            </label>
            <textarea
              id="descripcion-proceso"
              className={styles.textarea}
              value={processDescription}
              onChange={(e) => setProcessDescription(e.target.value)}
              placeholder="Descripción del proceso..."
              rows={3}
            />
          </div>
        </section>

        <div className={styles.sectionHead}>
          <p className={styles.sectionLabel}>Pasos del proceso</p>
          <button type="button" className={styles.inlineButton} onClick={addStep}>
            + Agregar paso
          </button>
        </div>

        {steps.map((step) => (
          <section key={step.id} className={styles.card}>
            <div className={styles.stepHead}>
              <h2 className={styles.stepTitle}>Paso {step.id}</h2>
              {steps.length > 1 && (
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeStep(step.id)}
                  aria-label={`Eliminar paso ${step.id}`}
                  title="Eliminar paso"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={`paso-${step.id}-titulo`}>
                Título del paso
              </label>
              <input
                id={`paso-${step.id}-titulo`}
                type="text"
                className={styles.input}
                value={step.title}
                onChange={(e) => updateStep(step.id, "title", e.target.value)}
                placeholder="Ej: Preparación de ingredientes"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={`paso-${step.id}-descripcion`}>
                Descripción
              </label>
              <textarea
                id={`paso-${step.id}-descripcion`}
                className={styles.textarea}
                value={step.description || ""}
                onChange={(e) => updateStep(step.id, "description", e.target.value)}
                placeholder="Descripción detallada del paso..."
                rows={2}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={`paso-${step.id}-tiempo`}>
                Tiempo estimado (minutos)
              </label>
              <input
                id={`paso-${step.id}-tiempo`}
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

            <div className={styles.field}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={step.hasInput}
                  onChange={(e) => updateStep(step.id, "hasInput", e.target.checked)}
                />
                Requiere entrada de datos
              </label>
            </div>

            <div className={styles.field}>
              <div className={styles.materialsHead}>
                <span className={styles.label}>Materias primas de este paso</span>
                <button
                  type="button"
                  className={styles.inlineButton}
                  onClick={() => addMaterial(step.id)}
                >
                  + Agregar materia prima
                </button>
              </div>

              {step.materials.length === 0 && (
                <p className={styles.empty}>Sin materias primas asignadas.</p>
              )}

              {step.materials.map((material, index) => (
                <div key={index} className={styles.materialRow}>
                  <div className={styles.materialFields}>
                    <div className={styles.subField}>
                      <label
                        className={styles.label}
                        htmlFor={`paso-${step.id}-material-${index}`}
                      >
                        Materia prima
                      </label>
                      <select
                        id={`paso-${step.id}-material-${index}`}
                        className={styles.select}
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

                    <div className={styles.subField}>
                      <label
                        className={styles.label}
                        htmlFor={`paso-${step.id}-cantidad-${index}`}
                      >
                        Cantidad sugerida
                      </label>
                      <div className={styles.pair}>
                        <input
                          id={`paso-${step.id}-cantidad-${index}`}
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
                        <select
                          className={styles.select}
                          value={material.unitId}
                          onChange={(e) => updateMaterial(step.id, index, "unitId", parseInt(e.target.value, 10))}
                          aria-label="Unidad"
                        >
                          {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeMaterial(step.id, index)}
                    aria-label="Eliminar materia prima"
                    title="Eliminar materia prima"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancel}
            onClick={() => router.push("/process-control")}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.submit}>
            Crear proceso
          </button>
        </div>
      </form>

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
