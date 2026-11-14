"use client";

import { useEffect, useState } from "react";
import ImageCard from "@/components/ImageCard";
import styles from "./NewProduction.module.css";

type ProductCategory = {
  id: number | string;
  name: string;
  imageUrl?: string | null;
};

type ProductCardItem = {
  id: string;
  name: string;
  imageSrc: string;
};

const FALLBACK_IMAGE = "/globe.svg";

const NewProductionPage = () => {
  const [products, setProducts] = useState<ProductCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const response = await fetch("/api/product-categories", { credentials: "include" });

        if (!response.ok) {
          if (mounted) {
            setProducts([]);
          }
          return;
        }

        const data: unknown = await response.json();

        if (!Array.isArray(data) || !mounted) {
          return;
        }

        const validProducts = data
          .filter((item): item is ProductCategory =>
            !!item &&
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            "name" in item &&
            typeof (item as ProductCategory).name === "string"
          )
          .map((category) => ({
            id: String(category.id),
            name: category.name.trim(),
            imageSrc: category.imageUrl?.trim() || FALLBACK_IMAGE,
          }))
          .filter((product) => product.name.length > 0);

        if (mounted) {
          setProducts(validProducts);
        }
      } catch (error) {
        console.error("Failed to load product categories:", error);
        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page">
      <h1>¿Qué producto haremos hoy?</h1>

      {isLoading ? (
        <p>Cargando productos...</p>
      ) : products.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
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
      )}
    </div>
  );
};

export default NewProductionPage;
