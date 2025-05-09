"use client";

import { useMemo, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import DeliveryType from "@/components/DeliveryType";
import BottomButton from "@/components/BottomButton";
import { fetchOrders } from "@/constants/api";
import { Order } from "@/types/Order";

import styles from "./Calendar.module.css";

type DayCell = {
  date: Date;
  isCurrentMonth: boolean;
  orders: Order[];
};

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function parseDeliveryDate(d: string) {
  const [dd, mm, yyyy] = d.split("/").map(Number);
  return new Date(yyyy, mm - 1, dd);
}

function buildCalendarMatrix(
  baseDate: Date,
  ordersByDate: Map<string, Order[]>
): DayCell[][] {
  const first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const last = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);

  const firstWeekday = first.getDay();
  const lastWeekday = last.getDay();

  const start = new Date(first);
  start.setDate(first.getDate() - firstWeekday);

  const end = new Date(last);
  end.setDate(last.getDate() + (6 - lastWeekday));

  const matrix: DayCell[][] = [];
  let cursor = new Date(start);

  while (cursor <= end) {
    const week: DayCell[] = [];
    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(cursor);
      const keyISO = cellDate.toISOString().slice(0, 10);
      const orders = ordersByDate.get(keyISO) ?? [];

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
      const keyISO = cellDate.toISOString().slice(0, 10);
      const orders = ordersByDate.get(keyISO) ?? [];

      week.push({ date: cellDate, isCurrentMonth: false, orders });
      cursor.setDate(cursor.getDate() + 1);
    }
    matrix.push(week);
  }

  return matrix;
}

const Calendar = () => {
  const router = useRouter();
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const ordersCache = useRef<Map<string, Order[]>>(new Map());

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
      const d = parseDeliveryDate(o.deliveryDate)
        .toISOString()
        .slice(0, 10);
      (map.get(d) ?? map.set(d, []).get(d)!).push(o);
    });
    return map;
  }, [monthOrders]);

  const monthMatrix = useMemo(
    () => buildCalendarMatrix(viewDate, ordersByDate),
    [viewDate, ordersByDate]
  );

  const monthName = viewDate.toLocaleDateString("es-MX", { month: "long" });

  const goPrevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));

  const goNextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleNewOrder = () =>
    router.push("/orders/deliveries/new-order");

  return (
    <>
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
                  const dateKey = cell.date.toISOString().slice(0, 10);

                  const orderCount = cell.orders.length;

                  return (
                    <td
                      key={dateKey}
                      className={
                        cell.isCurrentMonth
                          ? styles.dayCell
                          : styles.adjacentDay
                      }
                    >
                      <span className={styles.dayNumber}>{day}</span>

                      {orderCount > 0 && (
                        <DeliveryType
                          type="icon"
                          variant={cell.orders[0].deliveryVariant}
                          quantity={orderCount}
                          size="sm"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BottomButton onClick={handleNewOrder}>Nuevo pedido</BottomButton>
    </>
  );
};

export default Calendar;
