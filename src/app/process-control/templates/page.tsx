"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import styles from "./Templates.module.css";
import templateClient from "@/lib/services/templateClient";
import productClient from "@/lib/services/productClient";
import {
  ProcessTemplateRead,
  ProcessTemplateStepMaterialRead,
  ProcessTemplateStepRead,
  ProductRead,
  RawMaterialRead,
} from "@/lib/schemas";

const TemplatesPage = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProcessTemplateRead[]>([]);
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterialRead[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);
  const [showNewStepForTemplateId, setShowNewStepForTemplateId] = useState<number | null>(null);
  const [showNewMaterialForStepId, setShowNewMaterialForStepId] = useState<number | null>(null);

  const [newTplProductId, setNewTplProductId] = useState("");
  const [newTplName, setNewTplName] = useState("");

  const [editTplProductId, setEditTplProductId] = useState("");
  const [editTplName, setEditTplName] = useState("");

  const [newStepPosition, setNewStepPosition] = useState("");
  const [newStepName, setNewStepName] = useState("");
  const [newStepDuration, setNewStepDuration] = useState("");
  const [newStepInstructions, setNewStepInstructions] = useState("");

  const [editStepPosition, setEditStepPosition] = useState("");
  const [editStepName, setEditStepName] = useState("");
  const [editStepDuration, setEditStepDuration] = useState("");
  const [editStepInstructions, setEditStepInstructions] = useState("");

  const [newMaterialRawMaterialId, setNewMaterialRawMaterialId] = useState("");
  const [editMaterialRawMaterialId, setEditMaterialRawMaterialId] = useState("");

  const loadTemplates = useCallback(async () => {
    const data = await templateClient.getAllProcessTemplates();
    setTemplates(data);
  }, []);

  const loadProducts = useCallback(async () => {
    setProducts(await productClient.getAllProducts());
  }, []);

  const loadRawMaterials = useCallback(async () => {
    setRawMaterials(await productClient.getAllRawMaterials());
  }, []);

  useEffect(() => {
    void loadTemplates();
    void loadProducts();
    void loadRawMaterials();
  }, [loadTemplates, loadProducts, loadRawMaterials]);

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const rawMaterialById = useMemo(() => new Map(rawMaterials.map((m) => [m.id, m])), [rawMaterials]);

  const refresh = async () => {
    await loadTemplates();
  };

  const startEditTemplate = (tpl: ProcessTemplateRead) => {
    setEditingTemplateId(tpl.id);
    setEditTplProductId(String(tpl.productId));
    setEditTplName(tpl.name);
  };

  const saveTemplate = async (tplId: number) => {
    await templateClient.updateProcessTemplate(tplId, {
      productId: Number(editTplProductId),
      name: editTplName.trim(),
    });
    setEditingTemplateId(null);
    await refresh();
  };

  const createTemplate = async () => {
    await templateClient.createProcessTemplate({
      productId: Number(newTplProductId),
      name: newTplName.trim(),
    });
    setShowNewTemplate(false);
    setNewTplProductId("");
    setNewTplName("");
    await refresh();
  };

  const deleteTemplate = async (tplId: number) => {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    await templateClient.deleteProcessTemplate(tplId);
    await refresh();
  };

  const startEditStep = (step: ProcessTemplateStepRead) => {
    setEditingStepId(step.id);
    setEditStepPosition(String(step.position));
    setEditStepName(step.name);
    setEditStepDuration(step.idealDurationMin == null ? "" : String(step.idealDurationMin));
    setEditStepInstructions(step.instructions ?? "");
  };

  const createStep = async (templateId: number) => {
    const nextPosition = Number(newStepPosition);
    await templateClient.createProcessTemplateStep({
      processId: templateId,
      position: nextPosition,
      name: newStepName.trim(),
      idealDurationMin: newStepDuration ? Number(newStepDuration) : undefined,
      instructions: newStepInstructions.trim() || undefined,
    });
    setShowNewStepForTemplateId(null);
    setNewStepPosition("");
    setNewStepName("");
    setNewStepDuration("");
    setNewStepInstructions("");
    await refresh();
  };

  const saveStep = async (step: ProcessTemplateStepRead) => {
    await templateClient.updateProcessTemplateStep(step.id, {
      processId: step.processId,
      position: Number(editStepPosition),
      name: editStepName.trim(),
      idealDurationMin: editStepDuration ? Number(editStepDuration) : undefined,
      instructions: editStepInstructions.trim() || undefined,
    });
    setEditingStepId(null);
    await refresh();
  };

  const deleteStep = async (stepId: number) => {
    if (!confirm("¿Eliminar este paso?")) return;
    await templateClient.deleteProcessTemplateStep(stepId);
    await refresh();
  };

  const startEditMaterial = (material: ProcessTemplateStepMaterialRead) => {
    setEditingMaterialId(material.id);
    setEditMaterialRawMaterialId(String(material.rawMaterialId));
  };

  const createMaterial = async (stepId: number) => {
    await templateClient.createProcessTemplateStepMaterial({
      stepId,
      rawMaterialId: Number(newMaterialRawMaterialId),
    });
    setShowNewMaterialForStepId(null);
    setNewMaterialRawMaterialId("");
    await refresh();
  };

  const saveMaterial = async (material: ProcessTemplateStepMaterialRead) => {
    await templateClient.updateProcessTemplateStepMaterial(material.id, {
      stepId: material.stepId,
      rawMaterialId: Number(editMaterialRawMaterialId),
    });
    setEditingMaterialId(null);
    await refresh();
  };

  const deleteMaterial = async (materialId: number) => {
    if (!confirm("¿Eliminar este material?")) return;
    await templateClient.deleteProcessTemplateStepMaterial(materialId);
    await refresh();
  };

  const getProductLabel = (productId: number) => productById.get(productId)?.name ?? `Producto #${productId}`;

  return (
    <div className="page">
      <HeaderXuchil />
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1>Plantillas de proceso</h1>
          <Button size="small" action="secondary" onClick={() => setShowNewTemplate((v) => !v)}>
            + Nueva plantilla
          </Button>
        </div>

        {showNewTemplate && (
          <div className={styles.formCard}>
            <h3>Nueva plantilla</h3>
            <label>Producto</label>
            <select className={styles.select} value={newTplProductId} onChange={(e) => setNewTplProductId(e.target.value)}>
              <option value="">Seleccionar...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <label>Nombre</label>
            <input className={styles.input} value={newTplName} onChange={(e) => setNewTplName(e.target.value)} />
            <div className={styles.formActions}>
              <Button size="small" action="primary" onClick={createTemplate}>Crear</Button>
              <Button size="small" action="secondary" onClick={() => setShowNewTemplate(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {templates.map((tpl) => (
          <div key={tpl.id} className={styles.templateCard}>
            <div className={styles.templateHeader} onClick={() => setExpandedId((current) => (current === tpl.id ? null : tpl.id))}>
              <div className={styles.templateInfo}>
                <span className={styles.templateName}>{tpl.name}</span>
                <span className={styles.variantLabel}>{getProductLabel(tpl.productId)}</span>
              </div>
              <div className={styles.templateActions}>
                <span className={styles.stepCount}>{tpl.processTemplateSteps.length} pasos</span>
                <span className={styles.chevron}>{expandedId === tpl.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {expandedId === tpl.id && (
              <div className={styles.templateBody}>
                <div className={styles.formActions}>
                  <Button size="small" action="secondary" onClick={() => startEditTemplate(tpl)}>Editar plantilla</Button>
                  <Button size="small" action="secondary" onClick={() => deleteTemplate(tpl.id)}>Eliminar plantilla</Button>
                </div>

                {editingTemplateId === tpl.id && (
                  <div className={styles.formCard}>
                    <h4>Editar plantilla</h4>
                    <label>Producto</label>
                    <select className={styles.select} value={editTplProductId} onChange={(e) => setEditTplProductId(e.target.value)}>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                    <label>Nombre</label>
                    <input className={styles.input} value={editTplName} onChange={(e) => setEditTplName(e.target.value)} />
                    <div className={styles.formActions}>
                      <Button size="small" action="primary" onClick={() => saveTemplate(tpl.id)}>Guardar</Button>
                      <Button size="small" action="secondary" onClick={() => setEditingTemplateId(null)}>Cancelar</Button>
                    </div>
                  </div>
                )}

                <h4>Pasos</h4>
                {tpl.processTemplateSteps.length === 0 && <p className={styles.noSteps}>Sin pasos definidos.</p>}
                <ol className={styles.stepList}>
                  {tpl.processTemplateSteps
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((step) => (
                      <li key={step.id} className={styles.stepItem}>
                        {editingStepId === step.id ? (
                          <div className={styles.stepEditForm}>
                            <input className={styles.input} value={editStepPosition} onChange={(e) => setEditStepPosition(e.target.value)} type="number" placeholder="Posición" />
                            <input className={styles.input} value={editStepName} onChange={(e) => setEditStepName(e.target.value)} placeholder="Nombre" />
                            <input className={styles.input} value={editStepDuration} onChange={(e) => setEditStepDuration(e.target.value)} type="number" placeholder="Duración ideal (min)" />
                            <input className={styles.input} value={editStepInstructions} onChange={(e) => setEditStepInstructions(e.target.value)} placeholder="Instrucciones" />
                            <div className={styles.formActions}>
                              <Button size="small" action="primary" onClick={() => saveStep(step)}>Guardar</Button>
                              <Button size="small" action="secondary" onClick={() => setEditingStepId(null)}>Cancelar</Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className={styles.stepRow}>
                              <div className={styles.stepInfo}>
                                <strong>{step.position}. {step.name}</strong>
                                {step.idealDurationMin != null && <span className={styles.stepDuration}>{step.idealDurationMin} min</span>}
                                {step.instructions && <span className={styles.stepInstr}>{step.instructions}</span>}
                              </div>
                              <div className={styles.stepActions}>
                                <button className={styles.linkBtn} onClick={() => startEditStep(step)}>Editar</button>
                                <button className={styles.linkBtn} onClick={() => deleteStep(step.id)}>Eliminar</button>
                              </div>
                            </div>

                            <div className={styles.materialsList}>
                              <h5>Materiales</h5>
                              {step.processTemplateStepMaterials.length === 0 && <p className={styles.noSteps}>Sin materiales.</p>}
                              <ul>
                                {step.processTemplateStepMaterials.map((material) => (
                                  <li key={material.id}>
                                    {editingMaterialId === material.id ? (
                                      <div className={styles.formCard}>
                                        <select className={styles.select} value={editMaterialRawMaterialId} onChange={(e) => setEditMaterialRawMaterialId(e.target.value)}>
                                          {rawMaterials.map((raw) => (
                                            <option key={raw.id} value={raw.id}>{raw.name}</option>
                                          ))}
                                        </select>
                                        <div className={styles.formActions}>
                                          <Button size="small" action="primary" onClick={() => saveMaterial(material)}>Guardar</Button>
                                          <Button size="small" action="secondary" onClick={() => setEditingMaterialId(null)}>Cancelar</Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className={styles.stepRow}>
                                        <span>{rawMaterialById.get(material.rawMaterialId)?.name}</span>
                                        <div className={styles.stepActions}>
                                          <button className={styles.linkBtn} onClick={() => startEditMaterial(material)}>Editar</button>
                                          <button className={styles.linkBtn} onClick={() => deleteMaterial(material.id)}>Eliminar</button>
                                        </div>
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>

                              {showNewMaterialForStepId === step.id ? (
                                <div className={styles.formCard}>
                                  <select className={styles.select} value={newMaterialRawMaterialId} onChange={(e) => setNewMaterialRawMaterialId(e.target.value)}>
                                    <option value="">Seleccionar material...</option>
                                    {rawMaterials.map((raw) => (
                                      <option key={raw.id} value={raw.id}>{raw.name}</option>
                                    ))}
                                  </select>
                                  <div className={styles.formActions}>
                                    <Button size="small" action="primary" onClick={() => createMaterial(step.id)}>Agregar</Button>
                                    <Button size="small" action="secondary" onClick={() => setShowNewMaterialForStepId(null)}>Cancelar</Button>
                                  </div>
                                </div>
                              ) : (
                                <button className={styles.addStepBtn} onClick={() => setShowNewMaterialForStepId(step.id)}>+ Agregar material</button>
                              )}
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                </ol>

                {showNewStepForTemplateId === tpl.id ? (
                  <div className={styles.stepEditForm}>
                    <h4>Agregar paso</h4>
                    <input className={styles.input} value={newStepPosition} onChange={(e) => setNewStepPosition(e.target.value)} type="number" placeholder="Posición" />
                    <input className={styles.input} value={newStepName} onChange={(e) => setNewStepName(e.target.value)} placeholder="Nombre" />
                    <input className={styles.input} value={newStepDuration} onChange={(e) => setNewStepDuration(e.target.value)} type="number" placeholder="Duración ideal (min)" />
                    <input className={styles.input} value={newStepInstructions} onChange={(e) => setNewStepInstructions(e.target.value)} placeholder="Instrucciones" />
                    <div className={styles.formActions}>
                      <Button size="small" action="primary" onClick={() => createStep(tpl.id)}>Agregar</Button>
                      <Button size="small" action="secondary" onClick={() => setShowNewStepForTemplateId(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <button className={styles.addStepBtn} onClick={() => setShowNewStepForTemplateId(tpl.id)}>+ Agregar paso</button>
                )}
              </div>
            )}
          </div>
        ))}

        <button className={styles.backBtn} onClick={() => router.push("/process-control")}>← Volver</button>
      </div>
    </div>
  );
};

export default TemplatesPage;
