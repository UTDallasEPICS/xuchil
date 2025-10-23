"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeaderXuchil from "@/components/HeaderXuchil";
import BottomButton from "@/components/BottomButton";
import TextField from "@/components/TextField";
import styles from "./NewRawMaterial.module.css";
import { RawMaterial } from "@/types/RawMaterial";

const NewRawMaterialPage = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState<number>(0);
  const [units, setUnits] = useState<RawMaterial["units"]>("kg");

  const router = useRouter();

  const handleSubmit = () => {
    const newRawMaterial: RawMaterial = {
      id: crypto.randomUUID(),
      name,
      image,
      stock,
      units,
    };

    console.table(newRawMaterial);

    // Aquí podrías hacer un POST a tu API
    router.replace("/raw-materials"); 
  };

  return (
    <div className={styles.wrapper}>
      <HeaderXuchil />

      <h1 className={styles.title}>Nueva Materia Prima</h1>

      <h3 className={styles.fieldLabel}>Nombre:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="Ej. Harina de trigo"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

      <h3 className={styles.fieldLabel}>Stock disponible:</h3>
      <div className={styles.fieldContainer}>
        <TextField
          placeholder="Cantidad"
          value={stock.toString()}
          onChange={(e) => setStock(Number(e.target.value))}
        />
      </div>

      <h3 className={styles.fieldLabel}>Unidades:</h3>
      <div className={`${styles.fieldContainer} ${styles.centeredControl}`}>
        <select
          className={styles.select}
          value={units}
          onChange={(e) => setUnits(e.target.value as RawMaterial["units"])}
        >
          <option value="kg">Kilogramos (kg)</option>
          <option value="g">Gramos (g)</option>
          <option value="L">Litros (L)</option>
          <option value="ml">Mililitros (ml)</option>
          <option value="unidades">Unidades</option>
        </select>
      </div>

      <BottomButton onClick={handleSubmit}>Registrar materia prima</BottomButton>
    </div>
  );
};

export default NewRawMaterialPage;
