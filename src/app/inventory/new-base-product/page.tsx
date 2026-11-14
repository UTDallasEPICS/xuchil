"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import styles from "@/styles/InventoryForm.module.css";

interface CategoryOption {
  id: number;
  name: string;
}

interface UnitOption {
  id: number;
  name: string;
}

const skuPrefixFrom = (categoryName: string) => {
  const letters = categoryName
    .normalize("NFD")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  return (letters.slice(0, 3) || "PRD").padEnd(3, "X");
};

const NewBaseProductPage = () => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [defaultUnitId, setDefaultUnitId] = useState<string>("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingSku, setGeneratingSku] = useState(false);
  const [skuHint, setSkuHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const router = useRouter();

  const selectedCategory = categories.find(
    (category) => String(category.id) === categoryId
  );
  const skuPrefix = selectedCategory ? skuPrefixFrom(selectedCategory.name) : null;

  const handleCreateCategory = async () => {
    setError(null);
    if (!newCategoryName.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }
    try {
      setCreatingCategory(true);
      const res = await fetch("/api/product-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newCategoryName.trim(), isActive: true }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "No se pudo crear la categoría.");
      }
      const category = await res.json();
      setCategories((prev) => [...prev, category]);
      setCategoryId(String(category.id));
      setSku("");
      setSkuHint(null);
      setShowCreateCategory(false);
      setNewCategoryName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la categoría.");
    } finally {
      setCreatingCategory(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [catsRes, unitsRes] = await Promise.all([
          fetch("/api/product-categories", { credentials: "include" }),
          fetch("/api/units", { credentials: "include" }),
        ]);
        if (mounted && catsRes.ok) setCategories(await catsRes.json());
        if (mounted && unitsRes.ok) setUnits(await unitsRes.json());
      } catch (err) {
        console.error("Failed to load base product form data:", err);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleGenerateSku = async () => {
    setError(null);
    if (!categoryId) {
      setError("Selecciona primero una categoría para generar el SKU.");
      return;
    }
    try {
      setGeneratingSku(true);
      const response = await fetch(`/api/products/next-sku?category_id=${categoryId}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("No se pudo generar el SKU.");
      }
      const data = await response.json();
      setSku(data.sku);
      setSkuHint(data.convention);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el SKU.");
    } finally {
      setGeneratingSku(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!categoryId) {
      setError("La categoría es obligatoria.");
      return;
    }
    const trimmedName = name.trim();
    const trimmedSku = sku.trim();
    if (!trimmedName) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!trimmedSku) {
      setError("El SKU es obligatorio.");
      return;
    }

    const payload = {
      categoryId: parseInt(categoryId, 10),
      sku: trimmedSku,
      name: trimmedName,
      defaultUnitId: defaultUnitId ? parseInt(defaultUnitId, 10) : null,
      imageUrl: image.trim() || null,
      isActive: true,
    };

    try {
      setLoading(true);
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "No se pudo registrar el producto.");
      }

      router.replace("/inventory/new-product");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.back}
        onClick={() => router.push("/inventory/new-product")}
      >
        <ChevronLeft size={18} />
        Nuevo producto
      </button>

      <h1 className={styles.title}>Nuevo producto base</h1>

      <p className={styles.sectionLabel}>Clasificación</p>

      <section className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="categoria">
            Categoría
          </label>
          <select
            id="categoria"
            className={styles.select}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSku("");
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
                placeholder="Nueva categoría"
                aria-label="Nombre de la nueva categoría"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button
                type="button"
                className={styles.inlineButton}
                onClick={handleCreateCategory}
                disabled={creatingCategory}
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
      </section>

      <p className={styles.sectionLabel}>Datos del producto</p>

      <section className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            className={styles.input}
            placeholder="Ej. Harina de mezquite"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="sku">
            SKU
          </label>
          <div className={styles.codeRow}>
            <input
              id="sku"
              type="text"
              className={styles.input}
              placeholder="Se genera automáticamente"
              value={sku}
              readOnly
              aria-readonly="true"
            />
            <button
              type="button"
              className={styles.inlineButton}
              onClick={handleGenerateSku}
              disabled={generatingSku || Boolean(sku)}
            >
              {generatingSku ? "Generando..." : sku ? "SKU asignado" : "Generar"}
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="unidad">
            Unidad por defecto <span className={styles.optional}>· opcional</span>
          </label>
          <select
            id="unidad"
            className={styles.select}
            value={defaultUnitId}
            onChange={(e) => setDefaultUnitId(e.target.value)}
          >
            <option value="">Sin definir</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
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

      <div className={styles.info} role="note">
        <Info size={18} className={styles.infoIcon} />
        <div className={styles.infoBody}>
          <p className={styles.infoTitle}>¿Cómo se genera el SKU?</p>
          <p className={styles.infoText}>
            {skuHint ??
              (skuPrefix
                ? `3 letras de la categoría ("${skuPrefix}") seguidas de un consecutivo de 3 dígitos: ${skuPrefix}001, ${skuPrefix}002, ...`
                : "3 letras de la categoría seguidas de un consecutivo de 3 dígitos. Por ejemplo, Harina genera HAR001, HAR002, ...")}
          </p>
          <p className={styles.infoText}>
            Selecciona la categoría y pulsa <strong>Generar</strong> para
            obtener el siguiente SKU disponible. El SKU no se escribe a mano:
            si cambias la categoría, se borra y hay que generarlo de nuevo.
          </p>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancel}
          onClick={() => router.push("/inventory/new-product")}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={styles.submit}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Registrar producto base"}
        </button>
      </div>
    </div>
  );
};

export default NewBaseProductPage;
