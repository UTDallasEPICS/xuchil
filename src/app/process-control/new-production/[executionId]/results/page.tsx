"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import TextField from "@/components/TextField";
import BottomButton from "@/components/BottomButton";
import styles from "./ProcessResults.module.css";
import HeaderXuchil from "@/components/HeaderXuchil";

interface UnitOption {
  id: number;
  name: string;
  factorToBase?: number;
}

const DEFAULT_PACKAGE_TYPES = ["Bolsa", "Caja", "Frasco", "Sobre"];
const PACKAGE_TYPES_STORAGE_KEY = "xuchil.packageTypes";

const ProcessResultsPage: React.FC = () => {
  const { productId, stepId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const runIdParam = searchParams.get("runId");

  // Form state
  const [productQty, setProductQty] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [wasteQty, setWasteQty] = useState("");
  const [wasteUnitId, setWasteUnitId] = useState<number | null>(null);
  const [observations, setObservations] = useState("");

  // Packaging state
  const [wasPackaged, setWasPackaged] = useState(false);
  const [packageType, setPackageType] = useState("");
  const [packageTypes, setPackageTypes] = useState<string[]>(DEFAULT_PACKAGE_TYPES);
  const [newPackageType, setNewPackageType] = useState("");
  const [showAddPackageType, setShowAddPackageType] = useState(false);
  const [contentPerPackage, setContentPerPackage] = useState("");
  const [packageContentUnitId, setPackageContentUnitId] = useState<number | null>(null);
  const [resultantQty, setResultantQty] = useState("");

  // Data state
  const [processRunId, setProcessRunId] = useState<number | null>(null);
  const [variantName, setVariantName] = useState("");
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingRun, setLoadingRun] = useState(true);
  const [packagePreview, setPackagePreview] = useState<string | null>(null);

  useEffect(() => {
    const persisted = window.localStorage.getItem(PACKAGE_TYPES_STORAGE_KEY);
    if (!persisted) {
      return;
    }

    try {
      const parsed = JSON.parse(persisted);
      if (!Array.isArray(parsed)) {
        return;
      }
      const clean = parsed
        .map((item) => String(item).trim())
        .filter((item) => item.length > 0)
        // Avoid showing presentation values like "500 g" as package type.
        .filter((item) => !/^\d+(?:\.\d+)?\s*(kg|g|gr|gramos|l|ml)$/i.test(item));

      const merged = Array.from(new Set([...DEFAULT_PACKAGE_TYPES, ...clean]));
      setPackageTypes(merged);
    } catch {
      setPackageTypes(DEFAULT_PACKAGE_TYPES);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PACKAGE_TYPES_STORAGE_KEY, JSON.stringify(packageTypes));
  }, [packageTypes]);

  useEffect(() => {
    async function load() {
      setLoadingRun(true);
      try {

      // Load units
      try {
        const unitsRes = await fetch("/api/units", { credentials: "include" });
        if (unitsRes.ok) {
          const unitsData = await unitsRes.json();
          setUnits(
            unitsData.map((unit: any) => ({
              id: unit.id,
              name: unit.name,
              factorToBase: Number(unit.factorToBase ?? 1),
            }))
          );
        }
      } catch {
        // Fallback if units API doesn't exist
        setUnits([
          { id: 1, name: "Kg", factorToBase: 1 },
          { id: 2, name: "g", factorToBase: 0.001 },
          { id: 3, name: "L", factorToBase: 1 },
          { id: 4, name: "ml", factorToBase: 0.001 },
          { id: 5, name: "unidad", factorToBase: 1 },
        ]);
      }

      // Load variant info
      const varRes = await fetch(`/api/product-variants?product_id=${productId}`, { credentials: "include" });
      if (varRes.ok) {
        const variants = await varRes.json();
        const v = variants.find((item: any) => String(item.id) === String(variantId));
        if (v) {
          setVariantName(v.name);
          // Pre-fill content per package from variant's netContent (commented: let user enter it manually)
          // if (v.netContent) {
          //   setContentPerPackage(String(Number(v.netContent)));
          // }
          // Pre-select the content unit
          if (v.contentUnitId) {
            setSelectedUnitId(v.contentUnitId);
            setPackageContentUnitId(v.contentUnitId);
            setWasteUnitId(v.contentUnitId);
          } else if (v.defaultUnitId) {
            setSelectedUnitId(v.defaultUnitId);
            setPackageContentUnitId(v.defaultUnitId);
            setWasteUnitId(v.defaultUnitId);
          }
        }
      }

      // Prefer explicit runId from URL so users can always return to this screen.
      const runIdFromQuery = Number(runIdParam);
      let resolvedRunId: number | null = Number.isFinite(runIdFromQuery) && runIdFromQuery > 0
        ? runIdFromQuery
        : null;

      // Fallback: find active process run for this variant.
      if (!resolvedRunId) {
        const pendingRes = await fetch("/api/process-runs/pending", { credentials: "include" });
        if (pendingRes.ok) {
          const runs = await pendingRes.json();
          const activeRun = runs.find((run: any) => String(run.productVariantId) === String(variantId));
          if (activeRun) {
            resolvedRunId = activeRun.id;
          }
        }
      }

      if (resolvedRunId) {
        setProcessRunId(resolvedRunId);

        // If there was a previous partial capture, preload values.
        const runRes = await fetch(`/api/process-runs/${resolvedRunId}`, { credentials: "include" });
        if (runRes.ok) {
          const run = await runRes.json();
          if (run.goodOutputQty != null) setProductQty(String(Number(run.goodOutputQty)));
          if (run.scrapQty != null) setWasteQty(String(Number(run.scrapQty)));
          if (run.outputUnitId != null) {
            setSelectedUnitId(Number(run.outputUnitId));
            setWasteUnitId(Number(run.outputUnitId));
          }
          if (run.notes) setObservations(String(run.notes));
        }
      }

      } finally {
        setLoadingRun(false);
      }
    }
    load();
  }, [productId, variantId, runIdParam]);

  // Update package preview
  useEffect(() => {
    if (wasPackaged && contentPerPackage && productQty && selectedUnitId && packageContentUnitId) {
      const qty = parseFloat(productQty);
      const content = parseFloat(contentPerPackage);
      const outputUnit = units.find((u) => u.id === selectedUnitId);
      const packageUnit = units.find((u) => u.id === packageContentUnitId);
      const outputFactor = Number(outputUnit?.factorToBase ?? 1);
      const packageFactor = Number(packageUnit?.factorToBase ?? 1);

      if (!isNaN(qty) && !isNaN(content) && content > 0 && outputFactor > 0 && packageFactor > 0) {
        const totalInBase = qty * outputFactor;
        const packageSizeInBase = content * packageFactor;
        const packages = Math.floor(totalInBase / packageSizeInBase);
        const unitName = units.find((u) => u.id === selectedUnitId)?.name || "";
        const packageUnitName = packageUnit?.name || unitName;
        const pres = packageType || "empaques";
        setPackagePreview(`= ${packages} ${pres} de ${content} ${packageUnitName}`);
      } else {
        setPackagePreview(null);
      }
    } else {
      setPackagePreview(null);
    }
  }, [productQty, contentPerPackage, wasPackaged, packageType, selectedUnitId, packageContentUnitId, units]);

  // Calculate resultant quantity based on product qty and waste
  useEffect(() => {
    if (productQty && wasteQty && selectedUnitId && wasteUnitId) {
      const prodQty = parseFloat(productQty);
      const waste = parseFloat(wasteQty);
      const outputUnit = units.find((u) => u.id === selectedUnitId);
      const wasteUnit = units.find((u) => u.id === wasteUnitId);
      const outputFactor = Number(outputUnit?.factorToBase ?? 1);
      const wasteFactor = Number(wasteUnit?.factorToBase ?? 1);
      
      // Convert waste to output unit
      const convertedWaste = (waste * wasteFactor) / outputFactor;
      const result = prodQty - convertedWaste;
      
      if (result > 0) {
        setResultantQty(String(Number(result.toFixed(3))));
      }
    }
  }, [productQty, wasteQty, selectedUnitId, wasteUnitId, units]);

  const handleAddPackageType = () => {
    const trimmed = newPackageType.trim();
    if (trimmed && !packageTypes.includes(trimmed)) {
      setPackageTypes((prev) => [...prev, trimmed]);
      setPackageType(trimmed);
      setNewPackageType("");
      setShowAddPackageType(false);
    }
  };

  const handleClearPackaging = () => {
    setWasPackaged(false);
    setPackageType("");
    setContentPerPackage("");
    setPackagePreview(null);
  };

  const handleRemovePackageType = () => {
    if (!packageType) {
      return;
    }
    if (DEFAULT_PACKAGE_TYPES.includes(packageType)) {
      alert("No se puede eliminar un tipo de empaque base.");
      return;
    }
    setPackageTypes((prev) => prev.filter((item) => item !== packageType));
    setPackageType("");
  };

  useEffect(() => {
    if (!packageContentUnitId && selectedUnitId) {
      setPackageContentUnitId(selectedUnitId);
    }
  }, [selectedUnitId, packageContentUnitId]);

  useEffect(() => {
    if (!wasteUnitId && selectedUnitId) {
      setWasteUnitId(selectedUnitId);
    }
  }, [selectedUnitId, wasteUnitId]);

//////// VALIDACIONES
const validatePositiveNumber = (value: string, fieldName: string) => {
  if (!value) {
    return `${fieldName} es obligatorio.`;
  }

  const number = Number(value);

  if (isNaN(number)) {
    return `${fieldName} debe ser un número válido.`;
  }

  if (number <= 0) {
    return `${fieldName} debe ser mayor a cero.`;
  }

  return null;
};

const handleFinishProcess = async () => {
  if (!processRunId) {
    alert("No se encontro el proceso activo. Regresa a Control de procesos y vuelve a abrir esta tarea.");
    return;
  }

  const finalQty = resultantQty || productQty;

  // Validar producto final
  const productError = validatePositiveNumber(finalQty, "La cantidad de producto");
  if (productError) {
    alert(productError);
    return;
  }

  if (!selectedUnitId) {
    alert("Selecciona la unidad de medida del producto final.");
    return;
  }

  // Validar merma si existe
  if (wasteQty) {
    const wasteError = validatePositiveNumber(wasteQty, "La merma");
    if (wasteError) {
      alert(wasteError);
      return;
    }
  }

  // Validar empaque si aplica
  if (wasPackaged) {
    if (!packageType) {
      alert("Selecciona el tipo de empaque.");
      return;
    }

    const contentError = validatePositiveNumber(contentPerPackage, "El contenido por empaque");
    if (contentError) {
      alert(contentError);
      return;
    }

    if (!packageContentUnitId) {
      alert("Selecciona la unidad del contenido por empaque.");
      return;
    }
  }

  setSaving(true);
  try {
    const outputUnit = units.find((u) => u.id === selectedUnitId);
    const wasteUnit = units.find((u) => u.id === wasteUnitId);
    const outputFactor = Number(outputUnit?.factorToBase ?? 1);
    const wasteFactor = Number(wasteUnit?.factorToBase ?? 1);

    const parsedWasteQty = parseFloat(wasteQty) || 0;

    const convertedWasteQty =
      wasteUnitId && selectedUnitId
        ? (parsedWasteQty * wasteFactor) / outputFactor
        : parsedWasteQty;

    const res = await fetch(`/api/process-runs/${processRunId}/finish`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goodOutputQty: parseFloat(finalQty),
        scrapQty: convertedWasteQty,
        outputUnitId: selectedUnitId,
        notes: observations || null,
        wasPackaged,
        packageType: wasPackaged ? packageType : null,
        contentPerPackage: wasPackaged ? parseFloat(contentPerPackage) : null,
        packageContentUnitId: wasPackaged ? packageContentUnitId : null,
      }),
    });

    if (res.ok) {
      router.push("/process-control");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Error al finalizar el proceso");
    }
  } catch (e) {
    console.error("Error finishing process:", e);
    alert("Error al finalizar el proceso");
  } finally {
    setSaving(false);
  }
};

  const selectedUnitName = units.find((u) => u.id === selectedUnitId)?.name || "";

  return (
    <div className={`page ${styles.container}`}>
      <HeaderXuchil />
      <h1>Resultados</h1>
      {variantName && <p className={styles.variantName}>{variantName}</p>}

      <h2>Peso final o producto obtenido:</h2>
      <div className={styles.qtyRow}>
        <input
          type="number"
          min="0.001"
          step="0.001"
          className={styles.qtyInput}
         value={productQty}
          onChange={(e) => setProductQty(e.target.value)}
          placeholder="Cantidad"
        />
        <select
          className={styles.unitSelect}
          value={selectedUnitId ?? ""}
          onChange={(e) => setSelectedUnitId(parseInt(e.target.value) || null)}
        >
          <option value="">Unidad</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <h2>Empaque:</h2>
      <label className={styles.checkLabel}>
        <input
          type="checkbox"
          checked={wasPackaged}
          onChange={(e) => setWasPackaged(e.target.checked)}
        />
        Se empaqueto el producto
      </label>

      {wasPackaged && (
        <button type="button" className={styles.clearPackagingBtn} onClick={handleClearPackaging}>
          Quitar empaque
        </button>
      )}

      {wasPackaged && (
        <div className={styles.packagingSection}>
          <label className={styles.fieldLabel}>Tipo de empaque:</label>
          <div className={styles.packageTypeRow}>
            <select
              className={styles.unitSelect}
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
            >
              <option value="">Seleccionar...</option>
              {packageTypes.map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
            <button className={styles.addBtn} onClick={() => setShowAddPackageType(!showAddPackageType)} type="button">+</button>
            <button className={styles.removeBtn} onClick={handleRemovePackageType} type="button">-</button>
          </div>

          {showAddPackageType && (
            <div className={styles.addPackageRow}>
              <input
                className={styles.qtyInput}
                value={newPackageType}
                onChange={(e) => setNewPackageType(e.target.value)}
                placeholder="Nuevo tipo de empaque"
              />
              <button className={styles.addBtn} onClick={handleAddPackageType} type="button">Agregar</button>
            </div>
          )}

          <label className={styles.fieldLabel}>Contenido por empaque:</label>
          <div className={styles.qtyRow}>
            <input
            type="number"
            min="0.001"
            step="0.001"
            className={styles.qtyInput}
            value={contentPerPackage}
            onChange={(e) => setContentPerPackage(e.target.value)}
            placeholder="Ej: 250"
            />
            <select
              className={styles.unitSelect}
              value={packageContentUnitId ?? ""}
              onChange={(e) => setPackageContentUnitId(parseInt(e.target.value) || null)}
            >
              <option value="">Unidad</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {packagePreview && (
            <p className={styles.packagePreview}>{packagePreview}</p>
          )}
        </div>
      )}

      <h2>Merma:</h2>
      <div className={styles.qtyRow}>
        <input
          type="number"
          min="0.001"
          step="0.001"
          className={styles.qtyInput}
          value={wasteQty}
          onChange={(e) => setWasteQty(e.target.value)}
          placeholder="Cantidad"
        />
        <select
          className={styles.unitSelect}
          value={wasteUnitId ?? ""}
          onChange={(e) => setWasteUnitId(parseInt(e.target.value) || null)}
        >
          <option value="">Unidad</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {resultantQty && (
        <>
          <h2>Cantidad resultante:</h2>
          <div className={styles.qtyRow}>
            <input
               type="number"
              min="0.001"
              step="0.001"
              className={styles.qtyInput}
              value={resultantQty}
              onChange={(e) => setResultantQty(e.target.value)}
              placeholder="Cantidad"
            />
            <select
              className={styles.unitSelect}
              value={selectedUnitId ?? ""}
              disabled
            >
              <option value="">{selectedUnitName || "Unidad"}</option>
            </select>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "-12px" }}>
            Se calcula automáticamente restando la merma. Puedes editarla si es necesario.
          </p>
        </>
      )}

      <h2>Observaciones:</h2>
      <TextField
        placeholder="Escribe tus observaciones aqui..."
        value={observations}
        onChange={(e) => setObservations(e.target.value)}
      />

      <BottomButton onClick={handleFinishProcess} disabled={saving || loadingRun}>
        {saving || loadingRun ? "Guardando..." : "Finalizar produccion"}
      </BottomButton>

      {!loadingRun && !processRunId && (
        <p className={styles.warningText}>
          No se encontro un proceso activo para esta variante.
        </p>
      )}
    </div>
  );
};

export default ProcessResultsPage;
