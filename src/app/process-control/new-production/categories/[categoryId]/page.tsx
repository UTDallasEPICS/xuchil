"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import ImageCard from "@/components/ImageCard";
import styles from "./ProductDetail.module.css";
import {ProductRead} from "@/lib/schemas";
import productClient from "@/lib/services/productClient";

const ProductDetailPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState<ProductRead[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const data = (
          await productClient.getAllProducts()
      ).filter(p => p.categoryId == Number(categoryId))
      if (!mounted) return;

      setProducts(data);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  if (!products || products.length === 0) {
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
        {products.map((product) => (
          <ImageCard
            key={product.id}
            imageSrc={product.imgUrl ?? '/globe.svg'}
            text={product.name}
            type="small"
            route={`/process-control/new-production/products/${product.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductDetailPage;
