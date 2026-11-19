import {
  Users,
  User,
  Calendar,
  Leaf,
  Cookie,
  Coffee,
  Package,
  Bean,
  CalendarClock,
  CalendarArrowUp,
  CalendarArrowDown,
  ListFilter,
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CheckCircle2,
  Clock,
} from "lucide-react";

import type { FilterOption } from "@/types/FilterOption";

export const productFilterOptions: FilterOption[] = [
  { label: "Todos", icon: Package },
  { label: "Harina de mezquite", icon: Leaf },
  { label: "Harina de amaranto", icon: Leaf },
  { label: "Harina de maíz", icon: Leaf },
  { label: "Harina de plátano", icon: Leaf },
  { label: "Galletas de mezquite", icon: Cookie },
  { label: "Galletas de amaranto", icon: Cookie },
  { label: "Frijol", icon: Bean },
  { label: "Sustituto de café", icon: Coffee },
];

export const userFilterOptions: FilterOption[] = [
  { label: "Todos", icon: Users },
  { label: "Antonio López", icon: User },
  { label: "Minerva Cruz", icon: User },
  { label: "Petronila Hernández", icon: User },
  { label: "Víctor Aragón", icon: User },
  { label: "Zoraida Pérez", icon: User },
  { label: "Bob", icon: User },
];

export const monthFilterOptions: FilterOption[] = [
  { label: "Cualquiera", icon: Calendar },
  { label: "Enero", icon: Calendar },
  { label: "Febrero", icon: Calendar },
  { label: "Marzo", icon: Calendar },
  { label: "Abril", icon: Calendar },
  { label: "Mayo", icon: Calendar },
  { label: "Junio", icon: Calendar },
  { label: "Julio", icon: Calendar },
  { label: "Agosto", icon: Calendar },
  { label: "Septiembre", icon: Calendar },
  { label: "Octubre", icon: Calendar },
  { label: "Noviembre", icon: Calendar },
  { label: "Diciembre", icon: Calendar },
];

export const dateFilterOptions: FilterOption[] = [
  { label: "Cualquier fecha", icon: CalendarClock, value: "all" },
  { label: "Hoy", icon: CalendarClock, value: "today" },
  { label: "Esta semana", icon: CalendarClock, value: "week" },
  { label: "Este mes", icon: CalendarClock, value: "month" },
  { label: "Este año", icon: CalendarClock, value: "year" },
];

export const sortFilterOptions: FilterOption[] = [
  { label: "Próximos", icon: CalendarArrowUp, value: "asc" },
  { label: "Lejanos", icon: CalendarArrowDown, value: "desc" },
];

export const deliveryFilterOptions: FilterOption[] = [
  { label: "Todos", icon: ListFilter, value: "todos" },
  { label: "Entrega personal", img: "/Personal.svg", value: "personal" },
  { label: "Envío por correo", img: "/Mail.svg", value: "mail" },
  { label: "En consignación", img: "/Consignment.svg", value: "consignment" },
];

export const orderStatusFilterOptions: FilterOption[] = [
  { label: "Todos", icon: ListFilter, value: "all" },
  { label: "Pendientes", icon: Clock, value: "pending" },
  { label: "Entregados", icon: CheckCircle2, value: "delivered" },
];

export const inventorySortOptions: FilterOption[] = [
  { label: "Nombre A-Z", icon: ArrowDownAZ, value: "name" },
  { label: "Más existencias", icon: ArrowDownWideNarrow, value: "qty-desc" },
  { label: "Menos existencias", icon: ArrowUpNarrowWide, value: "qty-asc" },
];
