"use client";

import { useState, useMemo } from "react";
import OrderCard from "@/components/OrderCard";
import FilterButton from "@/components/FilterButton";
import BottomButton from "@/components/BottomButton";
import { Order } from "@/types/Order";
import { fetchOrders } from "@/constants/api";
import {
  dateFilterOptions,
  sortFilterOptions,
  deliveryFilterOptions,
} from "@/constants/filterOptions";

import styles from "./Deliveries.module.css";

function parseMXDate(raw: string): Date | null {
  if (!raw) return null;
  const clean = raw.trim();
  const parts = clean.split("/");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map((p) => Number(p));
  const d = new Date(yyyy, mm - 1, dd);
  return isNaN(d.getTime()) ? null : d;
}

const compareDates = (a: Order, b: Order, asc = true) => {
  const da = parseMXDate(a.deliveryDate);
  const db = parseMXDate(b.deliveryDate);

  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;

  return asc ? da.getTime() - db.getTime() : db.getTime() - da.getTime();
};


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

    const asc = sortFilter.value === "asc";
    return [...list].sort((a, b) => compareDates(a, b, asc));
  }, [orders, deliveryFilter, dateFilter, sortFilter]);

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
