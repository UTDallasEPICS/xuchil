"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import styles from "@/styles/QuantityPicker.module.css";

interface QuantityPickerProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const QuantityPicker: React.FC<QuantityPickerProps> = ({
  value,
  onChange,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
  step = 1,
  disabled = false,
}) => {
  const canDec = !disabled && value - step >= min;
  const canInc = !disabled && value + step <= max;

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.button} ${styles.squareLeft}`}
        onClick={() => canDec && onChange(value - step)}
        disabled={!canDec}
        aria-label="Decrementar"
      >
        <Minus size={15} strokeWidth={3} />
      </button>

      <span className={styles.value}>{value}</span>

      <button
        type="button"
        className={`${styles.button} ${styles.squareRight}`}
        onClick={() => canInc && onChange(value + step)}
        disabled={!canInc}
        aria-label="Incrementar"
      >
        <Plus size={15} strokeWidth={3} />
      </button>
    </div>
  );
};

export default QuantityPicker;
