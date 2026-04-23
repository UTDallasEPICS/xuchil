"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import HeaderXuchil from "@/components/HeaderXuchil";
import BottomButton from "@/components/BottomButton";
import Button from "@/components/Button";
import DeliveryType from "@/components/DeliveryType";
import TextField from "@/components/TextField";
import DatePicker from "@/components/DatePicker";
import OrderedProducts from "@/components/OrderedProducts";
import DeleteModal from "@/components/DeleteModal";

import ordersService from "@/lib/services/orderClient";
import productService from "@/lib/services/productClient";
import { deliveryVariants } from "@/constants/deliveryConfig";
import {OrderRead, ProductRead} from "@/lib/schemas";

import styles from "./EditOrder.module.css";

type OrderItemDraft = {
  productId: number;
  quantity: number;
};

function mapDeliveryVariantToApi(variant: keyof typeof deliveryVariants) {
  return variant;
}

function mapDeliveryVariantFromApi(serverVariant?: string) {
  switch ((serverVariant || "").toUpperCase()) {
    case "PERSONAL":
      return "PERSONAL" as const;
    case "CONSIGNMENT":
      return "CONSIGNMENT" as const;
    default:
      return "MAIL" as const;
  }
}

function toLocalDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toOrderDateValue(value?: string | Date | null): string {
  const date = toLocalDate(value);
  return date ? date.toISOString() : "";
}

const EditOrderPage = () => {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = useMemo(() => Number(params.orderId), [params.orderId]);

  const [order, setOrder] = useState<OrderRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [clientName, setClientName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [address, setAddress] = useState("");
  const [deliveryVariant, setDeliveryVariant] = useState<keyof typeof deliveryVariants>("MAIL");
  const [initialOrderItems, setInitialOrderItems] = useState<OrderItemDraft[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemDraft[]>([]);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (Number.isNaN(orderId)) {
      setOrder(null);
      setLoading(false);
      return;
    }

    ordersService.getOrderById(orderId)
      .then((o) => {
        if (mounted) setOrder(o);
      })
      .catch((err) => {
        console.error("Failed to fetch order", err);
        if (mounted) setOrder(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [orderId]);

  useEffect(() => {
    if (!order) return;

    const currentItems = (order.orderItems ?? []).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    setClientName(order.clientName ?? "");
    setAddress(order.address ?? "");
    setDeliveryVariant(mapDeliveryVariantFromApi(order.deliveryVariant));
    setDeliveryDate(toLocalDate(order.deliveryDate));
    setOrderItems(currentItems);
    setInitialOrderItems(currentItems);
  }, [order]);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const data = await productService.getAllProducts();
        if (!mounted) return;

        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

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
        productId: Number(item.productId),
        quantity: item.quantity,
      }))
      .filter((item) => !Number.isNaN(item.productId) && item.quantity > 0);

    if (validItems.length === 0) {
      alert("Agrega al menos un producto al pedido.");
      return;
    }

    const payload = {
      clientName: clientName.trim(),
      address: address.trim(),
      deliveryDate: toOrderDateValue(deliveryDate),
      deliveryVariant: mapDeliveryVariantToApi(deliveryVariant),
      status: order.status ?? "SCHEDULED",
      deliveredAt: order.deliveredAt ?? null,
      consignmentPartner: order.consignmentPartner ?? null,
      notes: order.notes ?? null,
      orderItems: validItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    try {
      await ordersService.updateOrder(order.id, payload as never);
      router.replace("/orders/deliveries");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al actualizar el pedido.");
    }
  };

  const handleDelete = () => setShowDelete(true);

  const confirmDelete = async () => {
    if (!order?.id) return;

    try {
      await ordersService.deleteOrder(order.id);
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
