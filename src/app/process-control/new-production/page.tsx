"use client";

import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import styles from "./NewProduction.module.css";

const NewProductionPage = () => {
  return (
    <div className="page">
      <HeaderXuchil />
      <h1>¿Qué producto haremos hoy?</h1>
      
      <div className={styles.container}>
        <ImageCard imageSrc="/harina.svg" text="Harinas" type="square" />
        <ImageCard imageSrc="/galletas.svg" text="Galletas" type="square" />
        <ImageCard imageSrc="/frijol.svg" text="Frijol" type="square" />
        <ImageCard imageSrc="/cafe.svg" text="Sustituto de café" type="square" />
      </div>
    </div>
  );
};

export default NewProductionPage;
