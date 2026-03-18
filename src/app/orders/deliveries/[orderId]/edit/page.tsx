"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import HeaderXuchil from "@/components/HeaderXuchil";
import BottomButton from "@/components/BottomButton";
import Button from "@/components/Button";
import DeliveryType from "@/components/DeliveryType";
import TextField from "@/components/TextField";
import DatePicker from "@/components/DatePicker";
import OrderedProducts from "@/components/OrderedProducts";
import DeleteModal from "@/components/DeleteModal";

import { fetchOrderByIdClient } from "@/lib/ordersClient";
import { deliveryVariants } from "@/constants/deliveryConfig";
import { Product } from "@/types/Product";

import styles from "./EditOrder.module.css";

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

function parseDateMx(date: string): Date | null {
  const [dd, mm, yyyy] = date.split("/").map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy, mm - 1, dd);
}

const EditOrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientName, setClientName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [address, setAddress] = useState("");
  const [deliveryVariant, setDeliveryVariant] = useState<keyof typeof deliveryVariants>("mail");
  const [initialOrderItems, setInitialOrderItems] = useState<OrderItemDraft[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemDraft[]>([]);

  useEffect(() => {
    let mounted = true;
    const idNum = Number(orderId);
    if (Number.isNaN(idNum)) {
      setOrder(null);
      setLoading(false);
      return;
    }
    fetchOrderByIdClient(idNum)
      .then((o) => mounted && setOrder(o))
      .catch((err) => {
        console.error("Failed to fetch order", err);
        if (mounted) setOrder(null);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [orderId]);

  useEffect(() => {
    if (!order) return;

    setClientName(order.clientName ?? "");
    setAddress(order.address ?? "");
    setDeliveryVariant(order.deliveryVariant ?? "mail");
    setDeliveryDate(order.deliveryDate ? parseDateMx(order.deliveryDate) : null);
    setOrderItems(
      (order.products || []).map((product: any) => ({
        productId: String(product.id),
        quantity: Number(product.quantity || 0),
      }))
    );
    setInitialOrderItems(
      (order.products || []).map((product: any) => ({
        productId: String(product.id),
        quantity: Number(product.quantity || 0),
      }))
    );
  }, [order]);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      const response = await fetch("/api/product-variants", { credentials: "include" });
      if (!response.ok) return;
      const data = await response.json();
      if (!mounted) return;

      setProducts(
        data.map((variant: any) => ({
          id: String(variant.id),
          name: variant.product?.name ?? "Producto",
          presentation: variant.name ?? variant.presentation ?? "",
          image: variant.imageUrl ?? "/globe.svg",
          quantity: 0,
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

  const [showDelete, setShowDelete] = useState(false);

  const handleCancel = () => router.back();

  const handleSave = async () => {
    if (!order?.id) return;

    if (!clientName.trim()) {
      alert("El nombre del cliente es obligatorio.");
      return;
    }

    if (!deliveryDate) {
      alert("Selecciona una fecha de entrega.");
      return;
    }

    if (!address.trim()) {
      alert("La dirección de entrega es obligatoria.");
      return;
    }

    const validItems = orderItems
      .map((item) => ({
        productVariantId: parseInt(item.productId, 10),
        quantity: item.quantity,
      }))
      .filter((item) => !Number.isNaN(item.productVariantId) && item.quantity > 0);
    if (validItems.length === 0) {
      alert("Agrega al menos un producto al pedido.");
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
      status: (order.raw?.status ?? "SCHEDULED") as "SCHEDULED" | "DELIVERED" | "CANCELLED",
      deliveredAt: order.raw?.deliveredAt ?? null,
      consignmentPartner: order.raw?.consignmentPartner ?? null,
      notes: order.raw?.notes ?? null,
    };

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo actualizar el pedido.");
      }

      router.replace("/orders/deliveries");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al actualizar el pedido.");
    }
  };

  const handleDelete = () => setShowDelete(true);

  const confirmDelete = async () => {
    if (!order?.id) return;

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el pedido.");
      }

      router.replace("/orders/deliveries");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al eliminar el pedido.");
    }
  };

  if (loading) return <p>Cargando pedido...</p>;
  if (!order) return <p>Pedido no encontrado</p>;

  return (
    <>
      {showDelete && (
        <DeleteModal
          message={`¿Eliminar definitivamente el pedido #${order.id}?`}
          onCancel={() => setShowDelete(false)}
          onConfirm={confirmDelete}
        />
      )}

      <div className={styles.wrapper}>
        <div className={styles.cancelWrapper}>
          <Button size="small" action="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
        <div className={styles.deleteWrapper}>
          <Button size="small" action="negative" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>

        <HeaderXuchil />

        <h1 className={styles.title}>Pedido #{order.id}</h1>

        <div className={styles.deliveryType}>
          <DeliveryType
            variant={deliveryVariant}
            type="picker"
            size="sm"
            onVariantChange={setDeliveryVariant}
          />
        </div>

        <h3>Cliente:</h3>
        <div className={styles.fieldContainer}>
          <TextField
            placeholder="Nombre del cliente"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>

        <h3>Fecha de entrega:</h3>
        <div className={styles.fieldContainer}>
          <DatePicker value={deliveryDate} onChange={setDeliveryDate} />
        </div>

        <h3>Dirección de entrega:</h3>
        <div className={styles.fieldContainer}>
          <TextField
            placeholder="Dirección completa"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <h3>Productos:</h3>
        {products.length > 0 ? (
          <OrderedProducts products={products} value={initialOrderItems} onChange={setOrderItems} />
        ) : (
          <p>Cargando productos...</p>
        )}

        <BottomButton onClick={handleSave}>Finalizar edición</BottomButton>
      </div>
    </>
  );
};

export default EditOrderPage;
