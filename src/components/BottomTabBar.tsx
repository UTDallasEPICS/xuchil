"use client";
import Link from "next/link";
import { Wheat, ClipboardList, Package, Truck } from "lucide-react";
import styles from "@/styles/BottomTabBar.module.css";
import { usePathname } from "next/navigation";

const tabs = [
  { name: "Control de procesos", path: "/process-control", icon: <Wheat /> },
  { name: "Bitácora", path: "/logbook", icon: <ClipboardList /> },
  { name: "Inventario", path: "/inventory", icon: <Package /> },
  { name: "Pedidos", path: "/orders", icon: <Truck /> },
];

const BottomTabBar = ({ className }: { className?: string }) => {
  const pathname = usePathname();
  return (
    <nav className={`${styles.bottomTabBar} ${className || ''}`}>
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          href={tab.path}
          className={
            pathname.startsWith(tab.path)
              ? `${styles.tab} ${styles.tabActive}`
              : styles.tab
          }
        >
          <div className={styles.tabIcon}>{tab.icon}</div>
          <span className={styles.tabText}>{tab.name}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomTabBar;
