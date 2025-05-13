"use client";

import { useState } from "react";
import BottomButton from "@/components/BottomButton";
import ProductCard from "@/components/ProductCard";
import styles from "../InventoryPage.module.css";
import { fetchProducts } from "@/constants/api";
import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductsInventoryPage() {
    const [search, setSearch] = useState("");
    const router = useRouter();
    const products = fetchProducts();

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

            <BottomButton onClick={() => alert("Registrar nuevo producto")}>
                Añadir Registro
            </BottomButton>
        </div>
    );
}
