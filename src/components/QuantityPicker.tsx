"use client";

import React, { useEffect, useState } from "react";
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
  // Text being typed; may be temporarily empty or out of range while editing.
  const [draft, setDraft] = useState(String(value));

  // Keep the field in sync when the value changes from outside (buttons, parent).
  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const canDec = !disabled && value - step >= min;
  const canInc = !disabled && value + step <= max;

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    // Only allow digits (quantities are whole, non-negative numbers).
    if (!/^\d*$/.test(text)) return;
    setDraft(text);

    const parsed = parseInt(text, 10);
    if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  // On blur, settle on a valid value: clamp out-of-range input, restore if empty.
  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = clamp(parsed);
    setDraft(String(next));
    if (next !== value) onChange(next);
  };

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

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className={styles.value}
        value={draft}
        onChange={handleInput}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // don't submit the order form
            e.currentTarget.blur();
          }
        }}
        onFocus={(e) => e.currentTarget.select()}
        disabled={disabled}
        aria-label="Cantidad"
      />

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
