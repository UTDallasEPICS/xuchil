"use client";

import React from "react";
import styles from "../styles/UnitField.module.css";

interface UnitFieldProps {
  value: string;
  onChange: (val: string) => void;
  unit: string;
}

const UnitField: React.FC<UnitFieldProps> = ({ value, onChange, unit }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.unitField}>
      <input
        type="number"
        className={styles.unitInput}
        value={value}
        onChange={handleChange}
      />
      <div className={styles.unitBox}>
        {unit}
      </div>
    </div>
  );
};

export default UnitField;
