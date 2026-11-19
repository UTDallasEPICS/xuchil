"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "@/styles/ProductPicker.module.css";
import { Product } from "@/types/Product";

interface ProductPickerProps {
  products: Product[];
  valueId?: string;
  onChange?: (p: Product) => void;
}

const describe = (p: Product) =>
  `${p.presentation} · ${p.quantity} disponibles`;

const ProductPicker: React.FC<ProductPickerProps> = ({ products, valueId, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedProduct =
    (valueId ? products.find((p) => p.id === valueId) : undefined) ??
    products[0] ??
    null;

  const handleSelectProduct = (product: Product) => {
    setIsOpen(false);
    onChange?.(product);
  };

  if (!selectedProduct) {
    return <p className={styles.emptyState}>No hay productos disponibles</p>;
  }

  return (
    <div className={styles.productPicker}>
      <button
        type="button"
        className={styles.selectedProduct}
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <img
          src={selectedProduct.image || "/globe.svg"}
          alt=""
          className={styles.productImage}
        />

        <span className={styles.label}>
          <span className={styles.name}>{selectedProduct.name}</span>
          <span className={styles.meta}>{describe(selectedProduct)}</span>
        </span>

        <span className={styles.chevronWrap}>
          <ChevronDown size={20} strokeWidth={2} />
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox">
          {products.map((p) => (
            <div
              key={p.id}
              role="option"
              aria-selected={p.id === selectedProduct.id}
              className={`${styles.productItem} ${
                p.id === selectedProduct.id ? styles.productItemSelected : ""
              }`}
              onClick={() => handleSelectProduct(p)}
            >
              <img src={p.image || "/globe.svg"} alt="" className={styles.productImage} />
              <span className={styles.label}>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.meta}>{describe(p)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPicker;
