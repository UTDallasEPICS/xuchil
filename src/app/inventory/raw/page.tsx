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

type InventoryRawRow = {
  id: number;
  name: string;
  image: string;
  presentation: string;
  quantity: number;
  units: string;
  note?: string;
};

interface RawInventoryItem {
    id: number;
    inventoryLots?: Array<{
        qtyOnHand?: number | string | null;
        unit?: { name?: string | null } | null;
    }>;
    rawMaterial?: {
        id?: number;
        name?: string | null;
        imageUrl?: string | null;
        defaultUnit?: { name?: string | null } | null;
    } | null;
}

interface AvailabilityEntry {
    rawMaterialId: number;
    defaultUnitFactor?: number;
    reservedBase: number;
    availableInDefaultUnit?: number;
}

const formatQty = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.?0+$/, "");

export default function RawInventoryPage() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<InventoryRawRow[]>([]);
    const [sort, setSort] = useState<FilterOption>(inventorySortOptions[0]);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        async function load() {
            const [summaryRes, availabilityRes] = await Promise.all([
                fetch("/api/inventory/summary?item_type=RAW", { credentials: "include" }),
                fetch("/api/raw-materials/availability", { credentials: "include" }),
            ]);
            if (!summaryRes.ok) return;
            const data: RawInventoryItem[] = await summaryRes.json();
            if (!mounted) return;

            const availabilityByMaterial = new Map<number, AvailabilityEntry>();
            if (availabilityRes.ok) {
                const availability: AvailabilityEntry[] = await availabilityRes.json();
                for (const entry of availability) {
                    availabilityByMaterial.set(entry.rawMaterialId, entry);
                }
            }

            const mapped = data.map((item) => {
                const qty = (item.inventoryLots || []).reduce(
                    (sum, lot) => sum + Number(lot.qtyOnHand || 0),
                    0
                );
                const units =
                    item.rawMaterial?.defaultUnit?.name ||
                    item.inventoryLots?.[0]?.unit?.name ||
                    "";

                const rawMaterialId = item.rawMaterial?.id;
                const availability = rawMaterialId === undefined
                    ? undefined
                    : availabilityByMaterial.get(rawMaterialId);
                let note: string | undefined;
                if (availability) {
                    const factor = availability.defaultUnitFactor || 1;
                    const reserved = factor > 0 ? availability.reservedBase / factor : availability.reservedBase;
                    const available = availability.availableInDefaultUnit ?? 0;
                    if (reserved > 0) {
                        note = `Apartado: ${formatQty(reserved)} ${units} · Disponible: ${formatQty(available)} ${units}`;
                    }
                }

                return {
                    id: item.id,
                    name: item.rawMaterial?.name ?? "Materia prima",
                    image: item.rawMaterial?.imageUrl ?? "/globe.svg",
                    presentation: "",
                    quantity: qty,
                    units,
                    note,
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
                        Ninguna materia prima coincide con la búsqueda.
                    </p>
                )}

                <button
                    type="button"
                    className={styles.addBtn}
                    onClick={() => router.push("/inventory/new-raw-material")}
                >
                    <Plus size={20} strokeWidth={2.5} />
                    <span>Añadir materia prima</span>
                </button>
            </div>
        </div>
    );
}
