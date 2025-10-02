"use client";

import { useMemo, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, X as CloseIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import DeliveryType from "@/components/DeliveryType";
import BottomButton from "@/components/BottomButton";
import { fetchOrders } from "@/constants/api";
import { Order } from "@/types/Order";
import OrderCard from "@/components/OrderCard";
import { keyFromLocalDate, parseMXDateLocal } from "@/utils/date";

import styles from "./Calendar.module.css";

type DayCell = {
  date: Date;
  isCurrentMonth: boolean;
  orders: Order[];
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function buildCalendarMatrix(
  baseDate: Date,
  ordersByDate: Map<string, Order[]>
): DayCell[][] {
  const first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const last = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const end = new Date(last);
  end.setDate(last.getDate() + (6 - last.getDay()));

  const matrix: DayCell[][] = [];
  let cursor = new Date(start);

  while (cursor <= end) {
    const week: DayCell[] = [];
    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(cursor);
      const k = keyFromLocalDate(cellDate);
      const orders = ordersByDate.get(k) ?? [];

      week.push({
        date: cellDate,
        isCurrentMonth: cellDate.getMonth() === baseDate.getMonth(),
        orders,
      });

      cursor.setDate(cursor.getDate() + 1);
    }
    matrix.push(week);
  }

  while (matrix.length < 6) {
    const week: DayCell[] = [];
    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(cursor);
      const k = keyFromLocalDate(cellDate);
      const orders = ordersByDate.get(k) ?? [];

      week.push({ date: cellDate, isCurrentMonth: false, orders });
      cursor.setDate(cursor.getDate() + 1);
    }
    matrix.push(week);
  }

  return matrix;
}

type VariantCount = Record<Order["deliveryVariant"], number>;
function groupByVariant(orders: Order[]): VariantCount {
  return orders.reduce<VariantCount>((acc, o) => {
    acc[o.deliveryVariant] = (acc[o.deliveryVariant] ?? 0) + 1;
    return acc;
  }, {} as VariantCount);
}

const Calendar = () => {
  const router = useRouter();
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const ordersCache = useRef<Map<string, Order[]>>(new Map());
  const [selectedOrders, setSelectedOrders] = useState<Order[] | null>(null);
  const [selectedDate,   setSelectedDate]   = useState<Date | null>(null);
  const hasOrders = !!(selectedOrders && selectedOrders.length);

  const clearSelectedOrders = () => {
    setSelectedOrders(null);
    setSelectedDate(null);
  }

  const monthOrders = useMemo(() => {
    const key = getMonthKey(viewDate);

    if (!ordersCache.current.has(key)) {
      const allOrders = fetchOrders();
      const filtered = allOrders.filter((o) => {
        const [dd, mm, yyyy] = o.deliveryDate.split("/").map(Number);
        return (
          yyyy === viewDate.getFullYear() && mm - 1 === viewDate.getMonth()
        );
      });
      ordersCache.current.set(key, filtered);
    }
    return ordersCache.current.get(key)!;
  }, [viewDate]);

  const ordersByDate = useMemo(() => {
    const map = new Map<string, Order[]>();
    monthOrders.forEach((o) => {
      const d = parseMXDateLocal(o.deliveryDate);
      const k = keyFromLocalDate(d);
      (map.get(k) ?? map.set(k, []).get(k)!).push(o);
    });
    return map;
  }, [monthOrders]);

  const monthMatrix = useMemo(
    () => buildCalendarMatrix(viewDate, ordersByDate),
    [viewDate, ordersByDate]
  );

  const monthName = viewDate.toLocaleDateString("es-MX", { month: "long" });

  const goPrevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    clearSelectedOrders();
  }

  const goNextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    clearSelectedOrders();
  }

  const handleNewOrder = () =>
    router.push("/orders/deliveries/new-order");

  return (
    <>
      <div
        className={`${styles.calendarLayout} ${
          hasOrders ? styles.twoColumn : ""
        }`}
      >
        <div className={styles.calendarWrapper}>
          <div className={styles.yearRow}>
            <h1 className={styles.yearTitle}>{viewDate.getFullYear()}</h1>
          </div>

          <div className={styles.headerRow}>
            <button
              aria-label="Mes anterior"
              onClick={goPrevMonth}
              className={styles.navBtn}
            >
              <ChevronLeft size={48} strokeWidth={7} />
            </button>

            <div className={styles.monthBox}>
              <h1 className={styles.monthTitle}>{monthName.toUpperCase()}</h1>
            </div>

            <button
              aria-label="Mes siguiente"
              onClick={goNextMonth}
              className={styles.navBtn}
            >
              <ChevronRight size={48} strokeWidth={7} />
            </button>
          </div>

          <table className={styles.calendar}>
            <thead>
              <tr>
                {["D", "L", "M", "MM", "J", "V", "S"].map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {monthMatrix.map((week, wi) => (
                <tr key={wi}>
                  {week.map((cell) => {
                    const day = cell.date.getDate();
                    const k = keyFromLocalDate(cell.date);
                    const orderCount = cell.orders.length;

                    return (
                      <td
                        key={k}
                        className={
                          cell.isCurrentMonth
                            ? styles.dayCell
                            : styles.adjacentDay
                        }
                      >
                        <span className={styles.dayNumber}>{day}</span>
                        {orderCount > 0 && (() => {
                          const variantCounts = groupByVariant(cell.orders);
                          const sorted = Object.entries(variantCounts)
                            .sort((a, b) => b[1] - a[1]);
                          const visible = sorted.slice(0, 3);
                          const hiddenCount = sorted.slice(3).reduce((s, [, n]) => s + n, 0);
                          const sameDay =
                            selectedDate &&
                            keyFromLocalDate(selectedDate) === k;
                          const pileClassNames = styles.pileRow;
                          const scale =
                            visible.length === 1 ? 1 :
                            visible.length === 2 ? 0.82 : 0.68;
                          return (
                            <div className={styles.pileAnchor}>
                              <div
                                className={styles.pileRow}
                                style={{ ["--pile-scale" as any]: scale }}
                              >
                                {visible.map(([variant, qty], idx) => (
                                  <span
                                    key={variant}
                                    className={styles.pileItem}
                                    style={{ zIndex: 100 - idx }}
                                  >
                                    <DeliveryType
                                      type="icon"
                                      variant={variant as Order["deliveryVariant"]}
                                      quantity={qty}
                                      size="sm"
                                      onClick={() => {
                                        if (sameDay) {
                                          clearSelectedOrders();
                                        } else {
                                          setSelectedOrders(cell.orders);
                                          setSelectedDate(cell.date);
                                        }
                                      }}
                                    />
                                  </span>
                                ))}
                                {hiddenCount > 0 && (
                                  <button
                                    className={styles.pileMore}
                                    onClick={() => {
                                      if (sameDay) {
                                        clearSelectedOrders();
                                      } else {
                                        setSelectedOrders(cell.orders);
                                        setSelectedDate(cell.date);
                                      }
                                    }}
                                    aria-label={`Ver ${hiddenCount} pedido(s) más`}
                                    title={`Ver ${hiddenCount} pedido(s) más`}
                                    style={{ zIndex: 0 }}
                                  >
                                    +{hiddenCount}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          {hasOrders && selectedDate && (
            <div className={styles.ordersWrapper}>
              <div className={styles.ordersHeader}>
                <h3 className={styles.ordersHeading}>
                  Pedidos&nbsp;
                  {selectedDate.toLocaleDateString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </h3>
                <button
                  type="button"
                  aria-label="Cerrar panel de pedidos"
                  title="Cerrar"
                  className={styles.closeBtn}
                  onClick={clearSelectedOrders}
                >
                  <CloseIcon size={18} strokeWidth={2.5} />
                </button>
              </div>
              <div className={styles.orderList}>
                {selectedOrders.map((o) => (
                  <OrderCard key={o.id} {...o} />
                ))}
              </div>
            </div>
          )}
      </div>
      <BottomButton onClick={handleNewOrder}>Nuevo Pedido</BottomButton>
    </>
  );
};

export default Calendar;
