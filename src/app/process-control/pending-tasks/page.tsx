"use client";

import React, { useEffect, useState } from "react";
import ImageCard from "@/components/ImageCard";
import HeaderXuchil from "@/components/HeaderXuchil";
import { fetchProducts } from "@/constants/api";
import styles from "./PendingTasks.module.css";
import PendingTaskCard from "@/components/PendingTaskCard";

const PendingTasksPage = () => {
  const [products, setProducts] = useState<{ id: string; name: string; imageSrc: string }[]>([]);

  useEffect(() => {
    const data = fetchProducts(); 
    setProducts(data);
  }, []);

  return (
    <div className="page">
      <HeaderXuchil />
      <h1>Tareas Pendientes</h1>
      
      <div className={styles.container}>
        <PendingTaskCard
            productName="Harina de Mezquite"
            startDate="13/02/2025"
            startedBy="Antonio López"
            currentStep="Tatemado (Mezquite 5kg)"
            currentStepNumber={2}
            totalSteps={7}
        />
      </div>
    </div>
  );
};

export default PendingTasksPage;
