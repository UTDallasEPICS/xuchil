"use client";

import React, { useEffect, useState } from "react";
import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import { fetchProductCategories } from "@/constants/api";
import styles from "./NewProduction.module.css";

const NewProductionPage = () => {
  const [products, setProducts] = useState<{ id: string; name: string; imageSrc: string }[]>([]);

  useEffect(() => {
    const data = fetchProductCategories(); 
    setProducts(data);
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
