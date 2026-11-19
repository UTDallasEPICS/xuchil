import React from 'react';
import styles from '@/styles/ProductCard.module.css';

export interface ProductCardProps {
  photo: string;
  name: string;
  presentation?: string;
  quantity: number | string;
  units: string;
  note?: string;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  photo,
  name,
  presentation,
  quantity,
  units,
  note,
  onClick,
}) => (
  <div className={styles.card} onClick={onClick}>
    <img src={photo} alt={name} className={styles.photo} />
    <div className={styles.info}>
      <h3 className={styles.name}>{name}</h3>
      {!!presentation && (
        <p className={styles.presentation}>{presentation}</p>
      )}
      {!!note && (
        <p className={styles.presentation}>{note}</p>
      )}
    </div>
    <div className={styles.amount}>
      <h3 className={styles.quantity}>{quantity}</h3>
      <h3 className={styles.units}>{units}</h3>
    </div>
  </div>
);

export default ProductCard;
