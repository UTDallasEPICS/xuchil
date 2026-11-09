"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import styles from "./Templates.module.css";

interface StepRequiredMaterial {
    rawMaterialId: number;
    qtyPerUnitOutput: number;
    unitId: number;
    rawMaterial?: { name: string; code?: string };
    unit?: { name: string };
}

interface TemplateStep {
    id: number;
    position: number;
    name: string;
    idealDurationMin: number | null;
    requiresInput: boolean;
    instructions: string | null;
    stepRequiredMaterials?: StepRequiredMaterial[];
}

interface MaterialRow {
    rawMaterialId: string;
    quantity: number;
    unitId: number;
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

    // Inline product + variant creation
    const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
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

    // Raw materials + units for step material assignment
    const [rawMaterials, setRawMaterials] = useState<Array<{ id: number; name: string; code: string; defaultUnitId: number | null }>>([]);
    const [units, setUnits] = useState<Array<{ id: number; name: string }>>([]);

    // New step form
    const [newStepName, setNewStepName] = useState("");
    const [newStepDuration, setNewStepDuration] = useState("");
    const [newStepInstructions, setNewStepInstructions] = useState("");
    const [newStepRequiresInput, setNewStepRequiresInput] = useState(false);
    const [newStepMaterials, setNewStepMaterials] = useState<MaterialRow[]>([]);

    // Edit step form
    const [editStepName, setEditStepName] = useState("");
    const [editStepDuration, setEditStepDuration] = useState("");
    const [editStepInstructions, setEditStepInstructions] = useState("");
    const [editStepRequiresInput, setEditStepRequiresInput] = useState(false);
    const [editStepMaterials, setEditStepMaterials] = useState<MaterialRow[]>([]);

    const defaultUnitId = () => units[0]?.id ?? 1;

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

    const loadCategories = useCallback(async () => {
        const res = await fetch("/api/product-categories", { credentials: "include" });
        if (res.ok) {
            setCategories(await res.json());
        }
    }, []);

    const loadRefData = useCallback(async () => {
        const [matsRes, unitsRes] = await Promise.all([
            fetch("/api/raw-materials", { credentials: "include" }),
            fetch("/api/units", { credentials: "include" }),
        ]);
        if (matsRes.ok) setRawMaterials(await matsRes.json());
        if (unitsRes.ok) setUnits(await unitsRes.json());
    }, []);

    useEffect(() => {
        loadTemplates();
        loadVariants();
        loadCategories();
        loadRefData();
    }, [loadTemplates, loadVariants, loadCategories, loadRefData]);

    // Helpers to edit a material-row list (used by both add and edit step forms).
    const addMaterialRow = (setter: React.Dispatch<React.SetStateAction<MaterialRow[]>>) =>
        setter((prev) => [...prev, { rawMaterialId: "", quantity: 1, unitId: defaultUnitId() }]);

    const removeMaterialRow = (setter: React.Dispatch<React.SetStateAction<MaterialRow[]>>, index: number) =>
        setter((prev) => prev.filter((_, i) => i !== index));

    const updateMaterialRow = (
        setter: React.Dispatch<React.SetStateAction<MaterialRow[]>>,
        index: number,
        field: keyof MaterialRow,
        value: string | number
    ) =>
        setter((prev) =>
            prev.map((row, i) => {
                if (i !== index) return row;
                const updated = { ...row, [field]: value } as MaterialRow;
                if (field === "rawMaterialId") {
                    const selected = rawMaterials.find((rm) => String(rm.id) === String(value));
                    if (selected?.defaultUnitId) updated.unitId = selected.defaultUnitId;
                }
                return updated;
            })
        );

    const materialsPayload = (rows: MaterialRow[]) =>
        rows
            .filter((row) => row.rawMaterialId && row.quantity > 0)
            .map((row) => ({
                rawMaterialId: parseInt(row.rawMaterialId, 10),
                qtyPerUnitOutput: row.quantity,
                unitId: row.unitId,
            }));

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
        if (!newCategoryId) return setCreateProductError("La categoría es obligatoria.");
        if (!newProductName.trim()) return setCreateProductError("El nombre del producto es obligatorio.");
        if (!newProductSku.trim()) return setCreateProductError("El SKU es obligatorio.");
        if (!newVariantName.trim()) return setCreateProductError("El nombre de la variante es obligatorio.");

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
                body: JSON.stringify({ productId: product.id, name: newVariantName.trim(), isActive: true }),
            });
            if (!variantRes.ok) {
                const err = await variantRes.json().catch(() => ({}));
                throw new Error(err.error || "No se pudo crear la variante.");
            }
            const variant = await variantRes.json();

            await loadVariants();
            setNewTplVariantId(String(variant.id));

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
                materials: materialsPayload(newStepMaterials),
            }),
        });
        if (res.ok) {
            setShowNewStep(null);
            setNewStepName("");
            setNewStepDuration("");
            setNewStepInstructions("");
            setNewStepRequiresInput(false);
            setNewStepMaterials([]);
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
        setEditStepMaterials(
            (step.stepRequiredMaterials || []).map((m) => ({
                rawMaterialId: String(m.rawMaterialId),
                quantity: Number(m.qtyPerUnitOutput),
                unitId: m.unitId,
            }))
        );
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
                materials: materialsPayload(editStepMaterials),
            }),
        });
        if (res.ok) {
            setEditingStepId(null);
            setEditStepMaterials([]);
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

    const renderMaterialsEditor = (
        rows: MaterialRow[],
        setter: React.Dispatch<React.SetStateAction<MaterialRow[]>>
    ) => (
        <div>
            <label>Materias primas del paso:</label>
            {rows.map((row, index) => (
                <div key={index} className={styles.formActions}>
                    <select
                        value={row.rawMaterialId}
                        onChange={(e) => updateMaterialRow(setter, index, "rawMaterialId", e.target.value)}
                        className={styles.select}
                    >
                        <option value="">Materia prima...</option>
                        {rawMaterials.map((rm) => (
                            <option key={rm.id} value={rm.id}>{rm.code} — {rm.name}</option>
                        ))}
                    </select>
                    <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={row.quantity}
                        onChange={(e) => updateMaterialRow(setter, index, "quantity", Math.max(0.001, parseFloat(e.target.value) || 0.001))}
                        className={styles.input}
                    />
                    <select
                        value={row.unitId}
                        onChange={(e) => updateMaterialRow(setter, index, "unitId", parseInt(e.target.value, 10))}
                        className={styles.select}
                    >
                        {units.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                    <button type="button" className={styles.linkBtn} onClick={() => removeMaterialRow(setter, index)}>✕</button>
                </div>
            ))}
            <button type="button" className={styles.addStepBtn} onClick={() => addMaterialRow(setter)}>
                + Agregar materia prima
            </button>
        </div>
    );

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
                        <Button size="small" action="secondary" onClick={() => setShowCreateProduct((prev) => !prev)}>
                            {showCreateProduct ? "Cancelar producto nuevo" : "+ Crear producto nuevo"}
                        </Button>

                        {showCreateProduct && (
                            <div className={styles.formCard}>
                                <label>Categoría:</label>
                                <select value={newCategoryId} onChange={(e) => {
                                    setNewCategoryId(e.target.value);
                                    setNewProductSku("");
                                    setSkuHint(null);
                                }} className={styles.select}>
                                    <option value="">Seleccionar...</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {showCreateCategory ? (
                                    <div className={styles.formActions}>
                                        <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nueva categoría" className={styles.input} />
                                        <Button size="small" action="secondary" onClick={handleCreateCategory}>
                                            {creatingCategory ? "Creando..." : "Crear"}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="small" action="secondary" onClick={() => setShowCreateCategory(true)}>
                                        + Crear categoría
                                    </Button>
                                )}
                                <label>Nombre del producto:</label>
                                <input value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="Ej: Galletas de avena" className={styles.input} />
                                <label>SKU:</label>
                                <div className={styles.formActions}>
                                    <input value={newProductSku} readOnly aria-readonly="true" placeholder="Ej: GAL001" className={styles.input} />
                                    <Button size="small" action="secondary" onClick={handleGenerateSku} disabled={Boolean(newProductSku)}>Generar</Button>
                                </div>
                                {skuHint ? <p className={styles.emptyText}>{skuHint}</p> : null}
                                <label>Nombre de la variante:</label>
                                <input value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} placeholder="Ej: Bolsa de 500 g" className={styles.input} />
                                {createProductError ? <p className={styles.emptyText} style={{ color: "#b91c1c" }}>{createProductError}</p> : null}
                                <Button size="small" action="primary" onClick={handleCreateProductAndVariant}>
                                    {creatingProduct ? "Creando..." : "Crear y seleccionar"}
                                </Button>
                            </div>
                        )}

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
                                                        {renderMaterialsEditor(editStepMaterials, setEditStepMaterials)}
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
                                                            {step.stepRequiredMaterials && step.stepRequiredMaterials.length > 0 && (
                                                                <span className={styles.stepInstr}>
                                                                    Materias: {step.stepRequiredMaterials.map((m) => `${m.rawMaterial?.name ?? `#${m.rawMaterialId}`} (${m.qtyPerUnitOutput} ${m.unit?.name ?? ""})`).join(", ")}
                                                                </span>
                                                            )}
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
                                        {renderMaterialsEditor(newStepMaterials, setNewStepMaterials)}
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
