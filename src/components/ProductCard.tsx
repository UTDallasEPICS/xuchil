import React from 'react';
import styles from '@/styles/ProductCard.module.css';

export interface ProductCardProps {
  photo: string | null;
  name: string;
  quantity: number | string;
  units: string;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  photo,
  name,
  quantity,
  units,
  onClick,
}) => (
  <div className={styles.card} onClick={onClick}>
    <img src={photo ?? undefined} alt={name} className={styles.photo} />
    <div className={styles.info}>
      <h3 className={styles.name}>{name}</h3>
    </div>
    <div className={styles.amount}>
      <h3 className={styles.quantity}>{quantity}</h3>
      <h3 className={styles.units}>{units}</h3>
    </div>
  </div>
);

export default ProductCard;
