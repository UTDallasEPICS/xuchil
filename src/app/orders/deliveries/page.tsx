"use client";
import { useMemo } from "react";
import OrderCard from "@/components/OrderCard";
import { fetchOrders } from "@/constants/api";

const Deliveries = () => {
  const orders = useMemo(() => fetchOrders(), []);

  return (
    <section>
      {orders.map((order) => (
        <OrderCard key={order.id} {...order} />
      ))}
    </section>
  );
};

export default Deliveries;
