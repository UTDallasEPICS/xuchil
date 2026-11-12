"use client";
import { FC } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, CircleUserRound, MapPin, Package } from "lucide-react";
import DeliveryType from "@/components/DeliveryType";
import { Order } from "@/types/Order";
import styles from "@/styles/OrderCard.module.css";

type Props = Order;

const OrderCard: FC<Props> = ({
  id,
  clientName,
  address,
  deliveryDate,
  deliveryVariant,
  delivered,
  products,
}) => {
  const router = useRouter();
  const handleClick = () => router.push(`/orders/deliveries/${id}`);

  const totalProducts = products?.length ?? 0;
  const totalUnits = (products ?? []).reduce(
    (sum, p) => sum + (Number(p.quantity) || 0),
    0
  );

  return (
    <article className={styles.card} onClick={handleClick}>
      <div className={styles.leftColumn}>
        <div className={styles.topRow}>
          <h3 className={styles.header}>
            <span className={styles.muted}>Pedido&nbsp;</span>#{id}
          </h3>
          <span
            className={`${styles.statusPill} ${
              delivered ? styles.statusDelivered : styles.statusPending
            }`}
          >
            {delivered ? (
              <>
                <CheckCircle2 size={13} strokeWidth={2.4} />
                <span>Entregado</span>
              </>
            ) : (
              <>
                <Clock size={13} strokeWidth={2.4} />
                <span>Pendiente</span>
              </>
            )}
          </span>
        </div>

        <p className={styles.clientName}>
          <CircleUserRound size={15} strokeWidth={2.2} className={styles.metaIcon} />
          <span>{clientName || "Cliente sin nombre"}</span>
        </p>

        {address && (
          <p className={styles.address}>
            <MapPin size={14} strokeWidth={2} className={styles.metaIcon} />
            <span>{address}</span>
          </p>
        )}

        <p className={styles.itemsSummary}>
          <Package size={14} strokeWidth={2} className={styles.metaIcon} />
          <span>
            {totalProducts} {totalProducts === 1 ? "producto" : "productos"} · {totalUnits}{" "}
            {totalUnits === 1 ? "unidad" : "unidades"}
          </span>
        </p>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.typeWrapper}>
          <DeliveryType variant={deliveryVariant} type="badge" size="sm" />
        </div>

        <div className={styles.dateBlock}>
          <p className={styles.label}>Fecha de entrega</p>
          <p className={styles.date}>{deliveryDate}</p>
        </div>
      </div>
    </article>
  );
};

export default OrderCard;
