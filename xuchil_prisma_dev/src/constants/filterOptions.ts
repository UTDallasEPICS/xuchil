import { Users, User, Calendar, Leaf, Cookie, Coffee, Package, Bean } from "lucide-react";

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
