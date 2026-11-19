"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import OrderCard from "@/components/OrderCard";
import FilterButton from "@/components/FilterButton";
import HeaderNavigator from "@/components/HeaderNavigator";
import { orderTabs } from "@/constants/navTabs";
import { Plus, Search, X } from "lucide-react";
import { Order } from "@/types/Order";
import { fetchOrdersClient } from "@/lib/ordersClient";
import {
  dateFilterOptions,
  sortFilterOptions,
  deliveryFilterOptions,
  orderStatusFilterOptions,
} from "@/constants/filterOptions";
import { FilterOption } from "@/types/FilterOption";
import styles from "./Deliveries.module.css";

function parseMXDate(raw: string): Date | null {
  if (!raw) return null;
  const [dd, mm, yyyy] = raw.trim().split("/").map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return isNaN(d.getTime()) ? null : d;
}
function getISOWeek(date: Date) {
  const tmp = new Date(date.getTime());
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.floor(((+tmp - +yearStart) / 86400000 + 1) / 7);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterOption>(orderStatusFilterOptions[0]);
  const [dateFilter, setDateFilter] = useState<FilterOption>(dateFilterOptions[0]);
  const [sortFilter, setSortFilter] = useState<FilterOption>(sortFilterOptions[0]);
  const [deliveryFilter, setDeliveryFilter] = useState<FilterOption>(deliveryFilterOptions[0]);
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchOrdersClient()
      .then((data) => mounted && setOrders(data))
      .catch((err) => console.error("Failed to load orders", err))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const visibleOrders = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let list = orders;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.clientName?.toLowerCase().includes(q) ||
          o.address?.toLowerCase().includes(q) ||
          String(o.id).includes(q.replace(/^#/, ""))
      );
    }

    if (statusFilter.value === "pending") {
      list = list.filter((o) => !o.delivered);
    } else if (statusFilter.value === "delivered") {
      list = list.filter((o) => o.delivered);
    }

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
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
          );
        }
        if (dateFilter.value === "year") {
          return d.getFullYear() === currentYear;
        }
        return true;
      });
    }
    const asc = sortFilter.value === "asc";
    return [...list].sort((a, b) => compareDates(a, b, asc));
  }, [orders, searchQuery, statusFilter, deliveryFilter, dateFilter, sortFilter]);

  const handleNewOrder = () => {
    router.push("/orders/deliveries/new-order");
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Pedidos</h1>

      <HeaderNavigator tabs={orderTabs} variant="full" />

      <div className={styles.searchBar}>
        <Search size={18} strokeWidth={2.2} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por cliente, #pedido o dirección..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => setSearchQuery("")}
            aria-label="Limpiar búsqueda"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        )}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <FilterButton
            title="Estado"
            options={orderStatusFilterOptions}
            onChange={setStatusFilter}
            variant="outline"
          />
          <FilterButton
            title="Filtrar por fecha"
            options={dateFilterOptions}
            onChange={setDateFilter}
            variant="outline"
          />
          <FilterButton
            title="Ordenar"
            options={sortFilterOptions}
            onChange={setSortFilter}
            variant="outline"
          />
          <FilterButton
            title="Tipo de entrega"
            options={deliveryFilterOptions}
            onChange={setDeliveryFilter}
            variant="outline"
          />
        </div>
      </div>

      <div className={styles.list}>
        {loading ? (
          <p className={styles.empty}>Cargando pedidos...</p>
        ) : visibleOrders.length === 0 ? (
          <button
            type="button"
            className={styles.emptyState}
            onClick={handleNewOrder}
          >
            <span className={styles.emptyIcon}>
              <Plus size={64} strokeWidth={1.5} />
            </span>
            <span className={styles.emptyText}>
              Sin pedidos encontrados, haz click para agregar uno
            </span>
          </button>
        ) : (
          <>
            {visibleOrders.map((order) => (
              <OrderCard key={order.id} {...order} />
            ))}

            <button
              type="button"
              className={styles.addBtn}
              onClick={handleNewOrder}
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>Nuevo pedido</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Deliveries;
