"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import styles from "@/styles/InventoryForm.module.css";

interface UnitOption {
  id: number;
  name: string;
}

const NewRawMaterialPage = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("");
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [defaultUnitId, setDefaultUnitId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeHint, setCodeHint] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadUnits() {
      try {
        const response = await fetch("/api/units", { credentials: "include" });
        if (!response.ok) {
          throw new Error();
        }
        const data: UnitOption[] = await response.json();
        if (mounted) {
          setUnits(data || []);
          if (data?.length) {
            setDefaultUnitId(data[0].id);
          }
        }
      } catch {
        if (mounted) {
          setError("No se pudieron cargar las unidades.");
        }
      } finally {
        if (mounted) {
          setUnitsLoading(false);
        }
      }
    }

    loadUnits();

    return () => {
      mounted = false;
    };
  }, []);

  const handleGenerateCode = async () => {
    setError(null);
    try {
      setGeneratingCode(true);
      const response = await fetch("/api/raw-materials/next-code", {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("No se pudo generar el código.");
      }
      const data = await response.json();
      setCode(data.code);
      setCodeHint(data.convention);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo generar el código."
      );
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    const trimmedCode = code.trim();
    const trimmedName = name.trim();
    const trimmedImage = image.trim();
    const stockValue = stock.trim() === "" ? 0 : Number(stock);

    if (!trimmedCode) {
      setError("El código es obligatorio.");
      return;
    }

    if (!trimmedName) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (Number.isNaN(stockValue)) {
      setError("Ingresa una cantidad válida.");
      return;
    }

    if (stockValue < 0) {
      setError("El stock no puede ser negativo.");
      return;
    }

    if (!defaultUnitId) {
      setError("Selecciona una unidad.");
      return;
    }

    const payload = {
      code: trimmedCode,
      name: trimmedName,
      defaultUnitId,
      imageUrl: trimmedImage || null,
      isActive: true,
      initialStock: stockValue > 0 ? stockValue : undefined,
      lotCode: stockValue > 0 ? `RAW-${trimmedCode}-${Date.now()}` : undefined,
      receivedAt: stockValue > 0 ? new Date().toISOString() : undefined,
    };

    try {
      setLoading(true);

      const response = await fetch("/api/raw-materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        throw new Error(
          body?.message ||
            body?.error ||
            "No se pudo registrar la materia prima."
        );
      }

      router.replace("/inventory/raw");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo registrar la materia prima.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.back}
        onClick={() => router.push("/inventory/raw")}
      >
        <ChevronLeft size={18} />
        Inventario
      </button>

      <h1 className={styles.title}>Nueva materia prima</h1>

      <p className={styles.sectionLabel}>Identificación</p>

      <section className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="codigo">
            Código
          </label>
          <div className={styles.codeRow}>
            <input
              id="codigo"
              type="text"
              className={styles.input}
              placeholder="Ej. MP009"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="button"
              className={styles.inlineButton}
              onClick={handleGenerateCode}
              disabled={generatingCode}
            >
              {generatingCode ? "Generando..." : "Generar"}
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            className={styles.input}
            placeholder="Ej. Harina de trigo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </section>

      <div className={styles.info} role="note">
        <Info size={18} className={styles.infoIcon} />
        <div className={styles.infoBody}>
          <p className={styles.infoTitle}>¿Cómo se genera el código?</p>
          <p className={styles.infoText}>
            {codeHint ??
              "Prefijo MP (materia prima) seguido de un consecutivo de 3 dígitos: MP001, MP002, ..."}
          </p>
          <p className={styles.infoText}>
            Pulsa <strong>Generar</strong> para obtener el siguiente código
            disponible. Si registras stock inicial, el lote se crea con el
            código <code>RAW-{code.trim() || "código"}-fecha</code>.
          </p>
        </div>
      </div>

      <p className={styles.sectionLabel}>Existencias</p>

      <section className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="stock">
            Stock disponible
          </label>
          <div className={styles.pair}>
            <input
              id="stock"
              type="number"
              inputMode="decimal"
              min="0"
              className={styles.input}
              placeholder="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
            <select
              className={styles.select}
              value={defaultUnitId ?? ""}
              onChange={(e) => setDefaultUnitId(Number(e.target.value))}
              disabled={unitsLoading || units.length === 0}
              aria-label="Unidades"
            >
              {unitsLoading ? (
                <option value="">Cargando...</option>
              ) : units.length === 0 ? (
                <option value="">Sin unidades</option>
              ) : (
                units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="imagen">
            Imagen (URL) <span className={styles.optional}>· opcional</span>
          </label>
          <input
            id="imagen"
            type="url"
            className={styles.input}
            placeholder="https://ejemplo.com/imagen.jpg"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          {!!image.trim() && (
            <div className={styles.preview}>
              <img className={styles.previewImg} src={image.trim()} alt="" />
              <p className={styles.previewText}>Vista previa</p>
            </div>
          )}
        </div>
      </section>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancel}
          onClick={() => router.push("/inventory/raw")}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={styles.submit}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Registrar materia prima"}
        </button>
      </div>
    </div>
  );
};

export default NewRawMaterialPage;
