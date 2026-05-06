"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import BottomButton from "@/components/BottomButton";
import DeliveryType from "@/components/DeliveryType";
import TextField from "@/components/TextField";
import DatePicker from "@/components/DatePicker";
import OrderedProducts from "@/components/OrderedProducts";
import { deliveryVariants } from "@/constants/deliveryConfig";
import styles from "./NewOrder.module.css";
import { ProductRead } from "@/lib/schemas";

type OrderItemDraft = {
  productId: number;
  quantity: number;
};

const NewOrderPage = () => {
  const [clientName, setClientName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [address, setAddress] = useState("");
  const [deliveryVariant, setDeliveryVariant] = useState<
    keyof typeof deliveryVariants
  >("MAIL");
  const [orderItems, setOrderItems] = useState<OrderItemDraft[]>([]);

  const router = useRouter();

  const [products, setProducts] = useState<ProductRead[]>([]);


useEffect(() => {
  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } 
  }

  fetchProducts();
}, []);

  const handleSubmit = () => {
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

    const newOrder = {
      clientName: clientName.trim(),
      address: address.trim(),
      deliveryDate: deliveryDate.toISOString(),
      deliveryVariant,
      status: "SCHEDULED",
      orderItems: validItems,
    };

    console.log("Dummy order created:", newOrder);

    router.replace("/orders/deliveries");
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
        <OrderedProducts
          products={products}
          onChange={(draft) => setOrderItems(draft)}
        />
      ) : (
        <p>Cargando productos...</p>
      )}

      <BottomButton onClick={handleSubmit}>Finalizar registro</BottomButton>
    </div>
  );
};

export default NewOrderPage;