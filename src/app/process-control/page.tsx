"use client";
import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import styles from "./ProcessControl.module.css";

const ProcessControl = () => {
  return (
    <div className="page">
      <HeaderXuchil/>
      <h1>Control de procesos</h1>
      <div className={styles.container}>
        <ImageCard imageSrc="/globe.svg" text="Nueva producción" type="large" />
        <ImageCard imageSrc="/globe.svg" text="Tareas pendientes" type="large" />
      </div>
    </div>
  );
};

export default ProcessControl;
  