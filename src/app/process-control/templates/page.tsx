"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import styles from "./Templates.module.css";

const TemplatesPage = () => {
  const router = useRouter();

  const [templates, setTemplates] = useState([]);
  const [products, setProducts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTplProductId, setNewTplProductId] = useState("");
  const [newTplName, setNewTplName] = useState("");

  const [draftSteps, setDraftSteps] = useState([
    {
      position: 1,
      name: "",
      idealDurationMin: "",
      instructions: "",
      materialsText: "",
    },
  ]);

  const loadTemplates = useCallback(async () => {
    const res = await fetch("/api/process-templates", {
      credentials: "include",
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    setTemplates(data);
  }, []);

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/products", {
      credentials: "include",
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    setProducts(data);
  }, []);

  useEffect(() => {
    void loadTemplates();
    void loadProducts();
  }, [loadTemplates, loadProducts]);

  const addDraftStep = () => {
    setDraftSteps((current) => [
      ...current,
      {
        position: current.length + 1,
        name: "",
        idealDurationMin: "",
        instructions: "",
        materialsText: "",
      },
    ]);
  };

  const updateDraftStep = (index, field, value) => {
    setDraftSteps((current) =>
      current.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      )
    );
  };

  const removeDraftStep = (index) => {
    setDraftSteps((current) =>
      current
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, position: i + 1 }))
    );
  };

  const previewTemplate = () => {
    console.log({
      productId: Number(newTplProductId),
      name: newTplName.trim(),
      steps: draftSteps,
    });

    setShowNewTemplate(false);
    setNewTplProductId("");
    setNewTplName("");
    setDraftSteps([
      {
        position: 1,
        name: "",
        idealDurationMin: "",
        instructions: "",
        materialsText: "",
      },
    ]);
  };

  return (
    <div className="page">
      <HeaderXuchil />

      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1>Plantillas de proceso</h1>

          <Button
            size="small"
            action="secondary"
            onClick={() => setShowNewTemplate((current) => !current)}
          >
            + Nueva plantilla
          </Button>
        </div>

        {showNewTemplate && (
          <div className={styles.formCard}>
            <h3>Nueva plantilla</h3>

            <label>Producto</label>
            <select
              className={styles.select}
              value={newTplProductId}
              onChange={(e) => setNewTplProductId(e.target.value)}
            >
              <option value="">Seleccionar producto...</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <label>Nombre del proceso</label>
            <input
              className={styles.input}
              value={newTplName}
              onChange={(e) => setNewTplName(e.target.value)}
              placeholder="Ej: Basic Bread Process"
            />

            <h4>Pasos</h4>

            {draftSteps.map((step, index) => (
              <div key={index} className={styles.formCard}>
                <h4>Paso {index + 1}</h4>

                <input
                  className={styles.input}
                  type="number"
                  value={step.position}
                  onChange={(e) =>
                    updateDraftStep(index, "position", Number(e.target.value))
                  }
                  placeholder="Posición"
                />

                <input
                  className={styles.input}
                  value={step.name}
                  onChange={(e) =>
                    updateDraftStep(index, "name", e.target.value)
                  }
                  placeholder="Nombre del paso"
                />

                <input
                  className={styles.input}
                  type="number"
                  value={step.idealDurationMin}
                  onChange={(e) =>
                    updateDraftStep(
                      index,
                      "idealDurationMin",
                      e.target.value
                    )
                  }
                  placeholder="Duración ideal en minutos"
                />

                <input
                  className={styles.input}
                  value={step.instructions}
                  onChange={(e) =>
                    updateDraftStep(index, "instructions", e.target.value)
                  }
                  placeholder="Instrucciones"
                />

                <input
                  className={styles.input}
                  value={step.materialsText}
                  onChange={(e) =>
                    updateDraftStep(index, "materialsText", e.target.value)
                  }
                  placeholder="Materiales separados por coma. Ej: Flour, Water, Yeast"
                />

                {draftSteps.length > 1 && (
                  <Button
                    size="small"
                    action="secondary"
                    onClick={() => removeDraftStep(index)}
                  >
                    Eliminar paso
                  </Button>
                )}
              </div>
            ))}

            <div className={styles.formActions}>
              <Button size="small" action="secondary" onClick={addDraftStep}>
                + Agregar paso
              </Button>

              <Button size="small" action="primary" onClick={previewTemplate}>
                Crear preview
              </Button>

              <Button
                size="small"
                action="secondary"
                onClick={() => setShowNewTemplate(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {templates.map((tpl) => (
          <div key={tpl.id} className={styles.templateCard}>
            <div
              className={styles.templateHeader}
              onClick={() =>
                setExpandedId((current) =>
                  current === tpl.id ? null : tpl.id
                )
              }
            >
              <div className={styles.templateInfo}>
                <span className={styles.templateName}>{tpl.name}</span>

                <span className={styles.variantLabel}>
                  {tpl.product?.name ?? "Sin producto"}
                </span>
              </div>

              <div className={styles.templateActions}>
                <span className={styles.stepCount}>
                  {tpl.processTemplateSteps?.length ?? 0} pasos
                </span>

                <span className={styles.chevron}>
                  {expandedId === tpl.id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expandedId === tpl.id && (
              <div className={styles.templateBody}>
                <h4>Pasos</h4>

                {(tpl.processTemplateSteps?.length ?? 0) === 0 && (
                  <p className={styles.noSteps}>Sin pasos definidos.</p>
                )}

                <ol className={styles.stepList}>
                  {(tpl.processTemplateSteps ?? [])
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((step) => (
                      <li key={step.id} className={styles.stepItem}>
                        <div>
                          <div className={styles.stepRow}>
                            <div className={styles.stepInfo}>
                              <strong>
                                {step.position}. {step.name}
                              </strong>

                              {step.idealDurationMin != null && (
                                <span className={styles.stepDuration}>
                                  {step.idealDurationMin} min
                                </span>
                              )}

                              {step.instructions && (
                                <span className={styles.stepInstr}>
                                  {step.instructions}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className={styles.materialsList}>
                            <h5>Materiales</h5>

                            {(step.processTemplateStepMaterials?.length ?? 0) ===
                              0 && (
                              <p className={styles.noSteps}>Sin materiales.</p>
                            )}

                            <ul>
                              {(step.processTemplateStepMaterials ?? []).map(
                                (material) => (
                                  <li key={material.id}>
                                    <span>
                                      {material.rawMaterial?.name ??
                                        `Material #${material.rawMaterialId}`}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </li>
                    ))}
                </ol>
              </div>
            )}
          </div>
        ))}

        <button
          className={styles.backBtn}
          onClick={() => router.push("/process-control")}
        >
          ← Volver
        </button>
      </div>
    </div>
  );
};

export default TemplatesPage;