"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import styles from "./ProcessResults.module.css";

interface UnitOption {
  id: number;
  name: string;
  factorToBase?: number;
}

interface ApiVariant {
  id: number | string;
  name: string;
  contentUnitId?: number | null;
  defaultUnitId?: number | null;
}

interface ApiPendingRun {
  id: number;
  productVariantId: number | string;
}

const DEFAULT_PACKAGE_TYPES = ["Bolsa", "Caja", "Frasco", "Sobre"];
const PACKAGE_TYPES_STORAGE_KEY = "xuchil.packageTypes";

const ProcessResultsContent: React.FC = () => {
  const { productId, variantId } = useParams();
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
        .filter((item) => !/^\d+(?:\.\d+)?\s*(kg|g|gr|gramos|l|ml)$/i.test(item));

      const merged = Array.from(new Set([...DEFAULT_PACKAGE_TYPES, ...clean]));
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        try {
          const unitsRes = await fetch("/api/units", { credentials: "include" });
          if (unitsRes.ok) {
            const unitsData: Array<UnitOption & { factorToBase?: number | string }> =
              await unitsRes.json();
            setUnits(
              unitsData.map((unit) => ({
                id: unit.id,
                name: unit.name,
                factorToBase: Number(unit.factorToBase ?? 1),
              }))
            );
          }
        } catch {
          setUnits([
            { id: 1, name: "Kg", factorToBase: 1 },
            { id: 2, name: "g", factorToBase: 0.001 },
            { id: 3, name: "L", factorToBase: 1 },
            { id: 4, name: "ml", factorToBase: 0.001 },
            { id: 5, name: "unidad", factorToBase: 1 },
          ]);
        }

        const varRes = await fetch(`/api/product-variants`, { credentials: "include" });
        if (varRes.ok) {
          const variants: ApiVariant[] = await varRes.json();
          const v = variants.find((item) => String(item.id) === String(variantId));
          if (v) {
            setVariantName(v.name);
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

        const runIdFromQuery = Number(runIdParam);
        let resolvedRunId: number | null =
          Number.isFinite(runIdFromQuery) && runIdFromQuery > 0 ? runIdFromQuery : null;

        if (!resolvedRunId) {
          const pendingRes = await fetch("/api/process-runs/pending", {
            credentials: "include",
          });
          if (pendingRes.ok) {
            const runs: ApiPendingRun[] = await pendingRes.json();
            const activeRun = runs.find(
              (run) => String(run.productVariantId) === String(variantId)
            );
            if (activeRun) {
              resolvedRunId = activeRun.id;
            }
          }
        }

        if (resolvedRunId) {
          setProcessRunId(resolvedRunId);

          const runRes = await fetch(`/api/process-runs/${resolvedRunId}`, {
            credentials: "include",
          });
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPackagePreview(`= ${packages} ${pres} de ${content} ${packageUnitName}`);
      } else {
        setPackagePreview(null);
      }
    } else {
      setPackagePreview(null);
    }
  }, [productQty, contentPerPackage, wasPackaged, packageType, selectedUnitId, packageContentUnitId, units]);

  useEffect(() => {
    if (productQty && wasteQty && selectedUnitId && wasteUnitId) {
      const prodQty = parseFloat(productQty);
      const waste = parseFloat(wasteQty);
      const outputUnit = units.find((u) => u.id === selectedUnitId);
      const wasteUnit = units.find((u) => u.id === wasteUnitId);
      const outputFactor = Number(outputUnit?.factorToBase ?? 1);
      const wasteFactor = Number(wasteUnit?.factorToBase ?? 1);

      const convertedWaste = (waste * wasteFactor) / outputFactor;
      const result = prodQty - convertedWaste;

      if (result > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPackageContentUnitId(selectedUnitId);
    }
  }, [selectedUnitId, packageContentUnitId]);

  useEffect(() => {
    if (!wasteUnitId && selectedUnitId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWasteUnitId(selectedUnitId);
    }
  }, [selectedUnitId, wasteUnitId]);

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
      alert(
        "No se encontró el proceso activo. Regresa a Control de procesos y vuelve a abrir esta tarea."
      );
      return;
    }

    const finalQty = resultantQty || productQty;

    const productError = validatePositiveNumber(finalQty, "La cantidad de producto");
    if (productError) {
      alert(productError);
      return;
    }

    if (!selectedUnitId) {
      alert("Selecciona la unidad de medida del producto final.");
      return;
    }

    if (wasteQty) {
      const wasteError = validatePositiveNumber(wasteQty, "La merma");
      if (wasteError) {
        alert(wasteError);
        return;
      }
    }

    if (wasPackaged) {
      if (!packageType) {
        alert("Selecciona el tipo de empaque.");
        return;
      }

      const contentError = validatePositiveNumber(
        contentPerPackage,
        "El contenido por empaque"
      );
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
    <div className="page">
      <div className={styles.container}>
        <h1 className={styles.title}>Resultados</h1>
        {variantName && <p className={styles.variantName}>{variantName}</p>}

        <div className={styles.field}>
          <label className={styles.label}>Peso final o producto obtenido</label>
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
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Empaque</span>
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={wasPackaged}
              onChange={(e) => setWasPackaged(e.target.checked)}
            />
            Se empaquetó el producto
          </label>

          {wasPackaged && (
            <button
              type="button"
              className={styles.clearPackagingBtn}
              onClick={handleClearPackaging}
            >
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
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
                <button
                  className={styles.addBtn}
                  onClick={() => setShowAddPackageType(!showAddPackageType)}
                  type="button"
                >
                  +
                </button>
                <button
                  className={styles.removeBtn}
                  onClick={handleRemovePackageType}
                  type="button"
                >
                  -
                </button>
              </div>

              {showAddPackageType && (
                <div className={styles.addPackageRow}>
                  <input
                    className={styles.qtyInput}
                    value={newPackageType}
                    onChange={(e) => setNewPackageType(e.target.value)}
                    placeholder="Nuevo tipo de empaque"
                  />
                  <button
                    className={styles.addBtn}
                    onClick={handleAddPackageType}
                    type="button"
                  >
                    Agregar
                  </button>
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
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {packagePreview && <p className={styles.packagePreview}>{packagePreview}</p>}
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Merma</label>
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
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {resultantQty && (
          <div className={styles.field}>
            <label className={styles.label}>Cantidad resultante</label>
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
              <select className={styles.unitSelect} value={selectedUnitId ?? ""} disabled>
                <option value="">{selectedUnitName || "Unidad"}</option>
              </select>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#666", margin: 0 }}>
              Se calcula automáticamente restando la merma. Puedes editarla si es necesario.
            </p>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="observaciones">
            Observaciones <span className={styles.optional}>(opcional)</span>
          </label>
          <TextField
            id="observaciones"
            block
            placeholder="Escribe tus observaciones aquí"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <Button action="outline" onClick={() => router.back()}>
            Atrás
          </Button>
          <Button
            action="primary"
            onClick={handleFinishProcess}
            disabled={saving || loadingRun}
          >
            {saving || loadingRun ? "Guardando..." : "Finalizar producción"}
          </Button>
        </div>

        {!loadingRun && !processRunId && (
          <p className={styles.warningText}>
            No se encontró un proceso activo para esta variante.
          </p>
        )}
      </div>
    </div>
  );
};

const ProcessResultsPage: React.FC = () => (
  <Suspense
    fallback={
      <div className="page">
        <p>Cargando resultados...</p>
      </div>
    }
  >
    <ProcessResultsContent />
  </Suspense>
);

export default ProcessResultsPage;
