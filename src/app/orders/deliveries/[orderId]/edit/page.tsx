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

const EditOrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);

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

  if (loading) return <p>Cargando pedido...</p>;
  if (!order) return <p>Pedido no encontrado</p>;

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      const response = await fetch("/api/product-variants", { credentials: "include" });
      if (!response.ok) return;
      const data = await response.json();
      if (!mounted) return;

      setInitialProducts(
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

  const [clientName, setClientName] = useState(order.clientName);
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(
    (() => {
      const [dd, mm, yyyy] = order.deliveryDate.split("/").map(Number);
      return new Date(yyyy, mm - 1, dd);
    })()
  );
  const [address, setAddress] = useState(order.address);
  const [deliveryVariant, setDeliveryVariant] =
    useState<keyof typeof deliveryVariants>(order.deliveryVariant);

  const [showDelete, setShowDelete] = useState(false);

  const handleCancel = () => router.back();

  const handleSave = () => {
    console.table({
      id: order.id,
      clientName,
      deliveryDate,
      address,
      deliveryVariant,
    });
    router.replace("/orders/deliveries");
  };

  const handleDelete = () => setShowDelete(true);

  const confirmDelete = () => {
    console.log("Eliminar pedido", order.id);
    router.replace("/orders/deliveries");
  };

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
          <DeliveryType variant={deliveryVariant} type="picker" size="sm" />
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
        {initialProducts.length > 0 ? (
          <OrderedProducts products={initialProducts} />
        ) : (
          <p>Cargando productos...</p>
        )}

        <BottomButton onClick={handleSave}>Finalizar edición</BottomButton>
      </div>
    </>
  );
};

export default EditOrderPage;
