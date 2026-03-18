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
  value?: OrderPickerValue;
  onChange?: (value: OrderPickerValue) => void;
}

const OrderPicker: React.FC<OrderPickerProps> = ({
  index,
  products,
  onDelete,
  value,
  onChange,
}) => {
  const fallbackProductId = products[0]?.id ?? "";
  const [selectedProductId, setSelectedProductId] = useState(value?.productId ?? fallbackProductId);
  const [units, setUnits] = useState(value?.quantity ?? 1);
  const [showModal, setShowModal] = useState(false);

  React.useEffect(() => {
    if (value) {
      setSelectedProductId(value.productId);
      setUnits(value.quantity);
      return;
    }

    if (!selectedProductId && fallbackProductId) {
      setSelectedProductId(fallbackProductId);
    }
  }, [value, selectedProductId, fallbackProductId]);

  React.useEffect(() => {
    onChange?.({ productId: selectedProductId, quantity: units });
  }, [selectedProductId, units, onChange]);

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
          valueId={selectedProductId}
          onChange={(product) => setSelectedProductId(product.id)}
        />

        <h3 className={styles.unitsLabel}>Unidades:</h3>
        <QuantityPicker value={units} onChange={setUnits} min={1} />
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
