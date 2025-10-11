"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import BottomButton from "@/components/BottomButton";
import TextField from "@/components/TextField";
import styles from "./NewProduct.module.css";
import { Product } from "@/types/Product";

const NewProductPage = () => {
  const [name, setName] = useState("");
  const [presentation, setPresentation] = useState("");
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [units, setUnits] = useState("unidades");

  const [categoryId, setCategoryId] = useState<string>("");
  const [variantId, setVariantId] = useState<string>("");

  const router = useRouter();

  const handleSubmit = () => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name,
      presentation,
      image,
      quantity,
      units,
      categoryId,
      variantId,
    };

    console.table(newProduct);

    // Aquí podrías hacer un POST a tu API
    router.replace("/products"); 
  };

  return (
    <div className={styles.wrapper}>
      <HeaderXuchil />

      <h1 className={styles.title}>Nuevo Producto</h1>

      <h3 className={styles.fieldLabel}>Nombre:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="Ej. Galletas de avena"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <h3 className={styles.fieldLabel}>Presentación:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="Ej. Bolsa de 500 g"
          value={presentation}
          onChange={(e) => setPresentation(e.target.value)}
        />
      </div>

      <h3 className={styles.fieldLabel}>Imagen (URL):</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="https://ejemplo.com/imagen.jpg"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
      </div>

      <h3 className={styles.fieldLabel}>Cantidad disponible:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="Cantidad"
          value={quantity.toString()}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <h3 className={styles.fieldLabel}>Unidades:</h3>
      <div className={`${styles.fieldContainer} ${styles.centeredControl}`}>
        <select
          className={styles.select}
          value={units}
          onChange={(e) => setUnits(e.target.value)}
        >
          <option value="unidades">Unidades</option>
          <option value="kg">Kilogramos (kg)</option>
          <option value="g">Gramos (g)</option>
          <option value="L">Litros (L)</option>
          <option value="ml">Mililitros (ml)</option>
        </select>
      </div>

      <h3 className={styles.fieldLabel}>Categoría:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="ID o nombre de categoría"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
      </div>

      <h3 className={styles.fieldLabel}>Variante:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="ID o nombre de variante"
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
        />
      </div>

      <BottomButton onClick={handleSubmit}>Registrar producto</BottomButton>
    </div>
  );
};

export default NewProductPage;
