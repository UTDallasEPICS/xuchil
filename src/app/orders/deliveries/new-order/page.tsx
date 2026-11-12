"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, AlertTriangle } from "lucide-react";
import TextField from "@/components/TextField";
import DatePicker from "@/components/DatePicker";
import OrderedProducts from "@/components/OrderedProducts";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { Product } from "@/types/Product";
import { deliveryVariants, availableVariants } from "@/constants/deliveryConfig";
import styles from "./NewOrder.module.css";

interface ApiProductVariant {
  id: number | string;
  name?: string | null;
  presentation?: string | null;
  imageUrl?: string | null;
  availableStock?: number | string | null;
  product?: { name?: string | null; categoryId?: number | string | null } | null;
  inventory?: Array<{ onHand?: number | string | null }>;
  defaultUnit?: { name?: string | null } | null;
}

type OrderItemDraft = {
  productId: string;
  quantity: number;
};

function mapDeliveryVariantToApi(variant: keyof typeof deliveryVariants) {
  switch (variant) {
    case "personal":
      return "PERSONAL" as const;
    case "consignment":
      return "CONSIGNMENT" as const;
    default:
      return "MAIL" as const;
  }
}

const shortDeliveryLabels: Record<keyof typeof deliveryVariants, string> = {
  mail: "Correo",
  personal: "Personal",
  consignment: "Consignación",
};

const NewOrderPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clientName, setClientName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [address, setAddress] = useState("");
  const [deliveryVariant, setDeliveryVariant] = useState<
    keyof typeof deliveryVariants
  >("mail");
  const [orderItems, setOrderItems] = useState<OrderItemDraft[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [serverErrorModal, setServerErrorModal] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      const response = await fetch("/api/product-variants", { credentials: "include" });
      if (!response.ok) return;
      const data: ApiProductVariant[] = await response.json();
      if (!mounted) return;

      setProducts(
        data.map((variant) => ({
          id: String(variant.id),
          name: variant.product?.name ?? "Producto",
          presentation: variant.name ?? variant.presentation ?? "",
          image: variant.imageUrl || "/globe.svg",
          quantity: Number(variant.availableStock ?? variant.inventory?.[0]?.onHand ?? 0),
          units: variant.defaultUnit?.name ?? "",
          categoryId: String(variant.product?.categoryId ?? ""),
          variantId: String(variant.id),
        }))
      );
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const lowStockItems = useMemo(() => {
    if (products.length === 0 || orderItems.length === 0) return [];
    const requestedByProduct = new Map<string, number>();
    for (const item of orderItems) {
      if (!item.productId || item.quantity <= 0) continue;
      requestedByProduct.set(
        item.productId,
        (requestedByProduct.get(item.productId) ?? 0) + item.quantity
      );
    }

    const warnings: { label: string; requested: number; available: number }[] = [];
    for (const [productId, requested] of requestedByProduct.entries()) {
      const product = products.find((p) => p.id === productId);
      if (!product) continue;
      if (requested > product.quantity) {
        const label = product.presentation
          ? `${product.name} (${product.presentation})`
          : product.name;
        warnings.push({
          label,
          requested,
          available: product.quantity,
        });
      }
    }
    return warnings;
  }, [products, orderItems]);

  const handleSubmit = async () => {
    setFormError(null);

    if (!clientName.trim()) {
      setFormError("El nombre del cliente es obligatorio.");
      return;
    }

    if (!deliveryDate) {
      setFormError("Selecciona una fecha de entrega.");
      return;
    }

    if (!address.trim()) {
      setFormError("La dirección de entrega es obligatoria.");
      return;
    }

    const validItems = orderItems
      .map((item) => ({
        productVariantId: parseInt(item.productId, 10),
        quantity: item.quantity,
      }))
      .filter((item) => !Number.isNaN(item.productVariantId) && item.quantity > 0);
    if (validItems.length === 0) {
      setFormError("Agrega al menos un producto con cantidad mayor a cero.");
      return;
    }

    const payload = {
      clientName: clientName.trim(),
      addressText: address.trim(),
      deliveryDate: deliveryDate.toISOString(),
      deliveryVariant: mapDeliveryVariantToApi(deliveryVariant),
      orderItems: validItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        unitId: null,
        notes: null,
      })),
      status: "SCHEDULED" as const,
      deliveredAt: null,
      consignmentPartner: null,
      notes: null,
    };

    try {
      setSubmitting(true);
      const response = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo crear el pedido.");
      }

      router.replace("/orders/deliveries");
    } catch (error) {
      setServerErrorModal(
        error instanceof Error ? error.message : "Error al crear el pedido."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Modal
        open={Boolean(serverErrorModal)}
        title="No se pudo crear el pedido"
        message={serverErrorModal ?? ""}
        onlyConfirm
        danger
        onConfirm={() => setServerErrorModal(null)}
      />

      <div className={styles.card}>
        <div className={styles.head}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push("/orders/deliveries")}
            aria-label="Volver a entregas"
          >
            <ArrowLeft size={20} strokeWidth={2.2} />
          </button>
          <h1 className={styles.title}>Nuevo pedido</h1>
        </div>

        {formError && (
          <div className={styles.errorBanner} role="alert">
            <AlertCircle size={18} strokeWidth={2.2} />
            <span>{formError}</span>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="cliente">
            Cliente
          </label>
          <input
            id="cliente"
            type="text"
            className={styles.input}
            placeholder="Nombre del cliente"
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              if (formError) setFormError(null);
            }}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Método de entrega</span>
          <div className={styles.segment} role="radiogroup" aria-label="Método de entrega">
            {availableVariants.map((variant) => (
              <button
                key={variant}
                type="button"
                role="radio"
                aria-checked={deliveryVariant === variant}
                className={`${styles.segmentOption} ${
                  deliveryVariant === variant ? styles.segmentActive : ""
                }`}
                onClick={() => setDeliveryVariant(variant)}
              >
                {shortDeliveryLabels[variant]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Fecha de entrega</span>
          <DatePicker
            value={deliveryDate}
            onChange={(date) => {
              setDeliveryDate(date);
              if (formError) setFormError(null);
            }}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="direccion">
            Dirección de entrega
          </label>
          <TextField
            id="direccion"
            block
            placeholder="Calle, número, colonia, ciudad"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (formError) setFormError(null);
            }}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Productos</span>
          {products.length > 0 ? (
            <OrderedProducts products={products} onChange={setOrderItems} />
          ) : (
            <p className={styles.loadingText}>Cargando productos...</p>
          )}

          {lowStockItems.length > 0 && (
            <div className={styles.warningBanner} role="status">
              <AlertTriangle size={18} strokeWidth={2.2} className={styles.warningIcon} />
              <div className={styles.warningContent}>
                <strong>Stock actual insuficiente (se guardará como pre-pedido):</strong>
                <ul className={styles.warningList}>
                  {lowStockItems.map((item) => (
                    <li key={item.label}>
                      {item.label}: solicitas <strong>{item.requested}</strong> y hay{" "}
                      <strong>{item.available}</strong> disponibles.
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className={styles.submit}>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creando pedido..." : "Crear pedido"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewOrderPage;
