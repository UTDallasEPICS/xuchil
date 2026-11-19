import type { Tab } from "@/components/HeaderNavigator";

export const orderTabs: Tab[] = [
  { label: "Entregas", href: "/orders/deliveries" },
  { label: "Calendario", href: "/orders/calendar" },
];

export const inventoryTabs: Tab[] = [
  { label: "Materia prima", href: "/inventory/raw" },
  { label: "Productos", href: "/inventory/products" },
];
