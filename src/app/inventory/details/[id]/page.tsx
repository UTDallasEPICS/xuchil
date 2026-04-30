"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import XuchilHeader from "@/components/HeaderXuchil";
import DynamicTable from "@/components/DynamicTable";
import styles from "./DetailPage.module.css";
import inventoryClient from "@/lib/services/inventoryClient";
import {InventoryMovementRead} from "@/lib/schemas";

type DetailItem = {
  name: string;
  quantity: number;
  units: string;
};

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<DetailItem | null>(null);
  const [movements, setMovements] = useState<InventoryMovementRead[] | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const item = await inventoryClient.getInventoryItemById(Number(id));

      const mappedItem: DetailItem = {
        name: item.itemType === "RAW"
          ? item.rawMaterial!.name
          : item.product!.name,
        quantity: item.quantity,
        units: item.itemType === "RAW"
          ? item.rawMaterial!.unit.name
          : item.product!.unit.name,
      };

      if (!mounted) return;
      setItem(mappedItem);
      setMovements(item.inventoryMovements);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (movements === null) return null;
  if (!item) return <p>Producto no encontrado</p>;

  const formatMovedAt = (movedAt: string) => {
    const date = new Date(movedAt);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }

  return (
    <div className={styles.wrapper}>
      <XuchilHeader />
      <h1 className={styles.title}>
        {item.name}
      </h1>
      <p className={styles.subtitle}>
        En inventario: <strong>{item.quantity} {item.units}</strong>
      </p>
      <DynamicTable columns={[
        {key: "direction", label: "Dirección"},
        {key: "quantity", label: "Cantidad"},
        {key: "reason", label: "Motivo"},
        {key: "movedAt", label: "Fecha"},
        {key: "note", label: "Nota"},
      ]} data={
        movements.map(m => ({
          direction: (m.quantityChange > 0 ? "IN" : "OUT"),
          quantity: Math.abs(m.quantityChange).toString(),
          reason: m.reason,
          movedAt: formatMovedAt(m.movedAt),
          note: m.note ?? "",
        }))
      }
      />
    </div>
  );
}
