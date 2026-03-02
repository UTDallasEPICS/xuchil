"use client";

import React, { useEffect, useState } from "react";
import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import styles from "./NewProduction.module.css";

const NewProductionPage = () => {
  const [products, setProducts] = useState<{ id: string; name: string; imageSrc: string }[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const response = await fetch("/api/product-categories", { credentials: "include" });
      if (!response.ok) return;
      const data = await response.json();
      if (!mounted) return;

      setProducts(
        data.map((category: any) => ({
          id: String(category.id),
          name: category.name,
          imageSrc: category.imageUrl || "/globe.svg",
        }))
      );
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page">
      <HeaderXuchil />
      <h1>¿Qué producto haremos hoy?</h1>
      
      <div className={styles.container}>
        {products.map((product) => (
          <ImageCard
            key={product.id}
            imageSrc={product.imageSrc}
            text={product.name}
            type="square"
            route={`/process-control/new-production/${product.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewProductionPage;
