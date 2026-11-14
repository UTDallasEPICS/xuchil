"use client";

import React, { useState } from "react";
import styles from "@/styles/OrderPicker.module.css";
import { Trash2 } from "lucide-react";
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
  value?: OrderPickerValue;
  onChange?: (value: OrderPickerValue) => void;
}

const OrderPicker: React.FC<OrderPickerProps> = ({
  products,
  onDelete,
  value,
  onChange,
}) => {
  const fallbackProductId = products[0]?.id ?? "";
  const selectedProductId = value?.productId || fallbackProductId;
  const units = value?.quantity ?? 1;
  const [showModal, setShowModal] = useState(false);

  const handleProductChange = (product: Product) => {
    onChange?.({ productId: product.id, quantity: units });
  };

  const handleUnitsChange = (nextUnits: number) => {
    onChange?.({ productId: selectedProductId, quantity: nextUnits });
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <ProductPicker
            products={products}
            valueId={selectedProductId}
            onChange={handleProductChange}
          />

          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => setShowModal(true)}
            aria-label="Quitar producto del pedido"
            title="Quitar producto"
          >
            <Trash2 size={20} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.unitsRow}>
          <span className={styles.unitsLabel}>Unidades</span>
          <QuantityPicker value={units} onChange={handleUnitsChange} min={1} />
        </div>
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
