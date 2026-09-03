"use client";

import { useEffect, useState } from "react";
import BottomButton from "@/components/BottomButton";
import ProductCard from "@/components/ProductCard";
import styles from "../InventoryPage.module.css";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

type InventoryRawRow = {
  id: number;
  name: string;
  image: string;
  quantity: number;
  units: string;
};

export default function RawInventoryPage() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<InventoryRawRow[]>([]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const loadRawMaterials = async () => {
      try {
        const res = await fetch("/api/rawmaterials", {
          credentials: "include",
        });

        if (!res.ok) throw new Error(await res.text());

        const data = await res.json();

        if (!mounted) return;

        const mapped = data
          .filter((item: any) => item.inventoryItem?.itemType === "RAW")
          .map((item: any) => {
            const quantity = Number(item.inventoryItem?.quantity ?? 0);

            return {
              id: item.inventoryItem.id,
              name: item.name,
              image: item.imgUrl ?? "/globe.svg",
              quantity,
              units: item.unit?.name ?? "—",
            };
          });

        setProducts(mapped);
      } catch (err) {
        console.error("Failed to load raw materials", err);
      }
    };

    void loadRawMaterials();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = products.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchBar}>
        <div className={styles.searchBarInner}>
          <Search size={24} color="#4a6548" />

          <input
            type="text"
            placeholder="Buscar elementos"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <SlidersHorizontal size={24} color="#4a6548" />
        </div>
      </div>

      <div className={styles.cardList}>
        {filtered.map((item) => (
          <ProductCard
            photo={item.image}
            key={item.id}
            {...item}
            onClick={() => router.push(`/inventory/details/${item.id}`)}
          />
        ))}
      </div>

      <BottomButton onClick={() => router.push(`/inventory/new-raw-material`)}>
        Añadir Registro
      </BottomButton>
    </div>
  );
}
