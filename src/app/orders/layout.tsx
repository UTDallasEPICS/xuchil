import HeaderNavigator from "@/components/HeaderNavigator";

const tabs = [
  { label: 'ENTREGAS', href: '/orders/deliveries' },
  { label: 'CALENDARIO', href: '/orders/calendar' },
];

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <HeaderNavigator tabs={tabs} />

      <main>{children}</main>
    </section>
  );
}
