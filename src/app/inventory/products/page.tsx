"use client";

import { useEffect, useState } from "react";
import BottomButton from "@/components/BottomButton";
import ProductCard from "@/components/ProductCard";
import styles from "../InventoryPage.module.css";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import inventoryClient from "@/lib/services/inventoryClient";

type InventoryProductRow = {
    id: number;
    name: string;
    image: string;
    quantity: number;
    units: string;
};

export default function ProductsInventoryPage() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<InventoryProductRow[]>([]);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        async function load() {
            const productItems = await inventoryClient.getAllInventoryItems({ itemType: "PRODUCT" });
            if (!mounted) return;

            const mapped = productItems.map((item) => {
                const qty = item.inventoryLots.reduce(
                    (sum: number, lot) => sum + Number(lot.quantity),
                    0
                );
                return {
                    id: item.id,
                    name: item.product!.name,
                    image: item.product!.imgUrl ?? "/globe.svg",
                    quantity: qty,
                    units: item.product!.unit.name,
                };
            });

            setProducts(mapped);
        }
        load();
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
                    <ProductCard photo={item.image} key={item.id} {...item} onClick={() => router.push(`/inventory/details/${item.id}`)}/>
                ))}
            </div>

            <BottomButton onClick={() => router.push(`/inventory/new-product`)}>
                Añadir Registro
            </BottomButton>
        </div>
    );
}
