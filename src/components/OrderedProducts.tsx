"use client";

import React, { useState } from "react";
import styles from "@/styles/OrderedProducts.module.css";
import { Plus } from "lucide-react";
import OrderPicker from "@/components/OrderPicker";
import { Product } from "@/types/Product";

interface OrderedProductsProps {
  products: Product[];
}

const OrderedProducts: React.FC<OrderedProductsProps> = ({ products }) => {
  const [orders, setOrders] = useState<number[]>([0]);

  const addOrder = () =>
    setOrders((prev) => [...prev, prev.length ? prev[prev.length - 1] + 1 : 0]);

  const removeOrder = (id: number) =>
    setOrders((prev) => prev.filter((orderId) => orderId !== id));

  return (
    <div className={styles.wrapper}>
      {orders.map((orderId, idx) => (
        <OrderPicker
          key={orderId}
          index={idx + 1}
          products={products}
          onDelete={() => removeOrder(orderId)}
        />
      ))}

      <button
        type="button"
        className={styles.addBtn}
        onClick={addOrder}
        aria-label="Añadir producto"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default OrderedProducts;
