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
import * as productsService from "@/lib/services/productsService";
import * as ordersService from "@/lib/services/ordersService";

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

const NewOrderPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [clientName, setClientName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [address, setAddress] = useState("");
  const [deliveryVariant, setDeliveryVariant] = useState<
    keyof typeof deliveryVariants
  >("mail");
  const [orderItems, setOrderItems] = useState<OrderItemDraft[]>([]);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const data = await productsService.fetchProductVariants();
        if (!Array.isArray(data)) return;
        if (!mounted) return;

        setProducts(
          data.map((variantRaw: unknown) => {
            const variant = variantRaw as Record<string, unknown>;
            return {
              id: String(variant.id ?? ""),
              name: (variant.product && typeof (variant.product as Record<string, unknown>).name === "string") ? (variant.product as Record<string, unknown>).name as string : "Producto",
              presentation: typeof variant.name === "string" ? variant.name : String(variant.presentation ?? ""),
              image: typeof variant.imageUrl === "string" ? variant.imageUrl : "/globe.svg",
              quantity: 0,
              units: (variant.defaultUnit && typeof (variant.defaultUnit as Record<string, unknown>).name === "string") ? (variant.defaultUnit as Record<string, unknown>).name as string : "",
              categoryId: String((variant.product && (variant.product as Record<string, unknown>).categoryId) ?? ""),
              variantId: String(variant.id ?? ""),
            } as Product;
          })
        );
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
      status: "SCHEDULED" as const,
      deliveredAt: null,
      consignmentPartner: null,
      notes: null,
    };

    try {
      await ordersService.createOrder(payload);
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
        <OrderedProducts products={products} onChange={setOrderItems} />
      ) : (
        <p>Cargando productos...</p>
      )}

      <BottomButton onClick={handleSubmit}>Finalizar registro</BottomButton>
    </div>
  );
};

export default NewOrderPage;
