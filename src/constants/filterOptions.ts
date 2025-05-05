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
} from "lucide-react";

export const productFilterOptions = [
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

export const userFilterOptions = [
  { label: "Todos", icon: Users },
  { label: "Antonio López", icon: User },
  { label: "Minerva Cruz", icon: User },
  { label: "Petronila Hernández", icon: User },
  { label: "Víctor Aragón", icon: User },
  { label: "Zoraida Pérez", icon: User },
];

export const monthFilterOptions = [
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

export const dateFilterOptions = [
  { label: "Cualquier fecha", icon: CalendarClock, value: "all" },
  { label: "Hoy", icon: CalendarClock, value: "today" },
  { label: "Esta semana", icon: CalendarClock, value: "week" },
  { label: "Este mes", icon: CalendarClock, value: "month" },
  { label: "Este año", icon: CalendarClock, value: "year" },
];

export const sortFilterOptions = [
  { label: "Más próximos", icon: CalendarArrowUp, value: "asc" },
  { label: "Más lejanos", icon: CalendarArrowDown, value: "desc" },
];

export const deliveryFilterOptions = [
  { label: "Todos", icon: ListFilter, value: "todos" },
  { label: "Entrega personal", img: "/Personal.svg", value: "personal" },
  { label: "Envío por correo", img: "/Mail.svg", value: "mail" },
  { label: "En consignación", img: "/Consignment.svg", value: "consignment" },
];
