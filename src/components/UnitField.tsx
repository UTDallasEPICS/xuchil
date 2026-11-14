"use client";

import React from "react";
import styles from "../styles/UnitField.module.css";

interface UnitFieldProps {
  value: string;
  onChange: (val: string) => void;
  unit: string;
  id?: string;
  placeholder?: string;
  block?: boolean;
}

const UnitField: React.FC<UnitFieldProps> = ({
  value,
  onChange,
  unit,
  id,
  placeholder,
  block = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`${styles.unitField} ${block ? styles.block : ""}`}>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        className={styles.unitInput}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
      />
      <div className={styles.unitBox}>{unit}</div>
    </div>
  );
};

export default UnitField;
