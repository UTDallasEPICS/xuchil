"use client";
import { FC } from "react";
import DeliveryType from "@/components/DeliveryType";
import { Order } from "@/types/Order";
import styles from "@/styles/OrderCard.module.css";

const OrderCard: FC<Order> = ({
  id,
  address,
  deliveryDate,
  deliveryVariant,
}) => {
  return (
    <article className={styles.card}>
      <div className={styles.leftColumn}>
        <h3 className={styles.header}>
          <span className={styles.muted}>Pedido&nbsp;</span>
          #{id}
        </h3>

        <p className={styles.address}>{address}</p>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.typeWrapper}>
            <DeliveryType
                variant={deliveryVariant}
                type="badge"
                size="sm"
            />
        </div>

        <p className={styles.label}>Fecha de entrega</p>
        <p className={styles.date}>{deliveryDate}</p>
      </div>
    </article>
  );
};

export default OrderCard;
