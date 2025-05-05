"use client";

import { useParams, useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import Button from "@/components/Button";
import BottomButton from "@/components/BottomButton";
import ProductCard from "@/components/ProductCard";
import DeliveryType from "@/components/DeliveryType";
import { fetchOrders } from "@/constants/api";
import {
  CircleUserRound as UserIcon,
  Calendar as CalendarIcon,
} from "lucide-react";

import styles from "./OrderDetails.module.css";

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

  const order = fetchOrders().find((o) => o.id === Number(orderId));
  if (!order) return <p>Pedido no encontrado</p>;

  const {
    id,
    clientName,
    address,
    deliveryDate,
    deliveryVariant,
    products,
    delivered,
  } = order;

  const handleEdit = () => {
    console.log("Botón presionado");
    router.push(`/orders/deliveries/${id}/edit`);
  }

  const handleDelivered = () => {
    console.log("Marca como entregado", id);
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
        {products.map(({ id: pid, ...p }) => (
          <ProductCard key={pid} {...p} />
        ))}
      </div>

      <BottomButton onClick={handleDelivered}>
        {delivered ? "Marcar como pendiente" : "Marcar como entregado"}
      </BottomButton>
    </div>
  );
};

export default OrderDetailsPage;
