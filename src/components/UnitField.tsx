import React from "react";
import styles from "@/styles/UnitField.module.css";

interface UnitFieldProps {
  titulo?: string;
  cantidad: number | string;
  unidad: string;
}

const UnitField: React.FC<UnitFieldProps> = ({ titulo, cantidad, unidad }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.base}>
        {titulo ? (
          <span className={styles.label}>{titulo}</span>
        ) : (
          <span className={styles.label}>{cantidad}</span>
        )}
        <div className={styles.overlay}>
          {titulo ? `${cantidad} ${unidad}` : unidad}
        </div>
      </div>
    </div>
  );
};

export default UnitField;
