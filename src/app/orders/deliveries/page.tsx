"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import OrderCard from "@/components/OrderCard";
import FilterButton from "@/components/FilterButton";
import BottomButton from "@/components/BottomButton";
import {
  dateFilterOptions,
  sortFilterOptions,
  deliveryFilterOptions,
} from "@/constants/filterOptions";
import { FilterOption } from "@/types/FilterOption";
import styles from "./Deliveries.module.css";
import { OrderRead } from "@/lib/schemas";

function parseMXDate(raw: string): Date | null {
  if (!raw) return null;

  const d = new Date(raw);

  return isNaN(d.getTime()) ? null : d;
}

function formatMXDate(raw: string) {
  const d = new Date(raw);

  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getISOWeek(date: Date) {
  const tmp = new Date(date.getTime());
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.floor(((+tmp - +yearStart) / 86400000 + 1) / 7);
}

const compareDates = (a: OrderRead, b: OrderRead, asc = true) => {
  const da = parseMXDate(a.deliveryDate);
  const db = parseMXDate(b.deliveryDate);

  if (!da && !db) return 0;
  if (!da) return 1;
  if (!db) return -1;

  return asc ? da.getTime() - db.getTime() : db.getTime() - da.getTime();
};

const Deliveries = () => {
  const [dateFilter, setDateFilter] = useState<FilterOption>(dateFilterOptions[0]);
  const [sortFilter, setSortFilter] = useState<FilterOption>(sortFilterOptions[0]);
  const [deliveryFilter, setDeliveryFilter] = useState<FilterOption>(deliveryFilterOptions[0]);

  const [orders, setOrders] = useState<OrderRead[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function getOrders() {
      try {
        const response = await fetch("/api/orders");

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
      
        setOrders(data);
      } catch (error) {
        console.error("Error loading orders", error);
      } finally {
        setLoading(false);
      }
    }

    getOrders();
  }, []);

  const visibleOrders = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let list = orders;

    if (deliveryFilter.value !== "todos") {
      list = list.filter((o) => o.deliveryVariant === deliveryFilter.value);
    }

    if (dateFilter.value !== "all") {
      list = list.filter((o) => {
        const d = parseMXDate(o.deliveryDate);
        if (!d) return false;

        if (dateFilter.value === "today") {
          return (
            d.getDate() === currentDay &&
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
          );
        }

        if (dateFilter.value === "week") {
          return (
            getISOWeek(d) === getISOWeek(today) &&
            d.getFullYear() === currentYear
          );
        }

        if (dateFilter.value === "month") {
          return (
            d.getMonth() === currentMonth &&
            d.getFullYear() === currentYear
          );
        }

        return true;
      });
    }

    const asc = sortFilter.value === "asc";

    return [...list].sort((a, b) => compareDates(a, b, asc));
  }, [orders, deliveryFilter, dateFilter, sortFilter]);

  const handleNewOrder = () => {
    router.push("/orders/deliveries/new-order");
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
        {loading ? (
          <p className={styles.empty}>Cargando pedidos...</p>
        ) : visibleOrders.length === 0 ? (
          <p className={styles.empty}>Sin pedidos encontrados</p>
        ) : (
          visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              {...order}
              deliveryDate={formatMXDate(order.deliveryDate)}
            />
          ))
        )}
      </div>

      <BottomButton onClick={handleNewOrder}>Nuevo Pedido</BottomButton>
    </div>
  );
};

export default Deliveries;