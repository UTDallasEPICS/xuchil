"use client";

import { ReactNode } from "react";
import styles from "./InventoryLayout.module.css";

export default function InventoryLayout({ children }: { children: ReactNode }) {
  return (
    <section className={styles.InventoryLayout}>
      <main className="page">{children}</main>
    </section>
  );
}
