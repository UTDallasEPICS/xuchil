"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import HeaderNavigator from "@/components/HeaderNavigator";
import styles from "./InventoryLayout.module.css";

const tabs = [
  { label: "MATERIA PRIMA", href: "/inventory/raw" },
  { label: "PRODUCTOS", href: "/inventory/products" },
];

export default function InventoryLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDetailView =
    pathname.includes("/inventory/products/") ||
    pathname.includes("/inventory/raw/");

  return (
    <section className={styles.InventoryLayout}>
      {!isDetailView && <HeaderNavigator tabs={tabs} />}
      <main className="page">{children}</main>
    </section>
  );
}
