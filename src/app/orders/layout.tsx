"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import HeaderNavigator from "@/components/HeaderNavigator";
import styles from "./OrdersLayout.module.css";

const tabs = [
  { label: "ENTREGAS", href: "/orders/deliveries" },
  { label: "CALENDARIO", href: "/orders/calendar" },
];

export default function OrdersLayout({ children }: { children: ReactNode }) {
  const { orderId } = useParams<{ orderId?: string }>();

  const showHeader = orderId === undefined;

  return (
    <section className={styles.OrdersLayout}>
      {showHeader && <HeaderNavigator tabs={tabs} />}
      <main className="page">{children}</main>
    </section>
  );
}
