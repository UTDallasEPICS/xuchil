import React from "react";
import styles from "@/styles/UnitField2.module.css";

interface UnitFieldProps {
  titulo?: string;
  cantidad: number | string;
  unidad: string;
}

const UnitField: React.FC<UnitFieldProps> = ({ titulo, cantidad, unidad }) => {
  const hasTitle = !!titulo;

  return (
    <div
      className={`${styles.wrapper} ${
        hasTitle ? styles.conTitulo : styles.sinTitulo
      }`}
    >
      <div className={styles.base}>
        <span className={styles.label}>
          {hasTitle ? titulo : cantidad}
        </span>
        <div className={styles.overlay}>
          {hasTitle ? `${cantidad} ${unidad}` : unidad}
        </div>
      </div>
    </div>
  );
};

export default UnitField;
