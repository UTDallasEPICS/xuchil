"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "@/styles/ProductPicker.module.css";
import { Product } from "@/types/Product"

interface ProductPickerProps {
  products: Product[];
  valueId?: string;
  onChange?: (p: Product) => void;
}

// Controlled: the selected product is derived from `valueId`, and `onChange`
// only fires on a user selection. Syncing props into state and calling
// `onChange` from an effect caused infinite render loops in OrderPicker.
const ProductPicker: React.FC<ProductPickerProps> = ({ products, valueId, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedProduct = products.find((p) => p.id === valueId) ?? null;

  const handleSelectProduct = (product: Product) => {
    setIsOpen(false);
    onChange?.(product);
  };

  return (
    <div className={styles.productPicker}>
      <button
        type="button"
        className={styles.selectedProduct}
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedProduct ? (
          <>
            <img
              src={selectedProduct.image || "/globe.svg"}
              alt={selectedProduct.name}
              className={styles.productImage}
            />

            <span className={styles.label}>
              {selectedProduct.name} ({selectedProduct.presentation})
            </span>
          </>
        ) : (
          <span className={styles.label}>
            {products.length > 0 ? "Selecciona un producto" : "Sin productos disponibles"}
          </span>
        )}

        <div className={styles.chevronWrap}>
          <ChevronDown size={20} strokeWidth={2} />
        </div>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {products.map((p) => (
            <div
              key={p.id}
              role="option"
              aria-selected={p.id === selectedProduct?.id}
              className={styles.productItem}
              onClick={() => handleSelectProduct(p)}
            >
              <img src={p.image || "/globe.svg"} alt={p.name} className={styles.productImage} />
              <div className={styles.productInfo}>
                <strong>{p.name}</strong>
                <span>{p.presentation}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPicker;
