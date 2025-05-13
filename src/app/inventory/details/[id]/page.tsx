"use client";

import { useParams } from "next/navigation";
import XuchilHeader from "@/components/HeaderXuchil";
import DynamicTable from "@/components/DynamicTable";
import { fetchProducts, fetchRawMaterials } from "@/constants/api";
import { movementColumns, movementData} from "@/constants/tableData";
import styles from "./DetailPage.module.css";

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();

  const allItems = [...fetchProducts(), ...fetchRawMaterials()];
  const item = allItems.find((p) => p.id === id);

  if (!item) return <p>Producto no encontrado</p>;

  const movimientos = movementData.filter((m) => m.productId === id);

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
