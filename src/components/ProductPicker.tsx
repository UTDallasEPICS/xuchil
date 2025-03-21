import React, { useState } from "react";
import styles from "../styles/ProductPicker.module.css";

interface Product {
  id: number;
  name: string;
  weight: string;
  image: string;
}

interface ProductPickerProps {
  products: Product[];
}

const ProductPicker: React.FC<ProductPickerProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(false);
  };

  return (
    <div className={styles.productPicker}>
      {/* Botón de selección */}
      <button className={styles.selectedProduct} onClick={() => setIsOpen(!isOpen)}>
        <img src={selectedProduct.image} alt={selectedProduct.name} className={styles.productImage} />
        <span>{selectedProduct.name} ({selectedProduct.weight})</span>
        <div className={styles.arrow}></div>
      </button>

      {/* Lista desplegable */}
      {isOpen && (
        <div className={styles.dropdown}>
          {products.map((product) => (
            <div key={product.id} className={styles.productItem} onClick={() => handleSelectProduct(product)}>
              <img src={product.image} alt={product.name} className={styles.productImage} />
              <div className={styles.productInfo}>
                <strong>{product.name}</strong>
                <span>{product.weight}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPicker;
