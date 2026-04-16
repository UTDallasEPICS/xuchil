"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import styles from "./Templates.module.css";
import * as processesService from "@/lib/services/templateClient";
import * as productsService from "@/lib/services/productClient";

interface TemplateStep {
    id: number;
    position: number;
    name: string;
    idealDurationMin: number | null;
    requiresInput: boolean;
    instructions: string | null;
}

interface Template {
    id: number;
    productVariantId: number;
    version: number;
    name: string;
    isActive: boolean;
    notes: string | null;
    templateSteps: TemplateStep[];
    productVariant?: { name: string; product?: { name: string } };
}

interface Variant {
    id: number;
    name: string;
    product: { name: string };
}

const TemplatesPage = () => {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editingStepId, setEditingStepId] = useState<number | null>(null);
    const [showNewTemplate, setShowNewTemplate] = useState(false);
    const [showNewStep, setShowNewStep] = useState<number | null>(null);

    // New template form
    const [newTplVariantId, setNewTplVariantId] = useState("");
    const [newTplName, setNewTplName] = useState("");

    // New step form
    const [newStepName, setNewStepName] = useState("");
    const [newStepDuration, setNewStepDuration] = useState("");
    const [newStepInstructions, setNewStepInstructions] = useState("");
    const [newStepRequiresInput, setNewStepRequiresInput] = useState(false);

    // Edit step form
    const [editStepName, setEditStepName] = useState("");
    const [editStepDuration, setEditStepDuration] = useState("");
    const [editStepInstructions, setEditStepInstructions] = useState("");
    const [editStepRequiresInput, setEditStepRequiresInput] = useState(false);

    const loadTemplates = useCallback(async () => {
        try {
            const listRaw = await processesService.listProcessTemplates();
            const list = Array.isArray(listRaw) ? listRaw as unknown[] : [];

            const detailed: Template[] = await Promise.all(
                list.map(async (tplRaw) => {
                    const tpl = tplRaw as Record<string, unknown>;
                    const id = typeof tpl.id === "number" ? tpl.id : Number(tpl.id);
                    try {
                        const detail = await processesService.getProcessTemplate(id);
                        return detail as Template;
                    } catch {
                        return {
                            id,
                            productVariantId: typeof tpl.productVariantId === 'number' ? tpl.productVariantId as number : Number(tpl.productVariantId),
                            version: typeof tpl.version === 'number' ? tpl.version as number : 1,
                            name: String(tpl.name ?? ""),
                            isActive: Boolean(tpl.isActive),
                            notes: null,
                            templateSteps: [],
                        } as Template;
                    }
                })
            );

            setTemplates(detailed);
        } catch (e) {
            console.error("Failed to load templates:", e);
        }
    }, []);

    const loadVariants = useCallback(async () => {
        try {
            const data = await productsService.fetchProductVariants();
            setVariants(Array.isArray(data) ? data as Variant[] : []);
        } catch (e) {
            console.error("Failed to load variants:", e);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
        loadVariants();
    }, [loadTemplates, loadVariants]);

    const handleCreateTemplate = async () => {
        if (!newTplVariantId || !newTplName.trim()) return;
        try {
            await processesService.createTemplate({
                productVariantId: parseInt(newTplVariantId),
                name: newTplName.trim(),
                isActive: true,
            });
            setShowNewTemplate(false);
            setNewTplName("");
            setNewTplVariantId("");
            loadTemplates();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al crear plantilla";
            alert(message);
        }
    };

    const handleToggleActive = async (tpl: Template) => {
        try {
            await processesService.updateTemplate(tpl.id, {
                productVariantId: tpl.productVariantId,
                name: tpl.name,
                isActive: !tpl.isActive,
            });
            loadTemplates();
        } catch (e) {
            console.error("Failed to toggle template active:", e);
        }
    };

    const handleAddStep = async (templateId: number) => {
        if (!newStepName.trim()) return;
        try {
            await processesService.addTemplateStep(templateId, {
                processTemplateId: templateId,
                name: newStepName.trim(),
                idealDurationMin: newStepDuration ? parseInt(newStepDuration) : null,
                instructions: newStepInstructions.trim() || null,
                requiresInput: newStepRequiresInput,
            });
            setShowNewStep(null);
            setNewStepName("");
            setNewStepDuration("");
            setNewStepInstructions("");
            setNewStepRequiresInput(false);
            loadTemplates();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al agregar paso";
            alert(message);
        }
    };

    const handleStartEditStep = (step: TemplateStep) => {
        setEditingStepId(step.id);
        setEditStepName(step.name);
        setEditStepDuration(step.idealDurationMin?.toString() || "");
        setEditStepInstructions(step.instructions || "");
        setEditStepRequiresInput(step.requiresInput);
    };

    const handleSaveStep = async (step: TemplateStep) => {
        try {
            await processesService.updateTemplateStep(step.id, {
                processTemplateId: step.position, // Keep existing
                name: editStepName.trim(),
                position: step.position,
                idealDurationMin: editStepDuration ? parseInt(editStepDuration) : null,
                instructions: editStepInstructions.trim() || null,
                requiresInput: editStepRequiresInput,
            });
            setEditingStepId(null);
            loadTemplates();
        } catch (e) {
            console.error("Failed to save step:", e);
        }
    };

    const handleDeleteStep = async (stepId: number) => {
        if (!confirm("¿Eliminar este paso?")) return;
        try {
            await processesService.deleteTemplateStep(stepId);
            loadTemplates();
        } catch (e) {
            console.error("Failed to delete step:", e);
        }
    };

    const getVariantLabel = (tpl: Template) => {
        const v = variants.find((v) => v.id === tpl.productVariantId);
        if (v) return `${v.product?.name || ""} — ${v.name}`;
        return `Variante #${tpl.productVariantId}`;
    };

    return (
        <div className="page">
            <HeaderXuchil />
            <div className={styles.container}>
                <div className={styles.headerRow}>
                    <h1>Plantillas de proceso</h1>
                    <Button size="small" action="secondary" onClick={() => setShowNewTemplate(!showNewTemplate)}>
                        + Nueva plantilla
                    </Button>
                </div>

                {showNewTemplate && (
                    <div className={styles.formCard}>
                        <h3>Nueva plantilla</h3>
                        <label>Variante de producto:</label>
                        <select value={newTplVariantId} onChange={(e) => setNewTplVariantId(e.target.value)} className={styles.select}>
                            <option value="">Seleccionar...</option>
                            {variants.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.product?.name} — {v.name}
                                </option>
                            ))}
                        </select>
                        <label>Nombre:</label>
                        <input
                            value={newTplName}
                            onChange={(e) => setNewTplName(e.target.value)}
                            placeholder="Ej: Proceso estándar v1"
                            className={styles.input}
                        />
                        <div className={styles.formActions}>
                            <Button size="small" action="primary" onClick={handleCreateTemplate}>Crear</Button>
                            <Button size="small" action="secondary" onClick={() => setShowNewTemplate(false)}>Cancelar</Button>
                        </div>
                    </div>
                )}

                {templates.length === 0 && !showNewTemplate && (
                    <p className={styles.emptyText}>No hay plantillas configuradas. Crea una para empezar.</p>
                )}

                {templates.map((tpl) => (
                    <div key={tpl.id} className={`${styles.templateCard} ${!tpl.isActive ? styles.inactive : ""}`}>
                        <div className={styles.templateHeader} onClick={() => setExpandedId(expandedId === tpl.id ? null : tpl.id)}>
                            <div className={styles.templateInfo}>
                                <span className={styles.templateName}>{tpl.name}</span>
                                <span className={styles.variantLabel}>{getVariantLabel(tpl)}</span>
                            </div>
                            <div className={styles.templateActions}>
                                <span className={`${styles.badge} ${tpl.isActive ? styles.activeBadge : styles.inactiveBadge}`}>
                                    {tpl.isActive ? "Activa" : "Inactiva"}
                                </span>
                                <span className={styles.stepCount}>{tpl.templateSteps?.length || 0} pasos</span>
                                <span className={styles.chevron}>{expandedId === tpl.id ? "▲" : "▼"}</span>
                            </div>
                        </div>

                        {expandedId === tpl.id && (
                            <div className={styles.templateBody}>
                                <div className={styles.toggleRow}>
                                    <button className={styles.linkBtn} onClick={() => handleToggleActive(tpl)}>
                                        {tpl.isActive ? "Desactivar" : "Activar"}
                                    </button>
                                </div>

                                <h4>Pasos:</h4>
                                {tpl.templateSteps?.length === 0 && (
                                    <p className={styles.noSteps}>Sin pasos definidos.</p>
                                )}
                                <ol className={styles.stepList}>
                                    {(tpl.templateSteps || [])
                                        .sort((a, b) => a.position - b.position)
                                        .map((step) => (
                                            <li key={step.id} className={styles.stepItem}>
                                                {editingStepId === step.id ? (
                                                    <div className={styles.stepEditForm}>
                                                        <input value={editStepName} onChange={(e) => setEditStepName(e.target.value)} className={styles.input} placeholder="Nombre del paso" />
                                                        <input value={editStepDuration} onChange={(e) => setEditStepDuration(e.target.value)} type="number" className={styles.input} placeholder="Duración (min)" />
                                                        <input value={editStepInstructions} onChange={(e) => setEditStepInstructions(e.target.value)} className={styles.input} placeholder="Instrucciones" />
                                                        <label className={styles.checkLabel}>
                                                            <input type="checkbox" checked={editStepRequiresInput} onChange={(e) => setEditStepRequiresInput(e.target.checked)} />
                                                            Requiere cantidad
                                                        </label>
                                                        <div className={styles.formActions}>
                                                            <button className={styles.saveBtn} onClick={() => handleSaveStep(step)}>Guardar</button>
                                                            <button className={styles.linkBtn} onClick={() => setEditingStepId(null)}>Cancelar</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className={styles.stepRow}>
                                                        <div className={styles.stepInfo}>
                                                            <strong>{step.name}</strong>
                                                            {step.idealDurationMin && <span className={styles.stepDuration}>{step.idealDurationMin} min</span>}
                                                            {step.instructions && <span className={styles.stepInstr}>{step.instructions}</span>}
                                                        </div>
                                                        <div className={styles.stepActions}>
                                                            <button className={styles.linkBtn} onClick={() => handleStartEditStep(step)}>Editar</button>
                                                            <button className={styles.linkBtn} onClick={() => handleDeleteStep(step.id)}>Eliminar</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                </ol>

                                {showNewStep === tpl.id ? (
                                    <div className={styles.stepEditForm}>
                                        <h4>Agregar paso</h4>
                                        <input value={newStepName} onChange={(e) => setNewStepName(e.target.value)} className={styles.input} placeholder="Nombre del paso" />
                                        <input value={newStepDuration} onChange={(e) => setNewStepDuration(e.target.value)} type="number" className={styles.input} placeholder="Duración ideal (min)" />
                                        <input value={newStepInstructions} onChange={(e) => setNewStepInstructions(e.target.value)} className={styles.input} placeholder="Instrucciones (opcional)" />
                                        <label className={styles.checkLabel}>
                                            <input type="checkbox" checked={newStepRequiresInput} onChange={(e) => setNewStepRequiresInput(e.target.checked)} />
                                            Requiere ingresar cantidad
                                        </label>
                                        <div className={styles.formActions}>
                                            <Button size="small" action="primary" onClick={() => handleAddStep(tpl.id)}>Agregar</Button>
                                            <Button size="small" action="secondary" onClick={() => setShowNewStep(null)}>Cancelar</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <button className={styles.addStepBtn} onClick={() => setShowNewStep(tpl.id)}>+ Agregar paso</button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                <button className={styles.backBtn} onClick={() => router.push("/process-control")}>
                    ← Volver
                </button>
            </div>
        </div>
    );
};

export default TemplatesPage;
