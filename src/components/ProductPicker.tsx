"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "@/styles/ProductPicker.module.css";
import { Product } from "@/types/Product"

interface ProductPickerProps {
  products: Product[];
  onChange?: (p: Product) => void;
}

const ProductPicker: React.FC<ProductPickerProps> = ({ products, onChange }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [isOpen, setIsOpen] = useState(false);

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
        <img
          src={selectedProduct.image}
          alt={selectedProduct.name}
          className={styles.productImage}
        />

        <span className={styles.label}>
          {selectedProduct.name} ({selectedProduct.presentation})
        </span>

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
              aria-selected={p.id === selectedProduct.id}
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
