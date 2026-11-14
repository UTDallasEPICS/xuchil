"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";
import styles from "@/styles/InventoryForm.module.css";

const NewProductPage = () => {
  const [name, setName] = useState("");
  const [presentation, setPresentation] = useState("");
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [defaultUnitId, setDefaultUnitId] = useState<number | null>(null);
  const [unitOptions, setUnitOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: number; name: string; sku: string }>>([]);

  const [productId, setProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const selectedProduct = products.find((product) => product.id === productId);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const [unitsResponse, productsResponse] = await Promise.all([
        fetch("/api/units", { credentials: "include" }),
        fetch("/api/products", { credentials: "include" }),
      ]);

      if (unitsResponse.ok) {
        const units = await unitsResponse.json();
        if (mounted) {
          setUnitOptions(units || []);
          if (units?.length) {
            setDefaultUnitId(units[0].id);
          }
        }
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        if (mounted) {
          setProducts(productsData || []);
          if (productsData?.length) {
            setProductId(productsData[0].id);
          }
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const quantityValue = quantity.trim() === "" ? 0 : Number(quantity);

    if (!productId || Number.isNaN(productId)) {
      setError("Seleccione un producto válido.");
      setLoading(false);
      return;
    }

    if (Number.isNaN(quantityValue) || quantityValue < 0) {
      setError("Ingrese una cantidad válida.");
      setLoading(false);
      return;
    }

    if (quantityValue > 0 && !defaultUnitId) {
      setError("Seleccione una unidad válida para el stock inicial.");
      setLoading(false);
      return;
    }

    const payload: {
      productId: number;
      name: string;
      presentation?: string;
      imageUrl?: string;
      isActive: boolean;
      defaultUnitId?: number;
      initialStock?: number;
      receivedAt?: string;
      lotCode?: string;
    } = {
      productId,
      name: name.trim() || "Variante",
      presentation: presentation.trim() || undefined,
      imageUrl: image.trim() || undefined,
      isActive: true,
      defaultUnitId: defaultUnitId ?? undefined,
      initialStock: quantityValue > 0 ? quantityValue : undefined,
      receivedAt: quantityValue > 0 ? new Date().toISOString() : undefined,
      lotCode: quantityValue > 0 ? `PROD-${productId}-${Date.now()}` : undefined,
    };

    try {
      const response = await fetch("/api/product-variants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || body?.message || "Error creando variante de producto");
      }

      router.replace("/inventory/products");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear variante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.back}
        onClick={() => router.push("/inventory/products")}
      >
        <ChevronLeft size={18} />
        Inventario
      </button>

      <h1 className={styles.title}>Nuevo producto</h1>

      <p className={styles.sectionLabel}>Producto base</p>

      <section className={styles.card}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="producto-base">
            Producto base
          </label>
          <select
            id="producto-base"
            className={styles.select}
            value={productId ?? ""}
            onChange={(e) => setProductId(Number(e.target.value))}
            disabled={products.length === 0}
          >
            {products.length === 0 ? (
              <option value="">No hay productos base</option>
            ) : (
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} {product.sku ? `(${product.sku})` : ""}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => router.push("/inventory/new-base-product")}
          >
            + Crear producto base
          </button>
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
            placeholder="Ej. Galletas de avena"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="presentacion">
            Presentación
          </label>
          <input
            id="presentacion"
            type="text"
            className={styles.input}
            placeholder="Ej. Bolsa de 500 g"
            value={presentation}
            onChange={(e) => setPresentation(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cantidad">
            Cantidad disponible
          </label>
          <div className={styles.pair}>
            <input
              id="cantidad"
              type="number"
              inputMode="decimal"
              min="0"
              className={styles.input}
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <select
              className={styles.select}
              value={defaultUnitId ?? ""}
              onChange={(e) => setDefaultUnitId(Number(e.target.value))}
              disabled={unitOptions.length === 0}
              aria-label="Unidades"
            >
              {unitOptions.length === 0 ? (
                <option value="">Sin unidades</option>
              ) : (
                unitOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
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

      <div className={styles.info} role="note">
        <Info size={18} className={styles.infoIcon} />
        <div className={styles.infoBody}>
          <p className={styles.infoTitle}>SKU y código de lote</p>
          <p className={styles.infoText}>
            El SKU pertenece al producto base
            {selectedProduct?.sku ? (
              <>
                {" "}
                (<code>{selectedProduct.sku}</code>)
              </>
            ) : null}
            . Si todavía no existe, créalo primero con{" "}
            <strong>+ Crear producto base</strong>.
          </p>
          <p className={styles.infoText}>
            Si registras una cantidad inicial, el lote se crea con el código{" "}
            <code>PROD-{productId ?? "id"}-fecha</code>.
          </p>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancel}
          onClick={() => router.push("/inventory/products")}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={styles.submit}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Registrar producto"}
        </button>
      </div>
    </div>
  );
};

export default NewProductPage;
