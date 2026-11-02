"use client";

import React, { useState } from "react";
import styles from "@/styles/OrderPicker.module.css";
import { Trash } from "lucide-react";
import ProductPicker from "@/components/ProductPicker";
import QuantityPicker from "@/components/QuantityPicker";
import DeleteModal from "@/components/DeleteModal";
import { Product } from "@/types/Product";

export interface OrderPickerValue {
  productId: string;
  quantity: number;
}

interface OrderPickerProps {
  index: number;
  products: Product[];
  onDelete: () => void;
  value: OrderPickerValue;
  onChange: (value: OrderPickerValue) => void;
}

// Controlled: product and quantity live in the parent (OrderedProducts).
const OrderPicker: React.FC<OrderPickerProps> = ({
  index,
  products,
  onDelete,
  value,
  onChange,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>{`Producto ${index}`}</h2>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => setShowModal(true)}
            aria-label="Eliminar producto"
          >
            <Trash size={20} strokeWidth={3} />
          </button>
        </div>

        <ProductPicker
          products={products}
          valueId={value.productId}
          onChange={(product) => onChange({ ...value, productId: product.id })}
        />

        <h3 className={styles.unitsLabel}>Unidades:</h3>
        <QuantityPicker
          value={value.quantity}
          onChange={(quantity) => onChange({ ...value, quantity })}
          min={1}
        />
      </div>

      {showModal && (
        <DeleteModal
          message="¿Deseas eliminar este producto del pedido?"
          onCancel={() => setShowModal(false)}
          onConfirm={() => {
            setShowModal(false);
            onDelete();
          }}
        />
      )}
    </>
  );
};

export default OrderPicker;
