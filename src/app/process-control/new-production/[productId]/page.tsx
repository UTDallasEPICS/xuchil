"use client";

import { useParams } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import styles from "./ProductDetail.module.css";

const productInfo: Record<string, { title: string; description: string }> = {
  harinas: {
    title: "Harinas",
    description: "Aquí manejarías las distintas harinas disponibles...",
  },
  galletas: {
    title: "Galletas",
    description: "Información sobre la producción de galletas...",
  },
  frijol: {
    title: "Frijol",
    description: "Proceso para trabajar con frijol...",
  },
  cafe: {
    title: "Sustituto de café",
    description: "Información sobre el sustituto de café...",
  },
};

const ProductDetailPage = () => {
  const { productId } = useParams();

  const product = productInfo[productId as string];

  if (!product) {
    return (
      <div className="page">
        <HeaderXuchil />
        <h1>Producto no encontrado</h1>
      </div>
    );
  }

  return (
    <div className="page">
      <HeaderXuchil />
      <h1>{product.title}</h1>
      <p className={styles.description}>{product.description}</p>
    </div>
  );
};

export default ProductDetailPage;
