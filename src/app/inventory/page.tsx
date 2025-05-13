import { redirect } from "next/navigation";

export default function InventoryIndex() {
  redirect("/inventory/products");
}
