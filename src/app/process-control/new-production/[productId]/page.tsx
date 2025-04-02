"use client";

import { useParams } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import ImageCard from "@/components/ImageCard";
import { fetchProductVariants } from "@/constants/api";
import styles from "./ProductDetail.module.css";

const ProductDetailPage = () => {
  const { productId } = useParams();

  const productVariants = fetchProductVariants(productId as string);

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
            route={`/process-control/new-production/${productId}/${variant.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductDetailPage;
