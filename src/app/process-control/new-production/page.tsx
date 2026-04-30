"use client";

import React, { useEffect, useState } from "react";
import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import styles from "./NewProduction.module.css";
import productClient from "@/lib/services/productClient";
import {ProductCategoryRead} from "@/lib/schemas";

const NewProductionPage = () => {
  const [productCategories, setProductCategories] = useState<ProductCategoryRead[] | null>(null);

  useEffect(() => {
    async function load() {
      const categories = await productClient.getAllProductCategories();
      setProductCategories(categories);
    }
    load();
  }, []);

  if (productCategories === null) return null;

  return (
    <div className="page">
      <HeaderXuchil />
      <h1>¿Qué producto haremos hoy?</h1>
      
      <div className={styles.container}>
        {productCategories.map((category) => (
          <ImageCard
            key={category.id}
            imageSrc={category.imgUrl ?? '/globe.svg'}
            text={category.name}
            type="square"
            route={`/process-control/new-production/${category.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default NewProductionPage;
