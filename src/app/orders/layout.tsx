import HeaderNavigator from "@/components/HeaderNavigator";
import styles from "./OrdersLayout.module.css";

const tabs = [
  { label: 'ENTREGAS', href: '/orders/deliveries' },
  { label: 'CALENDARIO', href: '/orders/calendar' },
];

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className={styles.OrdersLayout}>
      <HeaderNavigator tabs={tabs} />
      <main className="page">{children}</main>
    </section>
  );
}
