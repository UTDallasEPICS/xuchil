"use client";

import { useState, useMemo } from "react";
import OrderCard from "@/components/OrderCard";
import FilterButton from "@/components/FilterButton";
import BottomButton from "@/components/BottomButton";

import { fetchOrders } from "@/constants/api";
import {
  dateFilterOptions,
  sortFilterOptions,
  deliveryFilterOptions,
} from "@/constants/filterOptions";

import styles from "./Deliveries.module.css";

const Deliveries = () => {
  const [dateFilter, setDateFilter] = useState(dateFilterOptions[0]);
  const [sortFilter, setSortFilter] = useState(sortFilterOptions[0]);
  const [deliveryFilter, setDeliveryFilter] = useState(deliveryFilterOptions[0]);

  const orders = useMemo(() => fetchOrders(), []);

  const visibleOrders = useMemo(() => {
    let list = orders;

    if (deliveryFilter.value !== "todos") {
      list = list.filter(
        (o) => o.deliveryVariant === deliveryFilter.value
      );
    }

    if (sortFilter.value === "asc") {
      list = [...list].sort(
        (a, b) =>
          new Date(a.deliveryDate).getTime() -
          new Date(b.deliveryDate).getTime()
      );
    } else {
      list = [...list].sort(
        (a, b) =>
          new Date(b.deliveryDate).getTime() -
          new Date(a.deliveryDate).getTime()
      );
    }
    return list;
  }, [orders, deliveryFilter, sortFilter]);

  const handleNewOrder = () => {
    console.log("Nuevo pedido");
  };

  return (
    <div className={`${styles.wrapper} page`}>
      <div className={styles.filters}>
        <FilterButton
          title="Filtrar por fecha"
          options={dateFilterOptions}
          onChange={setDateFilter}
          variant="dark"
        />
        <FilterButton
          title="Ordenar"
          options={sortFilterOptions}
          onChange={setSortFilter}
          variant="dark"
        />
        <FilterButton
          title="Tipo de entrega"
          options={deliveryFilterOptions}
          onChange={setDeliveryFilter}
          variant="dark"
        />
      </div>
      <div className={styles.scrollArea}>
        {visibleOrders.map((order) => (
          <OrderCard key={order.id} {...order} />
        ))}
      </div>

      <BottomButton onClick={handleNewOrder}>Nuevo Pedido</BottomButton>
    </div>
  );
};

export default Deliveries;
