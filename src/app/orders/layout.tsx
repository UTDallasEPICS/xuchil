"use client";

import { ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import HeaderNavigator from "@/components/HeaderNavigator";
import styles from "./OrdersLayout.module.css";

const tabs = [
  { label: "ENTREGAS", href: "/orders/deliveries" },
  { label: "CALENDARIO", href: "/orders/calendar" },
];

export default function OrdersLayout({ children }: { children: ReactNode }) {
  const { orderId } = useParams<{ orderId?: string }>();

  const pathname = usePathname();
  const isNewOrder = pathname.endsWith("/new-order");

  const showHeader = orderId === undefined && !isNewOrder;

  return (
    <section className={styles.OrdersLayout}>
      {showHeader && <HeaderNavigator tabs={tabs} />}
      <main className="page">{children}</main>
    </section>
  );
}
