"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import styles from "./Templates.module.css";

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
        const res = await fetch("/api/process-templates", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();

        // Load detail for each template to get steps
        const detailed: Template[] = await Promise.all(
            data.map(async (tpl: any) => {
                const detailRes = await fetch(`/api/process-templates/${tpl.id}`, { credentials: "include" });
                if (detailRes.ok) {
                    return await detailRes.json();
                }
                return { ...tpl, templateSteps: [] };
            })
        );

        setTemplates(detailed);
    }, []);

    const loadVariants = useCallback(async () => {
        const res = await fetch("/api/product-variants", { credentials: "include" });
        if (res.ok) {
            const data = await res.json();
            setVariants(data);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
        loadVariants();
    }, [loadTemplates, loadVariants]);

    const handleCreateTemplate = async () => {
        if (!newTplVariantId || !newTplName.trim()) return;
        const res = await fetch("/api/process-templates", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productVariantId: parseInt(newTplVariantId),
                name: newTplName.trim(),
                isActive: true,
            }),
        });
        if (res.ok) {
            setShowNewTemplate(false);
            setNewTplName("");
            setNewTplVariantId("");
            loadTemplates();
        } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || "Error al crear plantilla");
        }
    };

    const handleToggleActive = async (tpl: Template) => {
        await fetch(`/api/process-templates/${tpl.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productVariantId: tpl.productVariantId,
                name: tpl.name,
                isActive: !tpl.isActive,
            }),
        });
        loadTemplates();
    };

    const handleAddStep = async (templateId: number) => {
        if (!newStepName.trim()) return;

        // Find the template to get processTemplateId for the step
        const tpl = templates.find((t) => t.id === templateId);
        if (!tpl) return;

        const res = await fetch(`/api/templates/${templateId}/steps`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                processTemplateId: templateId,
                name: newStepName.trim(),
                idealDurationMin: newStepDuration ? parseInt(newStepDuration) : null,
                instructions: newStepInstructions.trim() || null,
                requiresInput: newStepRequiresInput,
            }),
        });
        if (res.ok) {
            setShowNewStep(null);
            setNewStepName("");
            setNewStepDuration("");
            setNewStepInstructions("");
            setNewStepRequiresInput(false);
            loadTemplates();
        } else {
            const err = await res.json().catch(() => ({}));
            alert(err.error || "Error al agregar paso");
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
        const res = await fetch(`/api/template-steps/${step.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                processTemplateId: step.position, // Keep existing
                name: editStepName.trim(),
                position: step.position,
                idealDurationMin: editStepDuration ? parseInt(editStepDuration) : null,
                instructions: editStepInstructions.trim() || null,
                requiresInput: editStepRequiresInput,
            }),
        });
        if (res.ok) {
            setEditingStepId(null);
            loadTemplates();
        }
    };

    const handleDeleteStep = async (stepId: number) => {
        if (!confirm("¿Eliminar este paso?")) return;
        await fetch(`/api/template-steps/${stepId}`, {
            method: "DELETE",
            credentials: "include",
        });
        loadTemplates();
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
