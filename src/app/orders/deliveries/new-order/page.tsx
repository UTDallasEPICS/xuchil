"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import BottomButton from "@/components/BottomButton";
import DeliveryType from "@/components/DeliveryType";
import TextField from "@/components/TextField";
import DatePicker from "@/components/DatePicker";
import OrderedProducts from "@/components/OrderedProducts";
import { Product } from "@/types/Product";
import { deliveryVariants } from "@/constants/deliveryConfig";
import styles from "./NewOrder.module.css";

const NewOrderPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clientName, setClientName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [address, setAddress] = useState("");
  const [deliveryVariant, setDeliveryVariant] = useState<
    keyof typeof deliveryVariants
  >("mail");

  const router = useRouter();

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

  const handleSubmit = () => {
    console.table({
      clientName,
      deliveryDate,
      address,
      deliveryVariant,
    });

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
        <OrderedProducts products={products} />
      ) : (
        <p>Cargando productos...</p>
      )}

      <BottomButton onClick={handleSubmit}>Finalizar registro</BottomButton>
    </div>
  );
};

export default NewOrderPage;
