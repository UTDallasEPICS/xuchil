"use client";

import { ReactNode } from "react";
import styles from "./OrdersLayout.module.css";

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return (
    <section className={styles.OrdersLayout}>
      <main className="page">{children}</main>
    </section>
  );
}
