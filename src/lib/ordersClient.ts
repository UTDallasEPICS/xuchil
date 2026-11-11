import { Order } from "@/types/Order";

export function formatDateToMX(dateStr: string | Date) {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function mapDeliveryVariant(serverVariant: string) {
  switch (serverVariant) {
    case "MAIL":
      return "mail" as const;
    case "PERSONAL":
      return "personal" as const;
    case "CONSIGNMENT":
      return "consignment" as const;
    default:
      return "mail" as const;
  }
}

export async function fetchOrdersClient() {
  const res = await fetch("/api/orders", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch orders");
    const data: ApiOrder[] = await res.json();
    return data.filter((o) => o.status !== "CANCELLED").map(mapOrder);
}

export async function fetchOrderByIdClient(id: number) {
  const res = await fetch(`/api/orders/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch order");
    const o: ApiOrder = await res.json();
  return {
      ...mapOrder(o),
    raw: o,
  };
}

  interface ApiOrderItem {
    id: number | string;
    productVariantId?: number | string;
    quantity: number | string;
    productVariant?: {
      id?: number | string;
      imageUrl?: string | null;
      name?: string | null;
      presentation?: string | null;
    } | null;
    unit?: { name?: string | null } | null;
  }

  interface ApiOrder {
    id: number;
    clientName: string;
    addressText?: string | null;
    deliveryDate: string;
    deliveryVariant: string;
    deliveredAt?: string | null;
    consignmentPartner?: string | null;
    notes?: string | null;
    status: string;
    orderItems?: ApiOrderItem[];
  }

  function mapOrder(o: ApiOrder): Order & { raw?: ApiOrder } {
    return {
      id: o.id,
      clientName: o.clientName,
      address: o.addressText || "",
      deliveryDate: formatDateToMX(o.deliveryDate),
      deliveryVariant: mapDeliveryVariant(o.deliveryVariant),
      delivered: !!o.deliveredAt || o.status === "DELIVERED",
      products: (o.orderItems || []).map((it: ApiOrderItem) => ({
        id: String(it.productVariant?.id ?? it.productVariantId ?? it.id),
        photo: it.productVariant?.imageUrl || "/globe.svg",
        name: it.productVariant?.name || "",
        presentation: it.productVariant?.presentation || "",
        quantity: Number(it.quantity),
        units: it.unit?.name || "",
      })),
    };
  }
export async function putOrderStatusClient(id: number, status: "SCHEDULED" | "DELIVERED" | "CANCELLED") {
  const res = await fetch(`/api/orders/${id}/status`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(status),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to update status");
  }
  return res.json();
}
