"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import XuchilHeader from "@/components/HeaderXuchil";
import DynamicTable from "@/components/DynamicTable";
import { movementColumns } from "@/constants/tableData";
import styles from "./DetailPage.module.css";

type DetailItem = {
  name: string;
  presentation?: string;
  quantity: number;
  units: string;
  lots: Array<{ id: number }>;
};

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<DetailItem | null>(null);
  const [movimientos, setMovimientos] = useState<Array<{ movimiento: string; fecha: string }>>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const itemResponse = await fetch(`/api/inventory/items/${id}`, { credentials: "include" });
      if (!itemResponse.ok) return;
      const data = await itemResponse.json();

      const qty = (data.inventoryLots || []).reduce(
        (sum: number, lot: any) => sum + Number(lot.qtyOnHand || 0),
        0
      );

      const mappedItem: DetailItem = {
        name: data.itemType === "RAW"
          ? data.rawMaterial?.name ?? "Materia prima"
          : data.productVariant?.product?.name ?? "Producto",
        presentation: data.itemType === "RAW"
          ? undefined
          : data.productVariant?.name ?? data.productVariant?.presentation ?? "",
        quantity: qty,
        units:
          data.rawMaterial?.defaultUnit?.name ||
          data.productVariant?.defaultUnit?.name ||
          data.inventoryLots?.[0]?.unit?.name ||
          "",
        lots: data.inventoryLots || [],
      };

      const movementRows: Array<{ movimiento: string; fecha: string }> = [];
      for (const lot of mappedItem.lots) {
        const movementResponse = await fetch(`/api/inventory/lots/${lot.id}/movements`, { credentials: "include" });
        if (!movementResponse.ok) continue;
        const movements = await movementResponse.json();
        movements.forEach((movement: any) => {
          movementRows.push({
            movimiento: `${movement.direction} ${movement.qty} (${movement.reason})`,
            fecha: movement.movedAt
              ? new Date(movement.movedAt).toLocaleDateString("es-MX")
              : "",
          });
        });
      }

      if (!mounted) return;
      setItem(mappedItem);
      setMovimientos(movementRows);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (!item) return <p>Producto no encontrado</p>;

  return (
    <div className={styles.wrapper}>
      <XuchilHeader />
      <h1 className={styles.title}>
        {item.name} <br />({item.presentation})
      </h1>
      <p className={styles.subtitle}>
        En inventario: <strong>{item.quantity} {item.units}</strong>
      </p>
      <DynamicTable columns={movementColumns} data={movimientos} />
    </div>
  );
}
