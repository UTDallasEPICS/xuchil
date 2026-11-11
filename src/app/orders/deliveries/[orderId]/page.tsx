"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import ProductCard from "@/components/ProductCard";
import DeliveryType from "@/components/DeliveryType";
import { fetchOrderByIdClient, putOrderStatusClient } from "@/lib/ordersClient";
import {
  ArrowLeft,
  Pencil,
  CircleUserRound as UserIcon,
  Calendar as CalendarIcon,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

import styles from "./OrderDetails.module.css";

type OrderDetails = Awaited<ReturnType<typeof fetchOrderByIdClient>>;

const formatMXDateLong = (raw: string) => {
  if (!raw) return "Sin fecha";
  const [dd, mm, yyyy] = raw.split("/").map(Number);
  if (!dd || !mm || !yyyy) return raw;
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${dd} de ${months[mm - 1]} de ${yyyy}`;
};

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    let mounted = true;
    const idNum = Number(orderId);
    if (Number.isNaN(idNum)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.stateMessage}>Cargando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <p className={styles.stateMessage}>Pedido no encontrado.</p>
          <Button action="secondary" onClick={() => router.push("/orders/deliveries")}>
            Volver a entregas
          </Button>
        </div>
      </div>
    );
  }

  const { id, clientName, address, deliveryDate, deliveryVariant, products, delivered } = order;

  const handleEdit = () => {
    router.push(`/orders/deliveries/${id}/edit`);
  };

  const handleDelivered = async () => {
    setStatusError(null);
    setUpdatingStatus(true);
    try {
      const newStatus = delivered ? "SCHEDULED" : "DELIVERED";
      const updated = await putOrderStatusClient(id, newStatus);
      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          delivered: updated?.status === "DELIVERED" || Boolean(updated?.deliveredAt),
        };
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update order status", err);
      setStatusError("No se pudo actualizar el estado del pedido. Intenta de nuevo.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.push("/orders/deliveries")}
          aria-label="Volver a entregas"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>

        <div className={styles.headMain}>
          <h1 className={styles.title}>{`Pedido #${id}`}</h1>
          <div className={styles.badges}>
            <DeliveryType variant={deliveryVariant} type="badge" size="sm" />
            <span
              className={`${styles.statusPill} ${
                delivered ? styles.statusDelivered : styles.statusPending
              }`}
            >
              {delivered ? (
                <>
                  <CheckCircle2 size={14} strokeWidth={2.4} />
                  <span>Entregado</span>
                </>
              ) : (
                <>
                  <Clock size={14} strokeWidth={2.4} />
                  <span>Pendiente</span>
                </>
              )}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={styles.editBtn}
          onClick={handleEdit}
          aria-label="Editar pedido"
        >
          <Pencil size={16} strokeWidth={2.2} />
          <span>Editar</span>
        </button>
      </div>

      {statusError && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={18} strokeWidth={2.2} />
          <span>{statusError}</span>
        </div>
      )}

      <section className={styles.card}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <UserIcon size={16} strokeWidth={2.2} />
              <span>Cliente</span>
            </span>
            <strong className={styles.infoValue}>{clientName}</strong>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <CalendarIcon size={16} strokeWidth={2.2} />
              <span>Fecha de entrega</span>
            </span>
            <strong className={styles.infoValue}>{formatMXDateLong(deliveryDate)}</strong>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <MapPin size={16} strokeWidth={2.2} />
              <span>Dirección de entrega</span>
            </span>
            <p className={styles.addressText}>{address || "Sin dirección especificada"}</p>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <span className={styles.infoLabel}>
            <Package size={16} strokeWidth={2.2} />
            <span>Productos ({products.length})</span>
          </span>
        </div>

        <div className={styles.productContainer}>
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      <div className={styles.actions}>
        <Button
          action={delivered ? "secondary" : "primary"}
          onClick={handleDelivered}
          disabled={updatingStatus}
        >
          {updatingStatus
            ? "Actualizando..."
            : delivered
            ? "Marcar como pendiente"
            : "Marcar como entregado"}
        </Button>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
