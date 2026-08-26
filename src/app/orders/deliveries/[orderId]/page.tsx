"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import BottomButton from "@/components/BottomButton";
import ProductCard, {ProductCardProps} from "@/components/ProductCard";
import DeliveryType from "@/components/DeliveryType";
import {
  CircleUserRound as UserIcon,
  Calendar as CalendarIcon,
} from "lucide-react";

import styles from "./OrderDetails.module.css";
import {OrderRead} from "@/lib/schemas";
import orderClient from "@/lib/services/orderClient";
import productClient from "@/lib/services/productClient";

const formatMXDateLong = (raw: string) => {
  const [dd, mm, yyyy] = raw.split("/").map(Number);
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${dd} de ${months[mm - 1]} de ${yyyy}`;
};

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<(ProductCardProps & {id: number})[] | null>(null);

  useEffect(() => {
    let mounted = true;
    const idNum = Number(orderId);
    if (Number.isNaN(idNum)) {
      setOrder(null);
      setLoading(false);
      return;
    }
    const runEffect = async () => {
      try {
        const order = await orderClient.getOrderById(idNum);
        if (mounted) {
          setOrder(order);
        }
        const products = await Promise.all(order.orderItems.map(async (it) => {
          const product = await productClient.getProductById(it.productId);
          return {
            id: it.id,
            photo: product.imgUrl ?? null,
            name: product.name,
            quantity: it.quantity,
            units: product.unit.name,
          }
        }));
        setProducts(products);
      } catch (e) {
        console.error("Failed to fetch order", e);
        if (mounted) {
          setOrder(null);
          setProducts(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }

    }
    runEffect();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (loading) return <p>Cargando pedido...</p>;
  if (!order) return <p>Pedido no encontrado</p>;
  if (products === null) return <p>Cargando productos...</p>;

  const { id, clientName, address, deliveryDate, deliveryVariant, status } = order;
  const delivered = status == "DELIVERED";

  const handleEdit = () => {
    router.push(`/orders/deliveries/${id}/edit`);
  }

  const handleDelivered = async () => {
    try {
      const newStatus = delivered ? "SCHEDULED" : "DELIVERED";
      const updated = await orderClient.updateOrder(id, { status: newStatus });
      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          delivered: updated.status === "DELIVERED" || Boolean(updated.deliveredAt),
        };
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update order status", err);
      alert("No se pudo cambiar el estado del pedido");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.editWrapper}>
        <Button
          type="button"
          size="small"
          action="secondary"
          onClick={handleEdit}
        >
          Editar
        </Button>
      </div>

      <HeaderXuchil />

      <h1>{`Pedido #${id}`}</h1>

      <div className={styles.deliveryType}>
        <DeliveryType variant={deliveryVariant} type="badge" size="sm" />
      </div>

      <h3>Cliente:</h3>
      <div className={styles.row}>
        <UserIcon size={18} strokeWidth={2} className={styles.icon} />
        <strong>{clientName}</strong>
      </div>

      <h3>Fecha de entrega:</h3>
      <div className={styles.row}>
        <CalendarIcon size={18} strokeWidth={2} className={styles.icon} />
        <strong>{formatMXDateLong(deliveryDate)}</strong>
      </div>

      <h3>Dirección de entrega:</h3>
      <p className={styles.address}>{address}</p>

      <h3>Productos:</h3>
      <div className={styles.productContainer}>
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      <BottomButton onClick={handleDelivered}>
        {delivered ? "Marcar como pendiente" : "Marcar como entregado"}
      </BottomButton>
    </div>
  );
};

export default OrderDetailsPage;
