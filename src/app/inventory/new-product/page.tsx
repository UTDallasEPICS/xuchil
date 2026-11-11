"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import BottomButton from "@/components/BottomButton";
import TextField from "@/components/TextField";
import styles from "./NewProduct.module.css";
 
const NewProductPage = () => {
  const [name, setName] = useState("");
  const [presentation, setPresentation] = useState("");
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [defaultUnitId, setDefaultUnitId] = useState<number | null>(null);
  const [unitOptions, setUnitOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: number; name: string; sku: string }>>([]);

  const [productId, setProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

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

    if (!productId || Number.isNaN(productId)) {
      setError("Seleccione un producto válido.");
      setLoading(false);
      return;
    }

    if (quantity > 0 && !defaultUnitId) {
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
      initialStock: quantity > 0 ? quantity : undefined,
      receivedAt: quantity > 0 ? new Date().toISOString() : undefined,
      lotCode: quantity > 0 ? `PROD-${productId}-${Date.now()}` : undefined,
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
      <HeaderXuchil />

      <h1 className={styles.title}>Nuevo Producto</h1>

      <h3 className={styles.fieldLabel}>Nombre:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="Ej. Galletas de avena"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <h3 className={styles.fieldLabel}>Presentación:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="Ej. Bolsa de 500 g"
          value={presentation}
          onChange={(e) => setPresentation(e.target.value)}
        />
      </div>

      <h3 className={styles.fieldLabel}>Imagen (URL):</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="https://ejemplo.com/imagen.jpg"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
      </div>

      <h3 className={styles.fieldLabel}>Cantidad disponible:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="Cantidad"
          value={quantity.toString()}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            setQuantity(Number.isNaN(parsed) ? 0 : parsed);
          }}
        />
      </div>

      <h3 className={styles.fieldLabel}>Unidades:</h3>
      <div className={`${styles.fieldContainer} ${styles.centeredControl}`}>
        <select
          className={styles.select}
          value={defaultUnitId ?? ""}
          onChange={(e) => setDefaultUnitId(Number(e.target.value))}
        >
          {unitOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <h3 className={styles.fieldLabel}>Producto base:</h3>
      <div className={styles.fieldContainer}>
        <select
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
      </div>
      <button
        type="button"
        className={styles.linkButton}
        onClick={() => router.push("/inventory/new-base-product")}
      >
        + Crear producto base
      </button>

      {error ? <p className={styles.error}>{error}</p> : null}

      <BottomButton onClick={handleSubmit} disabled={loading}>
        {loading ? "Guardando..." : "Registrar producto"}
      </BottomButton>
    </div>
  );
};

export default NewProductPage;
