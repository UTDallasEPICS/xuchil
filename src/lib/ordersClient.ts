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
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Failed to fetch orders");
  const data = await res.json();
  return data.map((o: any) => ({
    id: o.id,
    clientName: o.clientName,
    address: o.addressText || "",
    deliveryDate: formatDateToMX(o.deliveryDate),
    deliveryVariant: mapDeliveryVariant(o.deliveryVariant),
    delivered: !!o.deliveredAt || o.status === "DELIVERED",
    products: (o.orderItems || []).map((it: any) => ({
      id: String(it.productVariant?.id ?? it.productVariantId ?? it.id),
      photo: it.productVariant?.imageUrl || "",
      name: it.productVariant?.name || "",
      presentation: it.productVariant?.presentation || "",
      quantity: Number(it.quantity),
      units: it.unit?.name || "",
    })),
  }));
}

export async function fetchOrderByIdClient(id: number) {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch order");
  const o = await res.json();
  return {
    id: o.id,
    clientName: o.clientName,
    address: o.addressText || "",
    deliveryDate: formatDateToMX(o.deliveryDate),
    deliveryVariant: mapDeliveryVariant(o.deliveryVariant),
    delivered: !!o.deliveredAt || o.status === "DELIVERED",
    products: (o.orderItems || []).map((it: any) => ({
      id: String(it.productVariant?.id ?? it.productVariantId ?? it.id),
      photo: it.productVariant?.imageUrl || "",
      name: it.productVariant?.name || "",
      presentation: it.productVariant?.presentation || "",
      quantity: Number(it.quantity),
      units: it.unit?.name || "",
    })),
    raw: o,
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
  return await res.json();
}
