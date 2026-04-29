"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import BottomButton from "@/components/BottomButton";
import DeliveryType from "@/components/DeliveryType";
import TextField from "@/components/TextField";
import DatePicker from "@/components/DatePicker";
import OrderedProducts from "@/components/OrderedProducts";
import { deliveryVariants } from "@/constants/deliveryConfig";
import styles from "./NewOrder.module.css";
import productClient from "@/lib/services/productClient";
import orderClient from "@/lib/services/orderClient";
import {ProductRead} from "@/lib/schemas";

type OrderItemDraft = {
  productId: number;
  quantity: number;
};

const NewOrderPage = () => {
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [clientName, setClientName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [address, setAddress] = useState("");
  const [deliveryVariant, setDeliveryVariant] = useState<
    keyof typeof deliveryVariants
  >("MAIL");
  const [orderItems, setOrderItems] = useState<OrderItemDraft[]>([]);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const data = await productClient.getAllProducts();
        if (!Array.isArray(data)) return;
        if (!mounted) return;

        setProducts(data);
      } catch (error) {
        console.error("Failed to load product variants:", error);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async () => {
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
        productId: item.productId,
        quantity: item.quantity,
      }))
      .filter((item) => !Number.isNaN(item.productId) && item.quantity > 0);
    if (validItems.length === 0) {
      alert("Agrega al menos un producto al pedido.");
      return;
    }

    try {
      const order = await orderClient.createOrder({
        clientName: clientName.trim(),
        address: address.trim(),
        deliveryDate: deliveryDate.toISOString(),
        deliveryVariant: deliveryVariant,
        status: "SCHEDULED" as const,
      });
      await Promise.all(validItems.map(async (item) => {
        await orderClient.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
        });
      }));
      router.replace("/orders/deliveries");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al crear el pedido.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <HeaderXuchil />

      <h1 className={styles.title}>Nuevo Pedido</h1>

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
        <OrderedProducts products={products} onChange={(draft) => setOrderItems(draft)} />
      ) : (
        <p>Cargando productos...</p>
      )}

      <BottomButton onClick={handleSubmit}>Finalizar registro</BottomButton>
    </div>
  );
};

export default NewOrderPage;
