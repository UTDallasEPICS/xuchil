"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/OrderedProducts.module.css";
import { Plus } from "lucide-react";
import OrderPicker, { OrderPickerValue } from "@/components/OrderPicker";
import {ProductRead} from "@/lib/schemas";

interface OrderedProductsProps {
  products: ProductRead[];
  value?: OrderPickerValue[];
  onChange?: (items: OrderPickerValue[]) => void;
}

type InternalOrder = {
  id: number;
  value: OrderPickerValue;
};

const OrderedProducts: React.FC<OrderedProductsProps> = ({ products, value, onChange }) => {
  const defaultProductId = products[0]?.id ?? "";

  const initialOrders = useMemo<InternalOrder[]>(() => {
    if (value && value.length > 0) {
      return value.map((item, index) => ({
        id: index,
        value: {
          productId: item.productId,
          quantity: item.quantity,
        },
      }));
    }

    return [{ id: 0, value: { productId: defaultProductId, quantity: 1 } }];
  }, [value, defaultProductId]);

  const [orders, setOrders] = useState<InternalOrder[]>(initialOrders);

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    onChange?.(
      orders
        .map((order) => order.value)
        .filter((item) => item.productId && item.quantity > 0)
    );
  }, [orders, onChange]);

  const addOrder = () =>
    setOrders((prev) => {
      const nextId = prev.length ? prev[prev.length - 1].id + 1 : 0;
      return [...prev, { id: nextId, value: { productId: defaultProductId, quantity: 1 } }];
    });

  const removeOrder = (id: number) =>
    setOrders((prev) => prev.filter((order) => order.id !== id));

  const updateOrder = (id: number, nextValue: OrderPickerValue) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, value: nextValue }
          : order
      )
    );
  };

  return (
    <div className={styles.wrapper}>
      {orders.map((order, idx) => (
        <OrderPicker
          key={order.id}
          index={idx + 1}
          products={products}
          value={order.value}
          onChange={(nextValue) => updateOrder(order.id, nextValue)}
          onDelete={() => removeOrder(order.id)}
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
