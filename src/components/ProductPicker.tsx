"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "@/styles/ProductPicker.module.css";
import { Product } from "@/types/Product"

interface ProductPickerProps {
  products: Product[];
  valueId?: string;
  onChange?: (p: Product) => void;
}

const ProductPicker: React.FC<ProductPickerProps> = ({ products, valueId, onChange }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] ?? null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      setSelectedProduct(null);
      return;
    }

    const fromValue = valueId ? products.find((p) => p.id === valueId) : null;
    const resolved = fromValue ?? products[0];
    setSelectedProduct(resolved);
    onChange?.(resolved);
  }, [products, valueId, onChange]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(false);
    onChange?.(product);
  };

  return (
    <div className={styles.productPicker}>
      <button
        className={styles.selectedProduct}
        onClick={() => setIsOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedProduct ? (
          <>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className={styles.productImage}
            />

            <span className={styles.label}>
              {selectedProduct.name} ({selectedProduct.presentation})
            </span>
          </>
        ) : (
          <span className={styles.label}>Sin productos disponibles</span>
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
              <img src={p.image} alt={p.name} className={styles.productImage} />
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
