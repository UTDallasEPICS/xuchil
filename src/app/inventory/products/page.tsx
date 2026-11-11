"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import HeaderNavigator from "@/components/HeaderNavigator";
import FilterButton from "@/components/FilterButton";
import { inventoryTabs } from "@/constants/navTabs";
import { inventorySortOptions } from "@/constants/filterOptions";
import { FilterOption } from "@/types/FilterOption";
import styles from "../InventoryPage.module.css";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type InventoryProductRow = {
    id: number;
    name: string;
    image: string;
    presentation: string;
    quantity: number;
    units: string;
};

interface InventoryLot {
    qtyOnHand?: number | string | null;
    unit?: { name?: string | null } | null;
}

interface ProductInventoryItem {
    id: number;
    inventoryLots?: InventoryLot[];
    productVariant?: {
        imageUrl?: string | null;
        name?: string | null;
        presentation?: string | null;
        defaultUnit?: { name?: string | null } | null;
        product?: { name?: string | null } | null;
    } | null;
}

export default function ProductsInventoryPage() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<InventoryProductRow[]>([]);
    const [sort, setSort] = useState<FilterOption>(inventorySortOptions[0]);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        async function load() {
            const response = await fetch("/api/inventory/summary?item_type=PRODUCT", { credentials: "include" });
            if (!response.ok) return;
            const data: ProductInventoryItem[] = await response.json();
            if (!mounted) return;

            const mapped = data.map((item) => {
                const qty = (item.inventoryLots || []).reduce(
                    (sum, lot) => sum + Number(lot.qtyOnHand || 0),
                    0
                );
                const units =
                    item.productVariant?.defaultUnit?.name ||
                    item.inventoryLots?.[0]?.unit?.name ||
                    "";

                return {
                    id: item.id,
                    name: item.productVariant?.product?.name ?? "Producto",
                    image: item.productVariant?.imageUrl ?? "/globe.svg",
                    presentation: item.productVariant?.name ?? item.productVariant?.presentation ?? "",
                    quantity: qty,
                    units,
                };
            });

            setProducts(mapped);
        }

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const visible = useMemo(() => {
        const term = search.trim().toLowerCase();
        const list = products.filter((item) =>
            item.name.toLowerCase().includes(term)
        );

        return [...list].sort((a, b) => {
            if (sort.value === "qty-desc") return Number(b.quantity) - Number(a.quantity);
            if (sort.value === "qty-asc") return Number(a.quantity) - Number(b.quantity);
            return a.name.localeCompare(b.name, "es");
        });
    }, [products, search, sort]);

    return (
        <div className={styles.wrapper}>
            <h1 className={styles.title}>Inventario</h1>

            <HeaderNavigator tabs={inventoryTabs} variant="full" />

            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <Search size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar elementos"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <FilterButton
                    title="Ordenar"
                    options={inventorySortOptions}
                    onChange={setSort}
                    variant="outline"
                />
            </div>

            <div className={styles.cardList}>
                {visible.map((item) => (
                    <ProductCard
                        photo={item.image}
                        key={item.id}
                        {...item}
                        onClick={() => router.push(`/inventory/details/${item.id}`)}
                    />
                ))}

                {visible.length === 0 && (
                    <p className={styles.noResults}>
                        Ningún producto coincide con la búsqueda.
                    </p>
                )}

                <button
                    type="button"
                    className={styles.addBtn}
                    onClick={() => router.push("/inventory/new-product")}
                >
                    <Plus size={20} strokeWidth={2.5} />
                    <span>Añadir producto</span>
                </button>
            </div>
        </div>
    );
}
