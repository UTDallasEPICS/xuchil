"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import UnitField from "@/components/UnitField";
import TextField from "@/components/TextField";
import BottomButton from "@/components/BottomButton";
import styles from "./ProcessResults.module.css"; 
import HeaderXuchil from "@/components/HeaderXuchil";

const ProcessResultsPage: React.FC = () => {
  const [productQty, setProductQty] = useState("");
  const [wasteQty, setWasteQty] = useState("");
  const [observations, setObservations] = useState("");

  const router = useRouter();

  const handleFinishProcess = () => {
    // TODO: Implement insertion into Inventory Table
    router.push("/inventory");
  };

  return (
    <div className={`page ${styles.container}`}>
        <HeaderXuchil />
        <h1>Resultados</h1>
        <h2>Producto:</h2>
        <UnitField
        value={productQty}
        onChange={setProductQty}
        unit="Kg"
        />
        <h2>Merma:</h2>
        <UnitField
        value={wasteQty}
        onChange={setWasteQty}
        unit="Kg"
        />
        <h2>Observaciones:</h2>
        <TextField
        placeholder="Escribe tus observaciones aquí..."
        value={observations}
        onChange={(e) => setObservations(e.target.value)}
        />
        <BottomButton onClick={handleFinishProcess}>
        Siguiente
        </BottomButton>
    </div>
  );
};

export default ProcessResultsPage;
