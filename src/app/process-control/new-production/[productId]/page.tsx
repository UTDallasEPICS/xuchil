"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import ImageCard from "@/components/ImageCard";
import { ProductVariant } from "@/types/ProductVariant";
import styles from "./ProductDetail.module.css";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const response = await fetch(`/api/product-variants?product_id=${productId}`, { credentials: "include" });
      if (!response.ok) return;
      const data = await response.json();
      if (!mounted) return;

      setProductVariants(
        data.map((variant: any) => ({
          id: String(variant.id),
          name: variant.name,
          imageSrc: variant.imageUrl || "/globe.svg",
        }))
      );
    }

    load();

    return () => {
      mounted = false;
    };
  }, [productId]);

  if (!productVariants || productVariants.length === 0) {
    return (
      <div className="page">
        <HeaderXuchil />
        <h1>Producto no encontrado o sin variantes</h1>
      </div>
    );
  }

  return (
    <div className="page">
      <HeaderXuchil />
      <h1>Elige el tipo de producto en el que vas a trabajar...</h1>
      <div className={styles.container}>
        {productVariants.map((variant) => (
          <ImageCard
            key={variant.id}
            imageSrc={variant.imageSrc}
            text={variant.name}
            type="small"
            route={`/process-control/new-production/${productId}/${variant.id}/1`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductDetailPage;
