"use client";
import { FC } from "react";
import { useRouter } from "next/navigation";
import DeliveryType from "@/components/DeliveryType";
import styles from "@/styles/OrderCard.module.css";
import {OrderRead} from "@/lib/schemas";

type Props = OrderRead;

const OrderCard: FC<Props> = ({
  id,
  address,
  deliveryDate,
  deliveryVariant,
}) => {
  const router = useRouter();
  const handleClick = () => router.push(`/orders/deliveries/${id}`);
  return (
    <article className={styles.card} onClick={handleClick}>
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
